const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const { promisify } = require('util');
const { getNotasByClienteId } = require('../controllers/notasController');
const { Corretor, Cliente, Nota } = require('../models');
const { authenticateToken } = require('./authRoutes');

const unlinkAsync = promisify(fs.unlink);

const convertToJpeg = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .jpeg()
      .toFile(outputPath);
  } catch (error) {
    console.error(`Erro ao converter imagem ${inputPath} para JPEG:`, error);
    throw error;
  }
};

const uploadDir = process.env.UPLOAD_DIR;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const addImageFilesToPDF = async (pdfDoc, imageFiles) => {
  const tempJpegPaths = [];
  const deleteFolderPath = path.join(uploadDir, 'deletar');
  
  if (!fs.existsSync(deleteFolderPath)) {
    fs.mkdirSync(deleteFolderPath, { recursive: true });
  }

  try {
    for (const file of imageFiles) {
      if (file.mimetype.startsWith('image/')) {
        const tempJpegPath = file.path + '.temp.jpg';
        tempJpegPaths.push(tempJpegPath);

        const isJpeg = await sharp(file.path)
          .metadata()
          .then(info => info.format === 'jpeg')
          .catch(() => false);

        if (isJpeg) {
          await convertToJpeg(file.path, tempJpegPath);
          const imageBytes = fs.readFileSync(tempJpegPath);
          const image = await pdfDoc.embedJpg(imageBytes);
          const page = pdfDoc.addPage();
          const { width, height } = page.getSize();

          let imageWidth = image.width;
          let imageHeight = image.height;

          const maxWidth = width * 0.9;
          const maxHeight = height * 0.9;

          if (imageWidth > maxWidth || imageHeight > maxHeight) {
            const aspectRatio = imageWidth / imageHeight;
            if (imageWidth / maxWidth > imageHeight / maxHeight) {
              imageWidth = maxWidth;
              imageHeight = maxWidth / aspectRatio;
            } else {
              imageHeight = maxHeight;
              imageWidth = maxHeight * aspectRatio;
            }
          }

          const x = (width - imageWidth) / 2;
          const y = (height - imageHeight) / 2;

          page.drawImage(image, {
            x,
            y,
            width: imageWidth,
            height: imageHeight,
          });

          // Mova a imagem original e o JPEG temporário para a pasta "deletar"
          try {
            fs.renameSync(file.path, path.join(deleteFolderPath, path.basename(file.path)));
            fs.renameSync(tempJpegPath, path.join(deleteFolderPath, path.basename(tempJpegPath)));
          } catch (moveError) {
            console.error(`Erro ao mover arquivo para a pasta "deletar":`, moveError);
          }
        } else {
          console.error(`Arquivo ${file.originalname} não é um JPEG válido.`);
        }
      } else {
        console.error(`Arquivo ${file.originalname} não é uma imagem.`);
      }
    }
  } catch (error) {
    console.error(`Erro ao processar imagens:`, error);
    throw error;
  } finally {
    // Limpeza de arquivos temporários
    for (const tempJpegPath of tempJpegPaths) {
      try {
        if (fs.existsSync(tempJpegPath)) {
          await unlinkAsync(tempJpegPath);
        }
      } catch (error) {
        console.error(`Erro ao excluir arquivo temporário ${tempJpegPath}:`, error);
      }
    }
  }
};


const addPDFFilesToPDF = async (pdfDoc, pdfFiles) => {
  for (const file of pdfFiles) {
    const pdfBytes = fs.readFileSync(file.path);
    const pdfToMerge = await PDFDocument.load(pdfBytes);
    const copiedPages = await pdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
    copiedPages.forEach((page) => {
      pdfDoc.addPage(page);
    });
  }
};

const createAndSavePDF = async (files, corretorId, clienteId, tipo) => {
  const username = await getUsernameByCorretorId(corretorId);
  const uploadPath = path.join(uploadDir, username, clienteId, tipo);
  const finalPdfPath = path.join(uploadPath, 'documentos.pdf');

  let pdfDoc;

  // Se o arquivo PDF já existir, carregue-o, senão crie um novo
  if (fs.existsSync(finalPdfPath)) {
    const existingPdfBytes = fs.readFileSync(finalPdfPath);
    pdfDoc = await PDFDocument.load(existingPdfBytes);
  } else {
    pdfDoc = await PDFDocument.create();
  }

  // Adicionar imagens e PDFs ao documento
  await addImageFilesToPDF(pdfDoc, files.filter(file => file.mimetype.startsWith('image/')));
  await addPDFFilesToPDF(pdfDoc, files.filter(file => file.mimetype === 'application/pdf'));

  const pdfBytes = await pdfDoc.save();
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  fs.writeFileSync(finalPdfPath, pdfBytes);

  return `uploads/${username}/${clienteId}/${tipo}/documentos.pdf`;
};

