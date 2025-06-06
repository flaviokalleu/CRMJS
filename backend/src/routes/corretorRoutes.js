const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { Op } = require('sequelize');
const authenticateToken = require('../middleware/authMiddleware');
const formidable = require('formidable');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads/corretor');

// Garante que o diretório existe
fs.mkdir(uploadDir, { recursive: true });

const validateCorretorData = (data) => {
  const errors = [];
  const username = Array.isArray(data.username) ? data.username[0] : data.username;
  const email = Array.isArray(data.email) ? data.email[0] : data.email;
  const first_name = Array.isArray(data.first_name) ? data.first_name[0] : data.first_name;
  const last_name = Array.isArray(data.last_name) ? data.last_name[0] : data.last_name;
  const telefone = Array.isArray(data.telefone) ? data.telefone[0] : data.telefone;
  const password = Array.isArray(data.password) ? data.password[0] : data.password;

  if (!username || username.trim().length < 3) errors.push('Username deve ter pelo menos 3 caracteres');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email deve ser válido');
  if (!first_name || first_name.trim().length < 2) errors.push('Nome deve ter pelo menos 2 caracteres');
  if (!last_name || last_name.trim().length < 2) errors.push('Sobrenome deve ter pelo menos 2 caracteres');
  if (!telefone || telefone.trim().length < 10) errors.push('Telefone deve ter pelo menos 10 dígitos');
  if (!password || password.length < 6) errors.push('Senha deve ter pelo menos 6 caracteres');
  return errors;
};

// ==================== ROTAS ====================

// GET /corretor/me - Obter dados do corretor logado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const corretor = await User.findOne({
      where: { 
        id: req.user.id, 
        is_corretor: true 
      },
      attributes: [
        'id', 'username', 'email', 'first_name', 'last_name',
        'creci', 'address', 'pix_account', 'telefone', 'photo',
        'created_at'
      ]
    });

    if (!corretor) {
      return res.status(404).json({
        success: false,
        message: 'Corretor não encontrado'
      });
    }

    res.json({
      success: true,
      data: corretor
    });

  } catch (error) {
    console.error('❌ Erro ao buscar corretor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /corretor - Criar novo corretor usando formidable (apenas upload, sem tratar imagem)
router.post('/', async (req, res) => {
  console.log('[BACKEND] Recebendo POST /corretor');
  const form = new formidable.IncomingForm({
    multiples: false,
    maxFileSize: 10 * 1024 * 1024,
    uploadDir,
    keepExtensions: true,
    filename: (name, ext, part, form) => {
      // Gera um nome único para o arquivo
      const timestamp = Date.now();
      const safeName = part.originalFilename.replace(/\s+/g, '_');
      return `${timestamp}_${safeName}`;
    }
  });

  form.on('fileBegin', (name, file) => {
    console.log(`[BACKEND] Iniciando upload do arquivo: ${file.originalFilename}`);
  });

  form.on('progress', (bytesReceived, bytesExpected) => {
    console.log(`[BACKEND] Progresso: ${bytesReceived}/${bytesExpected}`);
  });

  form.on('error', (err) => {
    console.error('[BACKEND] Erro no formidable:', err);
  });

  form.parse(req, async (err, fields, files) => {
    console.log('[BACKEND] Callback do formidable chamado');
    let uploadedFilePath = null;
    try {
      if (err) {
        console.error('[BACKEND] Erro no parse:', err);
        return res.status(400).json({ success: false, message: 'Erro ao processar upload', details: err.message });
      }

      console.log('[BACKEND] Fields recebidos:', fields);
      console.log('[BACKEND] Files recebidos:', files);

      if (!files.photo) {
        console.warn('[BACKEND] Nenhuma foto enviada');
        return res.status(400).json({ success: false, message: 'Foto é obrigatória' });
      }

      // CORREÇÃO: Acessar o primeiro elemento do array
      const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
      uploadedFilePath = photoFile.filepath;
      console.log('[BACKEND] Caminho do arquivo salvo:', uploadedFilePath);

      // EXTRAIR VALORES DOS ARRAYS LOGO NO INÍCIO
      const username = Array.isArray(fields.username) ? fields.username[0] : fields.username;
      const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
      const first_name = Array.isArray(fields.first_name) ? fields.first_name[0] : fields.first_name;
      const last_name = Array.isArray(fields.last_name) ? fields.last_name[0] : fields.last_name;
      const telefone = Array.isArray(fields.telefone) ? fields.telefone[0] : fields.telefone;
      const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
      const creci = Array.isArray(fields.creci) ? fields.creci[0] : fields.creci;
      const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
      const pix_account = Array.isArray(fields.pix_account) ? fields.pix_account[0] : fields.pix_account;

      // AGORA USE AS VARIÁVEIS EXTRAÍDAS
      const validationErrors = validateCorretorData({
        username,
        email,
        first_name,
        last_name,
        telefone,
        password
      });
      
      if (validationErrors.length > 0) {
        console.warn('[BACKEND] Erros de validação:', validationErrors);
        await fs.unlink(uploadedFilePath);
        return res.status(400).json({ success: false, message: 'Dados inválidos', errors: validationErrors });
      }

      console.log('[BACKEND] Verificando usuário existente...');
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: email.toLowerCase().trim() }, // AGORA É STRING
            { username: username.toLowerCase().trim() } // AGORA É STRING
          ]
        }
      });
      
      if (existingUser) {
        console.warn('[BACKEND] Usuário já existe');
        await fs.unlink(uploadedFilePath);
        return res.status(409).json({ success: false, message: 'Email ou username já está em uso' });
      }

      console.log('[BACKEND] Gerando hash da senha...');
      const hashedPassword = await bcrypt.hash(password, 10); // AGORA É STRING

      console.log('[BACKEND] Salvando corretor no banco...');
      const newCorretor = await User.create({
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password: hashedPassword,
        creci: creci ? creci.trim() : null,
        address: address ? address.trim() : null,
        pix_account: pix_account ? pix_account.trim() : null,
        telefone: telefone.trim(),
        photo: path.basename(photoFile.filepath), // AGORA VAI FUNCIONAR
        is_corretor: true
      });

      const { password: _, ...corretorData } = newCorretor.toJSON();

      console.log('[BACKEND] Corretor criado com sucesso:', corretorData.id);

      res.status(201).json({
        success: true,
        message: 'Corretor criado com sucesso',
        data: corretorData
      });

    } catch (error) {
      console.error('[BACKEND] Erro inesperado:', error);
      if (uploadedFilePath) {
        await fs.unlink(uploadedFilePath).catch(() => {});
      }
      res.status(500).json({ success: false, message: 'Erro interno do servidor', details: error.message });
    }
  });
});

// GET /corretor - Listar corretores (com paginação e busca)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { is_corretor: true };

    // Adicionar busca se fornecida
    if (search.trim()) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: corretores } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'username', 'email', 'first_name', 'last_name',
        'creci', 'address', 'pix_account', 'telefone', 'photo',
        'created_at'
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: corretores,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar corretores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /corretor/:id - Obter corretor específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const corretor = await User.findOne({
      where: { 
        id: id, 
        is_corretor: true 
      },
      attributes: [
        'id', 'username', 'email', 'first_name', 'last_name',
        'creci', 'address', 'pix_account', 'telefone', 'photo',
        'created_at'
      ]
    });

    if (!corretor) {
      return res.status(404).json({
        success: false,
        message: 'Corretor não encontrado'
      });
    }

    res.json({
      success: true,
      data: corretor
    });

  } catch (error) {
    console.error('❌ Erro ao buscar corretor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
