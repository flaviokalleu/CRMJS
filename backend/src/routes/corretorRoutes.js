const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const authenticateToken = require('../middleware/authMiddleware');

// Configuração de caminhos
const uploadPath = path.join(__dirname, '../../uploads/imagem_corretor');
const deletePath = path.join(uploadPath, 'deletar');

// Criar diretórios se não existirem
const initializeDirectories = async () => {
  try {
    await fs.mkdir(uploadPath, { recursive: true });
    await fs.mkdir(deletePath, { recursive: true });
    console.log('Diretórios de upload criados com sucesso');
  } catch (error) {
    console.error('Erro ao criar diretórios:', error);
  }
};

// Inicializar diretórios
initializeDirectories();

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1E9)}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos! (JPEG, PNG, GIF, WebP, BMP, TIFF)'), false);
  }
};

// Configuração do upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

// Função para processar imagem
const processImage = async (inputPath, outputFileName) => {
  try {
    const outputPath = path.join(uploadPath, outputFileName);
    
    await sharp(inputPath)
      .resize({ 
        width: 800, 
        height: 800, 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ 
        quality: 85,
        effort: 4
      })
      .toFile(outputPath);

    console.log(`Imagem processada: ${outputFileName}`);
    return outputFileName;
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    throw new Error('Falha ao processar a imagem');
  }
};

// Função para deletar arquivo
const deleteFile = async (fileName) => {
  if (!fileName) return;
  
  const filePath = path.join(uploadPath, fileName);
  
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`Arquivo deletado: ${fileName}`);
  } catch (error) {
    console.error(`Erro ao deletar arquivo ${fileName}:`, error);
    
    // Tentar mover para pasta de deletar
    try {
      const destinationPath = path.join(deletePath, fileName);
      await fs.rename(filePath, destinationPath);
      console.log(`Arquivo movido para pasta de deletar: ${fileName}`);
    } catch (moveError) {
      console.error(`Erro ao mover arquivo para deletar: ${moveError}`);
    }
  }
};

// Função para validar dados do corretor
const validateCorretorData = (data) => {
  const { username, email, first_name, last_name, telefone, password } = data;
  const errors = [];

  if (!username || username.trim().length < 3) {
    errors.push('Username deve ter pelo menos 3 caracteres');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email inválido');
  }

  if (!first_name || first_name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (!last_name || last_name.trim().length < 2) {
    errors.push('Sobrenome deve ter pelo menos 2 caracteres');
  }

  if (!telefone || telefone.trim().length < 10) {
    errors.push('Telefone deve ter pelo menos 10 caracteres');
  }

  if (!password || password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  return errors;
};

// ROTAS

// Obter dados do corretor logado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { 
        id: req.user.id, 
        is_corretor: true 
      },
      attributes: [
        'id', 'username', 'email', 'first_name', 'last_name', 
        'creci', 'address', 'pix_account', 'telefone', 'photo', 
        'is_corretor', 'createdAt'
      ]
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'Corretor não encontrado ou não autorizado' 
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erro ao obter dados do corretor:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Criar novo corretor
router.post('/', upload.single('photo'), async (req, res) => {
  let uploadedFileName = null;

  try {
    // Validar se arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Por favor, envie uma imagem do corretor' 
      });
    }

    uploadedFileName = req.file.filename;
    const { username, email, first_name, last_name, creci, address, pix_account, telefone, password } = req.body;

    // Validar dados
    const validationErrors = validateCorretorData(req.body);
    if (validationErrors.length > 0) {
      await deleteFile(uploadedFileName);
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: validationErrors
      });
    }

    // Verificar se email ou username já existem
    const existingUser = await User.findOne({
      where: {
        $or: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      await deleteFile(uploadedFileName);
      return res.status(409).json({ 
        error: 'Email ou username já cadastrado' 
      });
    }

    // Processar imagem
    const processedImageName = `${Date.now()}_corretor.webp`;
    await processImage(
      path.join(uploadPath, uploadedFileName),
      processedImageName
    );

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar corretor
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
      photo: processedImageName,
      is_corretor: true
    });

    // Deletar arquivo original
    await deleteFile(uploadedFileName);

    // Resposta de sucesso (sem senha)
    res.status(201).json({
      success: true,
      message: 'Corretor criado com sucesso',
      data: {
        id: newCorretor.id,
        username: newCorretor.username,
        email: newCorretor.email,
        first_name: newCorretor.first_name,
        last_name: newCorretor.last_name,
        creci: newCorretor.creci,
        address: newCorretor.address,
        pix_account: newCorretor.pix_account,
        telefone: newCorretor.telefone,
        photo: newCorretor.photo,
        is_corretor: newCorretor.is_corretor,
        createdAt: newCorretor.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar corretor:', error);

    // Limpar arquivo em caso de erro
    if (uploadedFileName) {
      await deleteFile(uploadedFileName);
    }

    // Tratar erros específicos do Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: 'Email ou username já cadastrado' 
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dados de validação inválidos',
        details: error.errors.map(err => err.message)
      });
    }

    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Listar todos os corretores (admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { is_corretor: true };
    
    if (search) {
      whereClause.$or = [
        { first_name: { $iLike: `%${search}%` } },
        { last_name: { $iLike: `%${search}%` } },
        { email: { $iLike: `%${search}%` } },
        { username: { $iLike: `%${search}%` } }
      ];
    }

    const { count, rows: corretores } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'username', 'email', 'first_name', 'last_name', 
        'creci', 'address', 'pix_account', 'telefone', 'photo', 
        'is_corretor', 'createdAt'
      ],
      order: [['createdAt', 'DESC']],
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
    console.error('Erro ao listar corretores:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Middleware de tratamento de erros para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Arquivo muito grande. Máximo permitido: 5MB' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Muitos arquivos. Envie apenas uma imagem' 
      });
    }
  }
  
  if (error.message.includes('Apenas arquivos de imagem')) {
    return res.status(400).json({ 
      error: error.message 
    });
  }

  res.status(500).json({ 
    error: 'Erro no upload do arquivo' 
  });
});

module.exports = router;