const getUsernameByCorretorId = async (corretorId) => {
  const corretor = await Corretor.findByPk(corretorId);
  if (!corretor) {
    throw new Error('Corretor não encontrado');
  }
  return corretor.username;
};

const moveFileToDeleteFolder = (filePath, deleteFolderPath) => {
  try {
    if (fs.existsSync(filePath)) {
      const deletedFilePath = path.join(deleteFolderPath, path.basename(filePath));
      fs.renameSync(filePath, deletedFilePath);
    }
  } catch (err) {
    console.error(`Erro ao mover o arquivo ${filePath} para a pasta de "deleted":`, err);
  }
};

// Rota para criação de cliente
router.post('/clientes', authenticateToken, upload.fields([
  { name: 'documentos_pessoais', maxCount: 100 },
  { name: 'extrato_bancario', maxCount: 100 },
  { name: 'documentos_dependente', maxCount: 100 },
  { name: 'documentos_conjuge', maxCount: 100 },
  { name: 'notas', maxCount: 100 }
]), async (req, res) => {
  try {
    const { documentosPessoais, extratoBancario, documentosDependente, documentosConjuge, notas } = req.files;
    const { nome, email, telefone, cpf, valor_renda, estado_civil, naturalidade, profissao, data_admissao, data_nascimento, renda_tipo, possui_carteira_mais_tres_anos, numero_pis, possui_dependente, status } = req.body;

    const corretor = await Corretor.findOne({ where: { email: req.user.email } });
    if (!corretor) {
      return res.status(404).json({ error: 'Corretor não encontrado.' });
    }
    const corretorId = corretor.id;

    const cliente = await Cliente.create({
      nome,
      email,
      telefone,
      cpf,
      valor_renda,
      estado_civil,
      naturalidade,
      profissao,
      data_admissao: data_admissao || null,
      data_nascimento,
      renda_tipo,
      possui_carteira_mais_tres_anos: possui_carteira_mais_tres_anos === "sim" ? 1 : 0,
      numero_pis,
      possui_dependente: possui_dependente === "sim" ? 1 : 0,
      status: 'aguardando_aprovacao',
      corretorId
    });

    await cliente.update({
      documentos_pessoais: await createAndSavePDF(documentosPessoais || [], corretorId, cliente.cpf, 'documentos_pessoais'),
      extrato_bancario: await createAndSavePDF(extratoBancario || [], corretorId, cliente.cpf, 'extrato_bancario'),
      documentos_dependente: await createAndSavePDF(documentosDependente || [], corretorId, cliente.cpf, 'documentos_dependente'),
      documentos_conjuge: await createAndSavePDF(documentosConjuge || [], corretorId, cliente.cpf, 'documentos_conjuge')
    });

    if (notas && notas.length > 0) {
      await Promise.all(notas.map(async (file) => {
        const notaBytes = fs.readFileSync(file.path);
        const notaDoc = await PDFDocument.load(notaBytes);
        const notaContent = await notaDoc.getPage(0).getTextContent();
        await Nota.create({
          clienteId: cliente.id,
          content: notaContent
        });
        await unlinkAsync(file.path);
      }));
    }

    const clienteComNotas = await Cliente.findByPk(cliente.id, {
      include: [{ model: Nota, as: 'notas' }]
    });

    res.status(200).json({
      message: 'Cliente adicionado com sucesso.',
      cliente: clienteComNotas
    });
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).json({ error: 'Ocorreu um erro ao adicionar o cliente.' });
  }
});

