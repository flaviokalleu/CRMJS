'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Administrador extends Model {
    static associate(models) {
      // define associations here
    }

    // Método de instância para verificar a senha
    async verifyPassword(password) {
      // Decodifica a senha armazenada em Base64
      const decodedPassword = Buffer.from(this.password, 'base64').toString();
      return decodedPassword === password; // Compara a senha decodificada com a fornecida
    }
  }

  Administrador.init({
    username: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    address: DataTypes.STRING,
    pix_account: DataTypes.STRING,
    photo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Administrador',
    tableName: 'administradors', // Certifique-se de que o nome da tabela está correto
  });

  return Administrador;
};
