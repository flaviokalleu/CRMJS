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
const { checkKey, releaseKey } = require('./middleware/checkKeyMiddleware');
const requestIp = require('request-ip');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // desativa logs
});

// Importar e iniciar os cron jobs
const startCronJobs = require('./routes/cronJobs');


const app = express();
app.use(requestIp.mw());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let isKeyValid = true; // Variável para armazenar a validade da chave

// Função para validar a chave antes de iniciar o servidor
const startServer = async () => {
    isKeyValid = await checkKey(); // Verifica a chave uma vez ao iniciar
    if (!isKeyValid) {
        console.error('Key is invalid. Server will not start.');
        process.exit(1); // Sai do processo se a chave for inválida
    }

    const PORT = process.env.PORT || 8000;

    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);

        try {
            await sequelize.authenticate();
            console.log('Database connection has been established successfully.');
            await sequelize.sync();
            console.log('Models synchronized with the database');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }

        // Iniciar os cron jobs quando o servidor iniciar
        startCronJobs();
    });
};

// Middleware para verificar se a chave é válida nas rotas protegidas
const keyMiddleware = (req, res, next) => {
    if (!isKeyValid) {
        return res.status(403).json({ message: 'Key is invalid or not in use.' });
    }
    next(); // Chave válida, continua para a próxima middleware ou rota
};

// Definindo as rotas
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
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

// Adiciona o middleware de verificação de chave nas rotas que precisam
app.use('/api', keyMiddleware); // Aplica o middleware nas rotas com prefixo /api

// Adiciona o releaseKey ao shutdown da aplicação
process.on('SIGINT', async () => {
    console.log('Liberando a chave antes de sair...');
    await releaseKey();
    process.exit();
});

// Iniciar o servidor
startServer();

module.exports = sequelize;
