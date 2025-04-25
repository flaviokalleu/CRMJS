const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Carrega as variáveis de ambiente
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Log das variáveis de ambiente para depuração
console.log('Environment variables:', {
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD ? '[REDACTED]' : 'undefined',
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT
});

const username = process.env.DB_USERNAME || 'postgres';
const password = String(process.env.DB_PASSWORD || ''); // Garante que seja string
const database = process.env.DB_NAME || 'crm';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '5432';
const dialect = 'postgres';

// Configuração para o Sequelize CLI
const cliConfig = {
  development: {
    database,
    username,
    password,
    host,
    port,
    dialect,
    logging: console.log
  },
  test: {
    database: process.env.DB_NAME_TEST || 'crm_test',
    username,
    password,
    host,
    port,
    dialect,
    logging: console.log
  },
  production: {
    database: process.env.DB_NAME || 'crm',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    dialect,
    logging: console.log
    
  }
};

// Configuração para o runtime do aplicativo
const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect,
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    application_name: 'crm-app',
    ssl: false // Desativar SSL para localhost
  }
});

const db = {};

// Carregar todos os modelos
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'database.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const modelPath = path.join(__dirname, file);
    const model = require(modelPath);

    if (typeof model === 'function') {
      const modelInstance = model(sequelize, Sequelize.DataTypes);
      db[modelInstance.name] = modelInstance;
    } else if (model instanceof Sequelize.Model) {
      db[model.name] = model;
    } else {
      throw new Error(`Modelo em ${file} não é uma função ou classe válida`);
    }
  });

// Carregar associações
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Testar conexão ao inicializar (para depuração)
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });

// Exportar tanto o db quanto a configuração para o CLI
module.exports = {
  ...db, // Exporta db.sequelize, db.Sequelize e modelos
  ...cliConfig // Exporta development, test, production para o CLI
};