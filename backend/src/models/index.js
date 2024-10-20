const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

// Carregar as variáveis de ambiente do arquivo .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'gci',
  process.env.DB_USERNAME || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
  }
);

const db = {};

// Carregar todos os modelos
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const modelPath = path.join(__dirname, file);
    const model = require(modelPath);

    // Se o modelo é uma função, então é necessário invocá-lo com o sequelize e DataTypes
    if (typeof model === 'function') {
      const modelInstance = model(sequelize, Sequelize.DataTypes);
      db[modelInstance.name] = modelInstance;
    } else if (model instanceof Sequelize.Model) {
      // Se o modelo é uma instância da classe Sequelize.Model
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

module.exports = db;
