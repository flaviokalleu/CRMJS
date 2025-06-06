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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// Função para iniciar o servidor
const startServer = async () => {
  const PORT = process.env.PORT || 8000;

  try {
    // Testar conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sincronizar modelos
    await sequelize.sync({ alter: true }); // Use alter: true para ajustar tabelas existentes
    console.log('Models synchronized with the database');

    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      startCronJobs();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Encerra o processo se a conexão falhar
  }
};

// Definindo as rotas
app.use('/api/uploads', express.static(path.join(__dirname, '../Uploads')));
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
app.use('/api/corretor', corretorRoutes);
app.use('/api/correspondente', correspondenteRoutes);
app.use('/api/listadecorretores', listadecorretores);
app.use('/api', notasRouter);
app.use('/api', lembreteRoutes);
app.use('/api', whatsappRoutes);
app.use('/api/acessos', acessosRoutes);
app.use('/api', clienteAluguelRoutes);

// Manipulação de erros globais
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Iniciar o servidor
startServer();

// Export both the app and sequelize instance
module.exports = {
  app,
  sequelize
};