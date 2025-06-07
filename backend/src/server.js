const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

let startCronJobs;
try {
  startCronJobs = require('./routes/cronJobs');
} catch (error) {
  console.log('⚠️ Cron jobs não disponível');
}

const app = express();
app.use(requestIp.mw());
app.use(cors());

// ===== FUNÇÃO PARA ORGANIZAR UPLOADS NA INICIALIZAÇÃO =====
const organizeUploads = () => {
  const uploadsPath = path.join(__dirname, '../uploads');
  
  console.log('\n🔧 Organizando estrutura de uploads...');
  
  try {
    // 1. Mover arquivos de diretórios aninhados para os corretos
    const problematicPaths = [
      { from: 'corretor/imagem_correspondente', to: 'imagem_correspondente' },
      { from: 'imagem_user/imagem_correspondente', to: 'imagem_correspondente' },
      { from: 'imagem_user/imagem_administrador', to: 'imagem_administrador' },
      { from: 'corretor/imagem_administrador', to: 'imagem_administrador' },
    ];
    
    problematicPaths.forEach(({ from, to }) => {
      const fromPath = path.join(uploadsPath, from);
      const toPath = path.join(uploadsPath, to);
      
      if (fs.existsSync(fromPath)) {
        // Criar diretório destino se não existir
        if (!fs.existsSync(toPath)) {
          fs.mkdirSync(toPath, { recursive: true });
        }
        
        // Mover todos os arquivos
        const files = fs.readdirSync(fromPath);
        files.forEach(file => {
          const oldFile = path.join(fromPath, file);
          const newFile = path.join(toPath, file);
          
          if (!fs.existsSync(newFile)) {
            fs.copyFileSync(oldFile, newFile);
            console.log(`✅ Movido: ${file} de ${from} para ${to}`);
          }
        });
        
        // Remover diretório vazio após mover arquivos
        try {
          fs.rmSync(fromPath, { recursive: true, force: true });
          console.log(`🗑️ Removido diretório aninhado: ${from}`);
        } catch (error) {
          console.log(`⚠️ Não foi possível remover ${from}: ${error.message}`);
        }
      }
    });
    
    // 2. Remover diretórios pais vazios
    ['corretor', 'imagem_user'].forEach(parentDir => {
      const parentPath = path.join(uploadsPath, parentDir);
      if (fs.existsSync(parentPath)) {
        try {
          const contents = fs.readdirSync(parentPath);
          if (contents.length === 0) {
            fs.rmdirSync(parentPath);
            console.log(`🗑️ Removido diretório vazio: ${parentDir}`);
          }
        } catch (error) {
          // Ignorar erros se o diretório não estiver vazio
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao organizar uploads:', error.message);
  }
};

// ===== MIDDLEWARE PERSONALIZADO PARA BUSCAR ARQUIVOS =====
const findFileMiddleware = (req, res, next) => {
  const requestedPath = req.path;
  const uploadsPath = path.join(__dirname, '../uploads');
  
  console.log(`🔍 Buscando arquivo: ${requestedPath}`);
  
  // Lista de possíveis localizações para o arquivo
  const possiblePaths = [
    // Caminho direto solicitado
    path.join(uploadsPath, requestedPath),
    
    // Mapeamentos específicos para correção
    path.join(uploadsPath, 'imagem_correspondente', path.basename(requestedPath)),
    path.join(uploadsPath, 'imagem_administrador', path.basename(requestedPath)),
    path.join(uploadsPath, 'corretor', path.basename(requestedPath)),
    path.join(uploadsPath, 'clientes', path.basename(requestedPath)),
    path.join(uploadsPath, 'imoveis', path.basename(requestedPath)),
    
    // Casos específicos do seu log
    requestedPath.includes('imagem_correspondente') ? 
      path.join(uploadsPath, 'imagem_correspondente', path.basename(requestedPath)) : null,
    
    requestedPath.includes('corretor') ? 
      path.join(uploadsPath, 'corretor', path.basename(requestedPath)) : null,
  ].filter(Boolean);
  
  // Tentar encontrar o arquivo em cada localização possível
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ Arquivo encontrado em: ${filePath}`);
      return res.sendFile(filePath);
    }
  }
  
  console.log(`❌ Arquivo não encontrado: ${requestedPath}`);
  console.log(`📍 Caminhos testados:`, possiblePaths);
  next();
};

// ===== ROTAS DE UPLOAD PRIMEIRO =====
app.use('/api/corretor', corretorRoutes);
app.use('/api/correspondente', correspondenteRoutes);
app.use('/api/administrador', adminRoutes);
app.use('/api/auth', authRoutes);

// ===== BODY PARSER DEPOIS =====
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ===== ROTAS DE ARQUIVOS ESTÁTICOS COM MIDDLEWARE PERSONALIZADO =====
// Usar o middleware personalizado antes do express.static
app.use('/api/uploads', findFileMiddleware);

// Manter as rotas estáticas como fallback
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../Uploads'))); // Compatibilidade

// Rotas específicas organizadas
app.use('/api/uploads/imagem_correspondente', express.static(path.join(__dirname, '../uploads/imagem_correspondente')));
app.use('/api/uploads/imagem_administrador', express.static(path.join(__dirname, '../uploads/imagem_administrador')));
app.use('/api/uploads/corretor', express.static(path.join(__dirname, '../uploads/corretor')));
app.use('/api/uploads/correspondente', express.static(path.join(__dirname, '../uploads/imagem_correspondente'))); // Alias
app.use('/api/uploads/imagem_user', express.static(path.join(__dirname, '../uploads/imagem_correspondente'))); // Redirecionamento
app.use('/api/uploads/imoveis', express.static(path.join(__dirname, '../uploads/imoveis')));
app.use('/api/uploads/clientes', express.static(path.join(__dirname, '../uploads/clientes')));

// ===== OUTRAS ROTAS =====
app.use('/api', configurationsRoute);
app.use('/api', clienteRoutes);
app.use('/api', reportRoutes);
app.use('/api', locationsRoute);
app.use('/api/user', userRoutes);
app.use('/api/clientes', listadeclientesRoutes);
app.use('/api/alugueis', alugueisRouter);
app.use('/notas', notasRoutes);
app.use('/api/imoveis', imoveisRouter);
app.use('/api/protected', protectedRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/listadecorretores', listadecorretores);
app.use('/api', notasRouter);
app.use('/api', lembreteRoutes);
app.use('/api', whatsappRoutes);
app.use('/api/acessos', acessosRoutes);
app.use('/api', clienteAluguelRoutes);

// ===== ROTAS UTILITÁRIAS =====

// Rota de teste para verificar se os arquivos existem
app.get('/api/test-file/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const uploadsPath = path.join(__dirname, '../uploads');
  
  // Locais possíveis para o arquivo
  const possiblePaths = [
    path.join(uploadsPath, type, filename),
    path.join(uploadsPath, 'imagem_correspondente', filename),
    path.join(uploadsPath, 'imagem_administrador', filename),
    path.join(uploadsPath, 'corretor', filename),
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return res.json({ 
        exists: true, 
        path: filePath,
        url: `${req.protocol}://${req.get('host')}/api/uploads/${type}/${filename}`,
        actualLocation: filePath
      });
    }
  }
  
  res.status(404).json({ 
    exists: false, 
    searchedPaths: possiblePaths,
    message: 'Arquivo não encontrado em nenhuma localização'
  });
});

