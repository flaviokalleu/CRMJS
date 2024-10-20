const sequelize = require('./database'); // ajuste o caminho conforme necessário
const Administrador = require('../models/administrador'); // ajuste o caminho conforme necessário

async function syncDatabase() {
    try {
        // Sincroniza todos os modelos definidos com o banco de dados
        await sequelize.sync({ force: true }); // 'force: true' recria as tabelas, remova se não desejar essa opção
        console.log('Banco de dados sincronizado com sucesso!');
    } catch (error) {
        console.error('Erro ao sincronizar o banco de dados:', error);
    }
}

syncDatabase();
