const { Sequelize } = require('sequelize');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Carrega as variáveis de ambiente do .env

const environment = process.env.NODE_ENV || 'development';

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const host = process.env.DB_HOST;
const dialect = process.env.DB_DIALECT;

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  logging: false, // Você pode habilitar o logging para depuração
});

module.exports = sequelize;
