// Backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Define o armazenamento do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // pasta onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    // Gera um nome de arquivo único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // adiciona a extensão do arquivo original
  },
});

// Cria o middleware de upload
const upload = multer({ storage: storage });

module.exports = upload;
