const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');  // Add bcryptjs
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, Token } = require('../models');
const { Op } = require('sequelize');

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || 'your_jwt_refresh_secret_key';
const UPLOAD_DIR = path.resolve(__dirname, '../Uploads');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userRole = req.user?.role?.toLowerCase() || 'user';
    const dir = path.join(UPLOAD_DIR, `imagem_${userRole}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Helper function to determine user role
const getUserRole = (user) => {
  if (user.is_administrador) return 'Administrador';
  if (user.is_corretor) return 'Corretor';
  if (user.is_correspondente) return 'Correspondente';
  return 'User';
};

// JWT token authentication middleware
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

// Generate JWT tokens
const generateTokens = (user, role) => {
  const payload = {
    id: user.id,
    email: user.email,
    role,
    is_corretor: user.is_corretor,
    is_correspondente: user.is_correspondente,
    is_administrador: user.is_administrador
  };

  return {
    token: jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }),
    refreshToken: jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: '7d' })
  };
};

// Helper function to calculate expiration date
const getExpirationDate = (minutes) => {
  return new Date(Date.now() + minutes * 60000);
};

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Use bcrypt to compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const role = getUserRole(user);
    const { token, refreshToken } = generateTokens(user, role);

    // Create or update token with all required fields
    await Token.upsert({
      token,
      refresh_token: refreshToken,
      user_id: user.id,
      user_type: role,
      expires_at: getExpirationDate(60), // Token expires in 60 minutes
      email: user.email,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role,
        first_name: user.first_name,
        last_name: user.last_name,
        is_corretor: user.is_corretor,
        is_correspondente: user.is_correspondente,
        is_administrador: user.is_administrador
      }
    });
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const role = getUserRole(user);
    res.json({
      ...user.toJSON(),
      role
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Update user profile - Modified to use bcrypt
router.put('/users/:email', authenticateToken, upload.single('photo'), async (req, res) => {
  const { email } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (updateData.password) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    if (req.file) {
      const role = getUserRole(user).toLowerCase();
      updateData.photo = path.join(`imagem_${role}`, req.file.filename);
    }

    await user.update(updateData);
    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Logout route
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    await Token.destroy({ where: { token } });
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = { router, authenticateToken };