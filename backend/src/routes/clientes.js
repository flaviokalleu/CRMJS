const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const { promisify } = require('util');
const bb = require('express-busboy');
const { getNotasByClienteId } = require('../controllers/notasController');
const { User, Cliente, Nota } = require('../models'); // Atualize o import
const { authenticateToken } = require('./authRoutes');

const unlinkAsync = promisify(fs.unlink);

const uploadDir = path.resolve(__dirname, '../Uploads');

// Configuração do express-busboy
bb.extend(router, {
  upload: true,
  path: uploadDir,
  allowedPath: /./,
  mimeTypeLimit: ['image/jpeg', 'image/png', 'application/pdf'],
  filename: (fieldname, file, filename, encoding, mimetype) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return `${uniqueSuffix}-${filename}`;
  }
});

// Middleware para logar arquivos recebidos
const logFiles = (req, res, next) => {
  console.log('Arquivos recebidos:', req.files);
  console.log('Corpo da requisição:', req.body);
  next();
};

// Função para converter imagens para JPEG
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

// Função para adicionar imagens ao PDF
const addImageFilesToPDF = async (pdfDoc, imageFiles) => {
  const tempJpegPaths = [];
  const deleteFolderPath = path.join(uploadDir, 'deletar');

  if (!fs.existsSync(deleteFolderPath)) {
    fs.mkdirSync(deleteFolderPath, { recursive: true });
  }

  try {
    for (const file of imageFiles) {
      if (file.mimetype.startsWith('image/')) {
        const tempJpegPath = file.file + '.temp.jpg';
        tempJpegPaths.push(tempJpegPath);

        const isJpeg = await sharp(file.file)
          .metadata()
          .then(info => info.format === 'jpeg')
          .catch(() => false);

        if (!isJpeg) {
          await convertToJpeg(file.file, tempJpegPath);
        } else {
          fs.copyFileSync(file.file, tempJpegPath);
        }

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

        try {
          fs.renameSync(file.file, path.join(deleteFolderPath, path.basename(file.file)));
          fs.renameSync(tempJpegPath, path.join(deleteFolderPath, path.basename(tempJpegPath)));
        } catch (moveError) {
          console.error(`Erro ao mover arquivo para a pasta "deletar":`, moveError);
        }
      } else {
        console.error(`Arquivo ${file.filename} não é uma imagem.`);
      }
    }
  } catch (error) {
    console.error(`Erro ao processar imagens:`, error);
    throw error;
  } finally {
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

// Função para adicionar PDFs ao documento
const addPDFFilesToPDF = async (pdfDoc, pdfFiles) => {
  for (const file of pdfFiles) {
    const pdfBytes = fs.readFileSync(file.file);
    const pdfToMerge = await PDFDocument.load(pdfBytes);
    const copiedPages = await pdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
    copiedPages.forEach((page) => {
      pdfDoc.addPage(page);
    });
  }
};

// Função utilitária para deletar arquivos de forma segura
const safeDeleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Erro ao deletar arquivo ${filePath}:`, err);
  }
};

// Função para criar e salvar PDF (mantendo apenas o PDF final)
const createAndSavePDF = async (files, user, clienteId, tipo) => {
  const username = user.username;
  const uploadPath = path.join(uploadDir, username, clienteId, tipo);
  const finalPdfPath = path.join(uploadPath, 'documentos.pdf');

  let pdfDoc;

  if (fs.existsSync(finalPdfPath)) {
    const existingPdfBytes = fs.readFileSync(finalPdfPath);
    pdfDoc = await PDFDocument.load(existingPdfBytes);
  } else {
    pdfDoc = await PDFDocument.create();
  }

  // Separe os arquivos por tipo
  const imageFiles = files.filter(file => file.mimetype?.startsWith('image/'));
  const pdfFiles = files.filter(file => file.mimetype === 'application/pdf');

  // Adicione imagens e PDFs ao documento
  await addImageFilesToPDF(pdfDoc, imageFiles);
  await addPDFFilesToPDF(pdfDoc, pdfFiles);

  const pdfBytes = await pdfDoc.save();
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  fs.writeFileSync(finalPdfPath, pdfBytes);

  // Após salvar o PDF final, delete todos os arquivos enviados
  [...imageFiles, ...pdfFiles].forEach(file => safeDeleteFile(file.file));

  return `Uploads/${username}/${clienteId}/${tipo}/documentos.pdf`;
};

// Função para encontrar usuário e papel
const findUserByEmail = async (email) => {
  if (!email) return null;
  const user = await User.findOne({ where: { email } });
  if (!user) return null;
  if (user.is_corretor) return { user, role: 'Corretor' };
  if (user.is_correspondente) return { user, role: 'Correspondente' };
  if (user.is_administrador) return { user, role: 'Administrador' };
  return null;
};

// Função para mover arquivos para a pasta "deleted"
const moveFileToDeleteFolder = (filePath, deleteFolderPath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      const deletedFilePath = path.join(deleteFolderPath, path.basename(filePath));
      fs.renameSync(filePath, deletedFilePath);
    }
  } catch (err) {
    console.error(`Erro ao mover o arquivo ${filePath} para a pasta de "deleted":`, err);
  }
};

// Rota para criação de cliente
router.post('/clientes', authenticateToken, logFiles, async (req, res) => {
  try {
    const { nome, email, telefone, cpf, valor_renda, estado_civil, naturalidade, profissao, data_admissao, data_nascimento, renda_tipo, tem_mais_de_tres_anos, numero_pis, possui_dependente, qtd_dependentes, nome_dependentes, observacoes } = req.body;

    // Encontrar usuário
    const userResult = await findUserByEmail(req.user?.email);
    if (!userResult) {
      return res.status(403).json({ error: 'Usuário não autorizado. Apenas Corretores, Correspondentes ou Administradores podem criar clientes.' });
    }
    const { user, role } = userResult;

    // Vincular sempre o user_id ao usuário autenticado
    const user_id = user.id;

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
      possui_carteira_mais_tres_anos: tem_mais_de_tres_anos === 'sim' ? 1 : 0,
      numero_pis,
      possui_dependente: possui_dependente === 'sim' ? 1 : 0,
      qtd_dependentes: qtd_dependentes || null,
      nome_dependentes: nome_dependentes || null,
      observacoes: observacoes || null,
      status: 'aguardando_aprovacao',
      user_id
    });

    // Agrupar arquivos por campo
    const filesByField = req.files || {};
    const documentosPessoais = filesByField['documentosPessoais'] || [];
    const extratoBancario = filesByField['extratoBancario'] || [];
    const documentosDependente = filesByField['documentosDependente'] || [];
    const documentosConjuge = filesByField['documentosConjuge'] || [];
    const notas = filesByField['notas'] || [];

    await cliente.update({
      documentos_pessoais: documentosPessoais.length > 0 ? await createAndSavePDF(documentosPessoais, user, cliente.cpf, 'documentos_pessoais') : null,
      extrato_bancario: extratoBancario.length > 0 ? await createAndSavePDF(extratoBancario, user, cliente.cpf, 'extrato_bancario') : null,
      documentos_dependente: documentosDependente.length > 0 ? await createAndSavePDF(documentosDependente, user, cliente.cpf, 'documentos_dependente') : null,
      documentos_conjuge: documentosConjuge.length > 0 ? await createAndSavePDF(documentosConjuge, user, cliente.cpf, 'documentos_conjuge') : null
    });

    if (notas.length > 0) {
      await Promise.all(notas.map(async (file) => {
        try {
          const notaBytes = fs.readFileSync(file.file);
          const notaDoc = await PDFDocument.load(notaBytes);
          const notaContent = await notaDoc.getPage(0).getTextContent();
          await Nota.create({
            clienteId: cliente.id,
            content: JSON.stringify(notaContent)
          });
        } catch (err) {
          console.error('Erro ao processar nota:', err);
        } finally {
          safeDeleteFile(file.file);
        }
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
router.put('/clientes/:id', authenticateToken, logFiles, async (req, res) => {
  try {
    const clienteId = req.params.id;
    const { nome, email, telefone, cpf, valor_renda, estado_civil, naturalidade, profissao, data_admissao, data_nascimento, renda_tipo, possui_carteira_mais_tres_anos, numero_pis, possui_dependente, status } = req.body;

    // Encontrar usuário
    const userResult = await findUserByEmail(req.user?.email);
    if (!userResult) {
      return res.status(403).json({ error: 'Usuário não autorizado. Apenas Corretores, Correspondentes ou Administradores podem editar clientes.' });
    }
    const { user, role } = userResult;

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Verificar permissões
    if (role === 'Corretor' && cliente.userId !== user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este cliente.' });
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
      possui_carteira_mais_tres_anos: possui_carteira_mais_tres_anos === 'sim' ? 1 : 0,
      numero_pis,
      possui_dependente: possui_dependente === 'sim' ? 1 : 0,
      status
    });

    const filesByField = req.files || {};
    const documentosPessoais = filesByField['documentosPessoais'] || [];
    const extratoBancario = filesByField['extratoBancario'] || [];
    const documentosDependente = filesByField['documentosDependente'] || [];
    const documentosConjuge = filesByField['documentosConjuge'] || [];
    const notas = filesByField['notas'] || [];

    if (documentosPessoais.length > 0) {
      cliente.documentos_pessoais = await createAndSavePDF(documentosPessoais, user, cliente.cpf, 'documentos_pessoais');
    }
    if (extratoBancario.length > 0) {
      cliente.extrato_bancario = await createAndSavePDF(extratoBancario, user, cliente.cpf, 'extrato_bancario');
    }
    if (documentosDependente.length > 0) {
      cliente.documentos_dependente = await createAndSavePDF(documentosDependente, user, cliente.cpf, 'documentos_dependente');
    }
    if (documentosConjuge.length > 0) {
      cliente.documentos_conjuge = await createAndSavePDF(documentosConjuge, user, cliente.cpf, 'documentos_conjuge');
    }

    await cliente.save();

    if (notas.length > 0) {
      await Promise.all(notas.map(async (file) => {
        try {
          const notaBytes = fs.readFileSync(file.file);
          const notaDoc = await PDFDocument.load(notaBytes);
          const notaContent = await notaDoc.getPage(0).getTextContent();
          await Nota.create({
            clienteId: cliente.id,
            content: JSON.stringify(notaContent)
          });
        } catch (err) {
          console.error('Erro ao processar nota:', err);
        } finally {
          safeDeleteFile(file.file);
        }
      }));
    }

    const clienteComNotas = await Cliente.findByPk(cliente.id, {
      include: [{ model: Nota, as: 'notas' }]
    });

    res.status(200).json({
      message: 'Cliente atualizado com sucesso.',
      cliente: {
        ...clienteComNotas.get(),
        created_at: cliente.created_at
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

    // Encontrar usuário
    const userResult = await findUserByEmail(req.user.email);
    if (!userResult) {
      return res.status(403).json({ error: 'Usuário não autorizado. Apenas Corretores, Correspondentes ou Administradores podem remover clientes.' });
    }
    const { user, role } = userResult;

    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Verificar permissões
    if (role === 'Corretor' && cliente.userId !== user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para remover este cliente.' });
    }

    const deleteFolderPath = path.join(uploadDir, user.username, cliente.cpf, 'deletar');
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

// Rota para atualizar status do cliente
router.patch('/clientes/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório.' });
    }

    // Encontrar usuário
    const userResult = await findUserByEmail(req.user.email);
    if (!userResult) {
      return res.status(403).json({ error: 'Usuário não autorizado. Apenas Corretores, Correspondentes ou Administradores podem atualizar o status de clientes.' });
    }
    const { user, role } = userResult;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Verificar permissões
    if (role === 'Corretor' && cliente.userId !== user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para atualizar o status deste cliente.' });
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

// Middleware para tratamento de erros genéricos
router.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = router;