// Rota para listar arquivos em um diretório de upload
app.get('/api/list-uploads/:type?', (req, res) => {
  const { type } = req.params;
  
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
      size: file.isFile() ? fs.statSync(path.join(uploadsPath, file.name)).size : null,
      url: file.isDirectory() 
        ? null 
        : `${req.protocol}://${req.get('host')}/api/uploads/${type ? type + '/' : ''}${file.name}`
    }));

    res.json({
      path: uploadsPath,
      files: result,
      total: result.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao listar arquivos',
      message: error.message
    });
  }
});

// Rota para reorganizar uploads manualmente
app.post('/api/reorganize-uploads', (req, res) => {
  try {
    organizeUploads();
    res.json({
      success: true,
      message: 'Uploads reorganizados com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao reorganizar uploads',
      message: error.message
    });
  }
});

// Rota para mapear arquivo específico
app.get('/api/find-file/:filename', (req, res) => {
  const { filename } = req.params;
  const uploadsPath = path.join(__dirname, '../uploads');
  
  // Buscar arquivo recursivamente
  const findFileRecursive = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        const found = findFileRecursive(fullPath);
        if (found) return found;
      } else if (file.name === filename) {
        return fullPath;
      }
    }
    return null;
  };
  
  const foundPath = findFileRecursive(uploadsPath);
  
  if (foundPath) {
    const relativePath = path.relative(uploadsPath, foundPath);
    res.json({
      found: true,
      path: foundPath,
      relativePath: relativePath,
      url: `${req.protocol}://${req.get('host')}/api/uploads/${relativePath.replace(/\\/g, '/')}`
    });
  } else {
    res.status(404).json({
      found: false,
      filename,
      message: 'Arquivo não encontrado'
    });
  }
});

// ===== MANIPULAÇÃO DE ERROS =====
app.use((err, req, res, next) => {
  console.error('🚨 Global error handler:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Arquivo muito grande',
      message: 'O arquivo excede o tamanho máximo permitido'
    });
  }

  if (err.message === 'Unexpected end of form') {
    return res.status(400).json({
      error: 'Erro no upload',
      message: 'Dados do formulário incompletos. Tente novamente.'
    });
  }

  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

// ===== INICIALIZAÇÃO DO SERVIDOR =====
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Diretório de uploads: ${path.join(__dirname, '../uploads')}`);
  
  // Organizar uploads na inicialização
  organizeUploads();
  
  // Verificar estrutura de diretórios
  const fs = require('fs');
  const uploadDirs = ['corretor', 'correspondente', 'imoveis', 'clientes',];
  
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