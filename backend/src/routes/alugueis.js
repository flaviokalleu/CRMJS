const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const db = require('../models');

// Configuração do multer para uploads de arquivos
const uploadDirectory = path.join(__dirname, '../../uploads/alugueis');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'outros';
    if (file.fieldname === 'fotoCapa') {
      folder = 'capa';
    } else if (file.fieldname === 'fotoAdicional') {
      folder = 'adicional';
    }
    const dir = path.join(uploadDirectory, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Rota para buscar todos os aluguéis
router.get('/', async (req, res) => {
  try {
    const alugueis = await db.Aluguel.findAll();
    const alugueisWithFileNames = alugueis.map(aluguel => ({
      ...aluguel.toJSON(),
      foto_capa: aluguel.foto_capa,
      foto_adicional: JSON.parse(aluguel.foto_adicional),
    }));
    res.status(200).json(alugueisWithFileNames);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar aluguéis' });
  }
});

// Rota para criar um novo aluguel
router.post('/', upload.fields([{ name: 'fotoCapa' }, { name: 'fotoAdicional' }]), async (req, res) => {
  try {
    const { nome_imovel, descricao, valor_aluguel, quartos, banheiro, dia_vencimento } = req.body;
    const fotoCapa = req.files['fotoCapa'] ? req.files['fotoCapa'][0].filename : null;
    const fotoAdicional = req.files['fotoAdicional'] ? req.files['fotoAdicional'].map(file => file.filename) : [];

    const novoAluguel = await db.Aluguel.create({
      nome_imovel,
      descricao,
      valor_aluguel,
      quartos,
      banheiro,
      dia_vencimento,
      foto_capa: fotoCapa,
      foto_adicional: JSON.stringify(fotoAdicional)
    });

    res.status(201).json({
      ...novoAluguel.toJSON(),
      foto_capa: novoAluguel.foto_capa,
      foto_adicional: JSON.parse(novoAluguel.foto_adicional),
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar aluguel' });
  }
});

// Rota para atualizar um aluguel
router.put('/:id', upload.fields([{ name: 'fotoCapa' }, { name: 'fotoAdicional' }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_imovel, descricao, valor_aluguel, quartos, banheiro, dia_vencimento } = req.body;
    const fotoCapa = req.files['fotoCapa'] ? req.files['fotoCapa'][0].filename : null;
    const fotoAdicional = req.files['fotoAdicional'] ? req.files['fotoAdicional'].map(file => file.filename) : [];

    const aluguel = await db.Aluguel.findByPk(id);
    
    if (!aluguel) {
      return res.status(404).json({ error: 'Aluguel não encontrado' });
    }

    await aluguel.update({
      nome_imovel,
      descricao,
      valor_aluguel,
      quartos,
      banheiro,
      dia_vencimento,
      foto_capa: fotoCapa || aluguel.foto_capa,
      foto_adicional: fotoAdicional.length ? JSON.stringify(fotoAdicional) : aluguel.foto_adicional
    });

    res.status(200).json({
      ...aluguel.toJSON(),
      foto_capa: aluguel.foto_capa,
      foto_adicional: JSON.parse(aluguel.foto_adicional),
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar aluguel' });
  }
});

// Rota para marcar um imóvel como alugado ou desocupado
router.put('/:id/alugado', async (req, res) => {
    try {
      const { id } = req.params;
      const { alugado } = req.body; // Recebe o status atualizado
      const aluguel = await db.Aluguel.findByPk(id);
      
      if (!aluguel) {
        return res.status(404).json({ error: 'Aluguel não encontrado' });
      }
  
      await aluguel.update({ alugado }); // Atualiza o campo `alugado` conforme o valor recebido
      res.status(200).json({ message: `Imóvel ${alugado ? 'marcado como alugado' : 'marcado como disponível'}` });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar o status do imóvel' });
    }
  });

// Rota para excluir um aluguel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const aluguel = await db.Aluguel.findByPk(id);
    
    if (!aluguel) {
      return res.status(404).json({ error: 'Aluguel não encontrado' });
    }

    // Remover arquivos do sistema de arquivos
    if (aluguel.foto_capa) {
      fs.unlinkSync(path.join(uploadDirectory, 'capa', aluguel.foto_capa));
    }
    if (aluguel.foto_adicional && Array.isArray(JSON.parse(aluguel.foto_adicional))) {
      JSON.parse(aluguel.foto_adicional).forEach(file => {
        fs.unlinkSync(path.join(uploadDirectory, 'adicional', file));
      });
    }

    await aluguel.destroy();
    res.status(200).json({ message: 'Aluguel deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar aluguel' });
  }
});

// Rota para baixar todas as fotos em um arquivo ZIP
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const aluguel = await db.Aluguel.findByPk(id);
    
    if (!aluguel) {
      return res.status(404).json({ error: 'Aluguel não encontrado' });
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.attachment('fotos.zip');
    archive.pipe(res);

    // Adiciona arquivos do diretório
    const directories = ['capa', 'adicional'];
    directories.forEach(dir => {
      const dirPath = path.join(uploadDirectory, dir);
      if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
          archive.file(path.join(dirPath, file), { name: path.join(dir, file) });
        });
      }
    });

    archive.finalize();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o arquivo ZIP' });
  }
});

module.exports = router;
