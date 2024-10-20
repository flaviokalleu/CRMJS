const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para armazenar arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { username, cpf } = req.body;
    const uploadPath = path.join(__dirname, `../uploads/${username}/${cpf}`);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Middleware multer para upload de arquivos
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|html/; // Adicione outros tipos de imagens e HTML
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Arquivo inválido'));
  }
});

module.exports = upload;
