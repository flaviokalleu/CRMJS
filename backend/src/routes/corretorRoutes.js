const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
const { User } = require('../models'); // Use User em vez de Corretor
const authenticateToken = require('../middleware/authMiddleware');

const uploadPath = path.join(__dirname, '../../uploads/imagem_corretor');
const deletePath = path.join(uploadPath, 'deletar');

// Verifique e crie os diretórios se não existirem
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

const moveFileToDeleteFolder = async (fileName) => {
  const filePath = path.join(uploadPath, fileName);
  const destinationPath = path.join(deletePath, fileName);
  try {
    await fs.rename(filePath, destinationPath);
  } catch (error) {
    console.error('Erro ao mover arquivo para pasta de deletar:', error);
  }
};

const deleteFile = async (fileName) => {
  const filePath = path.join(uploadPath, fileName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Erro ao deletar arquivo, movendo para pasta de deletar:', error);
    await moveFileToDeleteFolder(fileName);
  }
};

// Rota para obter o corretor logado (agora usando User e is_corretor)
router.get('/me', authenticateToken, async (req, res) => {
  try {
      const user = await User.findOne({ where: { id: req.user.id, is_corretor: true } });
      if (user) {
          res.json(user);
      } else {
          res.status(404).json({ error: 'Corretor não encontrado' });
      }
  } catch (error) {
      console.error('Erro ao obter dados do corretor:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { username, email, first_name, last_name, creci, address, pix_account, telefone, password } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Por favor, envie uma imagem' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const originalFileName = req.file.filename;
    const photo = await processImage(path.join(uploadPath, originalFileName), `${originalFileName}.webp`);

    const user = await User.create({
      username,
      email,
      first_name,
      last_name,
      password: hashedPassword,
      creci: creci || null,
      address: address || null,
      pix_account: pix_account || null,
      telefone,
      photo,
      is_corretor: true // Marca como corretor
    });

    await deleteFile(originalFileName);

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar corretor:', error);

    if (req.file && req.file.filename) {
      await deleteFile(req.file.filename);
    }

    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
