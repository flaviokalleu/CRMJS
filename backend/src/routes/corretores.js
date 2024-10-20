const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt'); // Importando bcrypt
const { Corretor } = require('../models');

const uploadPath = path.join(__dirname, '../uploads');

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

const deleteFile = async (fileName) => {
  const filePath = path.join(uploadPath, fileName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
  }
};

// Adicione a rota para obter o corretor logado
router.get('/me', authenticateToken, async (req, res) => {
  try {
      const corretor = await Corretor.findByPk(req.user.id); // Obtendo o corretor logado
      if (corretor) {
          res.json(corretor);
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

    // Verifique se um arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ error: 'Por favor, envie uma imagem' });
    }

    // Codifica a senha em Base64
    const base64Password = Buffer.from(password).toString('base64');

    const originalFileName = req.file.filename;
    const photo = await processImage(path.join(uploadPath, originalFileName), `${originalFileName}.webp`);

    const corretor = await Corretor.create({
      username,
      email,
      first_name,
      last_name,
      password: base64Password,  // Armazenando a senha em Base64
      creci: creci || null,
      address: address || null,
      pix_account: pix_account || null,
      telefone,
      photo
    });

    // Deletar o arquivo original após a criação com sucesso
    deleteFile(originalFileName);

    res.status(201).json(corretor);
  } catch (error) {
    console.error('Erro ao criar corretor:', error);

    // Deletar o arquivo original em caso de erro (opcional)
    if (req.file && req.file.filename) {
      await deleteFile(req.file.filename);
    }

    res.status(400).json({ error: error.message });
  }
});


router.put('/me', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { first_name, email, password } = req.body;
    const corretor = await Corretor.findByPk(req.user.id);

    if (!corretor) {
      return res.status(404).json({ error: 'Corretor não encontrado' });
    }

    // Atualiza informações
    corretor.first_name = first_name || corretor.first_name;
    corretor.email = email || corretor.email;

    if (password) {
      corretor.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      const photo = await processImage(req.file.path);
      corretor.photo = photo;
    }

    await corretor.save();
    res.json(corretor);
  } catch (error) {
    console.error('Erro ao atualizar corretor:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
