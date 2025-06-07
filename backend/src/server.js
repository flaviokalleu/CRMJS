const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { router: authRoutes } = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const corretorRoutes = require('./routes/corretorRoutes');
const correspondenteRoutes = require('./routes/correspondente');
const listadecorretores = require('./routes/listadecorretores');
const clienteRoutes = require('./routes/clientes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const listadeclientesRoutes = require('./routes/listadeclientes');
const imoveisRouter = require('./routes/imoveis.js');
const notasRouter = require('./routes/notas');
const configurationsRoute = require('./routes/configurations');
const notasRoutes = require('./routes/notasRoutes');
const locationsRoute = require('./routes/locations');
const alugueisRouter = require('./routes/alugueis');
const whatsappRoutes = require('./routes/whatsappRoutes');
const lembreteRoutes = require('./routes/lembreteRoutes');
const acessosRoutes = require('./routes/acessos');
const clienteAluguelRoutes = require('./routes/clienteAluguel');
const requestIp = require('request-ip');

// Importar o db configurado
const { sequelize } = require('./config/database');

const startCronJobs = require('./routes/cronJobs');

const app = express();
app.use(requestIp.mw());
app.use(cors());

// ===== ROTAS DE UPLOAD PRIMEIRO =====
app.use('/api/corretor', corretorRoutes);

// ===== BODY PARSER DEPOIS =====
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===== ROTAS DE ARQUIVOS ESTÁTICOS =====
// Servir arquivos de upload com diferentes caminhos
app.use('/api/uploads', express.static(path.join(__dirname, '../Uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas específicas para cada tipo de upload
app.use('/api/uploads/corretor', express.static(path.join(__dirname, '../uploads/corretor')));
app.use('/api/uploads/correspondente', express.static(path.join(__dirname, '../uploads/correspondente')));
app.use('/api/uploads/imagem_user', express.static(path.join(__dirname, '../uploads/imagem_user')));
app.use('/api/uploads/imoveis', express.static(path.join(__dirname, '../uploads/imoveis')));
app.use('/api/uploads/clientes', express.static(path.join(__dirname, '../uploads/clientes')));

// ===== OUTRAS ROTAS =====
app.use('/api', configurationsRoute);
app.use('/api', clienteRoutes);
app.use('/api', reportRoutes);
app.use('/api', locationsRoute);
app.use('/api/user', userRoutes);
app.use('/api/administrador', adminRoutes);
app.use('/api/clientes', listadeclientesRoutes);
app.use('/api/alugueis', alugueisRouter);
app.use('/api/auth', authRoutes);
app.use('/notas', notasRoutes);
app.use('/api/imoveis', imoveisRouter);
app.use('/api/protected', protectedRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/correspondente', correspondenteRoutes);
app.use('/api/listadecorretores', listadecorretores);
app.use('/api', notasRouter);
app.use('/api', lembreteRoutes);
app.use('/api', whatsappRoutes);
app.use('/api/acessos', acessosRoutes);
app.use('/api', clienteAluguelRoutes);

// Rota de teste para verificar se os arquivos existem
app.get('/api/test-file/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', type, filename);
  
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.json({ 
      exists: true, 
      path: filePath,
      url: `${req.protocol}://${req.get('host')}/api/uploads/${type}/${filename}`
    });
  } else {
    res.status(404).json({ 
      exists: false, 
      path: filePath,
      message: 'Arquivo não encontrado'
    });
  }
});

// Rota para listar arquivos em um diretório de upload
app.get('/api/list-uploads/:type?', (req, res) => {
  const { type } = req.params;
  const fs = require('fs');
  
  try {
    const uploadsPath = type 
      ? path.join(__dirname, '../uploads', type)
      : path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsPath)) {
      return res.status(404).json({ 
        error: 'Diretório não encontrado',
        path: uploadsPath
      });
    }

    const files = fs.readdirSync(uploadsPath, { withFileTypes: true });
    const result = files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      url: file.isDirectory() 
        ? null 
        : `${req.protocol}://${req.get('host')}/api/uploads/${type ? type + '/' : ''}${file.name}`
    }));

    res.json({
      path: uploadsPath,
      files: result
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao listar arquivos',
      message: error.message
    });
  }
});

// Manipulação de erros globais
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Middleware para log de requisições de arquivos estáticos (debug)
app.use('/api/uploads', (req, res, next) => {
  console.log(`🔍 Tentativa de acesso ao arquivo: ${req.url}`);
  console.log(`📁 Caminho completo: ${path.join(__dirname, '../uploads', req.url)}`);
  next();
});

// Iniciar o servidor
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`📁 Diretório de uploads: ${path.join(__dirname, '../uploads')}`);
  
  // Verificar se os diretórios existem
  const fs = require('fs');
  const uploadDirs = ['corretor', 'correspondente', 'imagem_user', 'imoveis', 'clientes'];
  
  uploadDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '../uploads', dir);
    if (fs.existsSync(dirPath)) {
      console.log(`✅ Diretório existe: ${dirPath}`);
    } else {
      console.log(`❌ Diretório não existe: ${dirPath}`);
    }
  });
});

// Export both the app and sequelize instance
module.exports = {
  app,
  sequelize
};