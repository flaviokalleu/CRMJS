const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/authMiddleware'); // Corrija o caminho se necessário

const router = express.Router();

// Configuração do multer para armazenar arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { username, cpf } = req.body;
    const uploadPath = path.join(__dirname, `../uploads/${username}/${cpf}`);
    
    // Verifique se o diretório existe, se não, crie
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Rota para upload de documentos
router.post('/upload', authenticateToken, upload.fields([
  { name: 'documentosPessoais', maxCount: 10 },
  { name: 'extratoBancario', maxCount: 1 },
  { name: 'documentosDependente', maxCount: 1 },
  { name: 'documentosConjuge', maxCount: 1 }
]), async (req, res) => {
  const { username, cpf } = req.body;

  try {
    // Criar o PDF com os documentos
    const doc = new PDFDocument();
    const pdfPath = path.join(__dirname, `../uploads/${username}/${cpf}/documentacao.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(18).text('Documentação do Cliente', { align: 'center' });
    doc.moveDown();

    // Adicionar documentos pessoais
    const documentosPessoais = req.files['documentosPessoais'];
    if (documentosPessoais) {
      doc.fontSize(14).text('Documentos Pessoais:');
      documentosPessoais.forEach(file => {
        doc.fontSize(12).text(`- ${file.originalname}`);
      });
      doc.moveDown();
    }

    // Adicionar extrato bancário
    const extratoBancario = req.files['extratoBancario'];
    if (extratoBancario) {
      doc.fontSize(14).text('Extrato Bancário:');
      doc.fontSize(12).text(`- ${extratoBancario[0].originalname}`);
      doc.moveDown();
    }

    // Adicionar documentos do dependente
    const documentosDependente = req.files['documentosDependente'];
    if (documentosDependente) {
      doc.fontSize(14).text('Documentos do Dependente:');
      doc.fontSize(12).text(`- ${documentosDependente[0].originalname}`);
      doc.moveDown();
    }

    // Adicionar documentos do cônjuge
    const documentosConjuge = req.files['documentosConjuge'];
    if (documentosConjuge) {
      doc.fontSize(14).text('Documentos do Cônjuge:');
      doc.fontSize(12).text(`- ${documentosConjuge[0].originalname}`);
    }

    doc.end();

    res.status(200).json({ message: 'Arquivos enviados e PDF gerado com sucesso' });
  } catch (error) {
    console.error('Erro ao processar arquivos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
