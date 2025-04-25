const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Corretor, Correspondente, Administrador, Token } = require('../models');
const { Op } = require('sequelize');
const argon2 = require('argon2');

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || 'your_jwt_refresh_secret_key';

// Definir o diretório de upload como backend/Uploads
const UPLOAD_DIR = path.resolve(__dirname, '../Uploads'); // Resolve para backend/Uploads

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userRole = req.user.role.toLowerCase(); // Obtém o papel do usuário
    const dir = path.join(UPLOAD_DIR, `imagem_${userRole}`); // Subdiretório baseado no papel

    // Verifica se o diretório existe; caso contrário, cria
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir); // Define o diretório de destino
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Nome do arquivo com timestamp
  },
});

const upload = multer({ storage });

// Função para buscar o usuário em todas as tabelas
const findUserByEmail = async (email) => {
  let user = await Corretor.findOne({ where: { email } });
  if (user) return { user, role: 'corretor' };

  user = await Correspondente.findOne({ where: { email } });
  if (user) return { user, role: 'Correspondente' };

  user = await Administrador.findOne({ where: { email } });
  if (user) return { user, role: 'Administrador' };

  return null;
};

// Middleware para autenticar o token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenRecord = await Token.findOne({ where: { token } });
    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: 'Falha na autenticação do token' });
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Função para gerar tokens JWT
const generateToken = (user, role, secretKey, expiresIn) => {
  return jwt.sign({ email: user.email, role, userId: user.id }, secretKey, { expiresIn });
};

// Rota de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validação de entrada
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await findUserByEmail(email);

    if (!result) {
      console.warn('Usuário não encontrado:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { user, role } = result;

    // Decodifica a senha armazenada em Base64
    const decodedPassword = Buffer.from(user.password, 'base64').toString();

    // Comparar a senha recebida (texto claro) com a senha armazenada (decodificada)
    const isPasswordValid = decodedPassword === password;

    if (!isPasswordValid) {
      console.warn('Senha inválida para o usuário:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar tokens
    const token = generateToken(user, role, SECRET_KEY, '1h');
    const refreshToken = generateToken(user, role, REFRESH_SECRET_KEY, '7d');

    // Salvar tokens no banco de dados
    await Token.upsert({
      token,
      refreshToken,
      userId: user.id,
      userType: role,
      expiresAt: new Date(Date.now() + 3600000), // Expira em 1 hora
      email: user.email || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Login bem-sucedido:', { email, role });
    return res.json({ token, refreshToken, role });
  } catch (error) {
    console.error('Erro ao autenticar o usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para refresh de token
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: 'Refresh token não fornecido' });

  try {
    const tokenRecord = await Token.findOne({ where: { refreshToken } });
    if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
      return res.status(403).json({ message: 'Refresh token inválido ou expirado' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: 'Falha na autenticação do refresh token' });

      const newToken = generateToken(user, user.role, SECRET_KEY, '1h');
      return res.json({ token: newToken });
    });
  } catch (error) {
    console.error('Erro ao verificar o refresh token:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para validar o token
router.post('/validate-token', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// Rota para obter informações do usuário autenticado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const result = await findUserByEmail(email);

    if (result) {
      const { user, role } = result;
      return res.json({ ...user.toJSON(), role });
    }

    res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (error) {
    console.error('Erro ao obter detalhes do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para buscar informações do usuário pelo email
router.get('/users/:email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.params;
    const result = await findUserByEmail(email);

    if (result) {
      return res.json(result.user);
    }

    res.status(404).json({ message: 'Usuário não encontrado' });
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para atualizar informações do usuário
router.put('/users/:email', authenticateToken, upload.single('photo'), async (req, res) => {
  const { email } = req.params;
  const { first_name, last_name, telefone, creci, address, pix_account, password } = req.body;

  try {
    const result = await findUserByEmail(email);

    if (!result) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const { user } = result;

    // Atualiza as informações do usuário
    await user.update({
      first_name,
      last_name,
      telefone,
      creci,
      address,
      pix_account,
      photo: req.file ? path.join(`imagem_${user.role.toLowerCase()}`, req.file.filename) : user.photo,
    });

    // Atualiza a senha se for fornecida
    if (password) {
      // Converte a nova senha para Base64
      user.password = Buffer.from(password).toString('base64');
      await user.save();
    }

    return res.json({ message: 'Informações do usuário atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar informações do usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para logout
router.post('/logout', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    await Token.destroy({ where: { token } });
    return res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = { router, authenticateToken };