// Rota para editar cliente
router.put('/clientes/:id', authenticateToken, upload.fields([
  { name: 'documentos_pessoais', maxCount: 100 },
  { name: 'extrato_bancario', maxCount: 100 },
  { name: 'documentos_dependente', maxCount: 100 },
  { name: 'documentos_conjuge', maxCount: 100 },
  { name: 'notas', maxCount: 100 }
]), async (req, res) => {
  try {
    const clienteId = req.params.id;
    
    // Verifique se o req.files existe para evitar erros
    const documentosPessoais = req.files?.documentos_pessoais || [];
    const extratoBancario = req.files?.extrato_bancario || [];
    const documentosDependente = req.files?.documentos_dependente || [];
    const documentosConjuge = req.files?.documentos_conjuge || [];
    const notas = req.files?.notas || [];
    
    const { nome, email, telefone, cpf, valor_renda, estado_civil, naturalidade, profissao, data_admissao, data_nascimento, renda_tipo, possui_carteira_mais_tres_anos, numero_pis, possui_dependente, status } = req.body;

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    await cliente.update({
      nome,
      email,
      telefone,
      cpf,
      valor_renda,
      estado_civil,
      naturalidade,
      profissao,
      data_admissao: data_admissao || null,
      data_nascimento,
      renda_tipo,
      possui_carteira_mais_tres_anos: possui_carteira_mais_tres_anos === "sim" ? 1 : 0,
      numero_pis,
      possui_dependente: possui_dependente === "sim" ? 1 : 0,
      status
    });

    if (documentosPessoais.length > 0) {
      cliente.documentos_pessoais = await createAndSavePDF(documentosPessoais, cliente.corretorId, cliente.cpf, 'documentos_pessoais');
    }
    if (extratoBancario.length > 0) {
      cliente.extrato_bancario = await createAndSavePDF(extratoBancario, cliente.corretorId, cliente.cpf, 'extrato_bancario');
    }
    if (documentosDependente.length > 0) {
      cliente.documentos_dependente = await createAndSavePDF(documentosDependente, cliente.corretorId, cliente.cpf, 'documentos_dependente');
    }
    if (documentosConjuge.length > 0) {
      cliente.documentos_conjuge = await createAndSavePDF(documentosConjuge, cliente.corretorId, cliente.cpf, 'documentos_conjuge');
    }

    await cliente.save();

    if (notas.length > 0) {
      await Promise.all(notas.map(async (file) => {
        const notaBytes = fs.readFileSync(file.path);
        const notaDoc = await PDFDocument.load(notaBytes);
        const notaContent = await notaDoc.getPage(0).getTextContent();
        await Nota.create({
          clienteId: cliente.id,
          content: notaContent
        });
        await unlinkAsync(file.path);
      }));
    }

    const clienteComNotas = await Cliente.findByPk(clienteId, {
      include: [{ model: Nota, as: 'notas' }]
    });

    res.status(200).json({
      message: 'Cliente atualizado com sucesso.',
      cliente: {
        ...clienteComNotas.get(),
        created_at: cliente.created_at // Inclua o created_at na resposta
      }
    });
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ error: 'Ocorreu um erro ao atualizar o cliente.' });
  }
});

// Rota para remover cliente
router.delete('/clientes/:id', authenticateToken, async (req, res) => {
  try {
    const clienteId = req.params.id;

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const corretor = await Corretor.findOne({ where: { email: req.user.email } });
    if (!corretor) {
      return res.status(404).json({ error: 'Corretor não encontrado.' });
    }

    const deleteFolderPath = path.join(uploadDir, corretor.username, cliente.cpf, 'deleted');
    if (!fs.existsSync(deleteFolderPath)) {
      fs.mkdirSync(deleteFolderPath, { recursive: true });
    }

    moveFileToDeleteFolder(cliente.documentos_pessoais, deleteFolderPath);
    moveFileToDeleteFolder(cliente.extrato_bancario, deleteFolderPath);
    moveFileToDeleteFolder(cliente.documentos_dependente, deleteFolderPath);
    moveFileToDeleteFolder(cliente.documentos_conjuge, deleteFolderPath);

    await cliente.destroy();

    res.status(200).json({ message: 'Cliente removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover cliente:', err);
    res.status(500).json({ error: 'Ocorreu um erro ao remover o cliente.' });
  }
});
router.patch('/clientes/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório.' });
    }

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    cliente.status = status;
    await cliente.save();

    res.status(200).json({ 
      message: 'Status do cliente atualizado com sucesso.',
      cliente 
    });
  } catch (error) {
    console.error('Erro ao atualizar status do cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do cliente.' });
  }
});


module.exports = router;
