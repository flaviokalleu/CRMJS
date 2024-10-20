// backend/src/routes/correspondente.js
// backend/src/routes/correspondente.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
const { Correspondente } = require('../models');
const { authenticateToken } = require('./authRoutes'); // Adicione esta linha para importar o middleware de autenticação


const uploadPath = path.join(__dirname, '../../uploads/imagem_correspondente');
const deletePath = path.join(__dirname, '../../uploads/deletar');

(async () => {
  try {
    await fs.access(uploadPath, fs.constants.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(uploadPath, { recursive: true });
    } else {
      throw err;
    }
  }

  try {
    await fs.access(deletePath, fs.constants.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(deletePath, { recursive: true });
    } else {
      throw err;
    }
  }
})();

const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

const processImage = async (filePath, outputFileName) => {
  try {
    const outputPath = path.join(uploadPath, outputFileName);

    await sharp(filePath)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toFile(outputPath);

    return outputFileName;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

const moveToDeleteFolder = async (fileName) => {
  const sourcePath = path.join(uploadPath, fileName);
  const destPath = path.join(deletePath, fileName);
  try {
    await fs.rename(sourcePath, destPath);
  } catch (error) {
    console.error('Erro ao mover arquivo para pasta de deletar:', error);
  }
};

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { username, email, first_name, last_name, creci, address, pix_account, phone, password } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Por favor, envie uma imagem' });
    }

    const base64Password = Buffer.from(password).toString('base64');
    const originalFileName = req.file.filename;
    const photo = await processImage(path.join(uploadPath, originalFileName), `${originalFileName}.webp`);

    const correspondente = await Correspondente.create({
      username,
      email,
      first_name,
      last_name,
      password: base64Password,
      creci: creci || null,
      address: address || null,
      pix_account: pix_account || null,
      phone,
      photo
    });

    try {
      await fs.unlink(path.join(uploadPath, originalFileName));
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      await moveToDeleteFolder(originalFileName);
    }

    res.status(201).json(correspondente);
  } catch (error) {
    console.error('Erro ao criar correspondente:', error);

    if (req.file && req.file.filename) {
      await moveToDeleteFolder(req.file.filename);
    }

    res.status(400).json({ error: error.message });
  }
});

// Nova rota para listar todos os correspondentes
router.get('/lista', async (req, res) => {
  try {
    const correspondentes = await Correspondente.findAll();
    res.json(correspondentes);
  } catch (error) {
    console.error('Erro ao listar correspondentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar informações do correspondente
router.put('/me', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { first_name, email, password } = req.body;
    const correspondente = await Correspondente.findByPk(req.user.id);

    if (!correspondente) {
      return res.status(404).json({ error: 'Correspondente não encontrado' });
    }

    correspondente.first_name = first_name || correspondente.first_name;
    correspondente.email = email || correspondente.email;

    if (password) {
      correspondente.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      const photo = await processImage(req.file.path);
      correspondente.photo = photo;
    }

    await correspondente.save();
    res.json(correspondente);
  } catch (error) {
    console.error('Erro ao atualizar correspondente:', error);
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;
