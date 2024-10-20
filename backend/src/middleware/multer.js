const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Configuração do Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB por arquivo
  fileFilter: (req, file, cb) => {
    // Filtro para aceitar apenas arquivos PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'), false);
    }
  }
}).fields([
  { name: 'documentos_pessoais', maxCount: 50 },
  { name: 'extrato_bancario', maxCount: 50 },
  { name: 'documentos_dependente', maxCount: 50 },
  { name: 'documentos_conjuge', maxCount: 50 }
]);

module.exports = upload;
