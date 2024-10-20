'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Correspondente extends Model {
    static associate(models) {
      // Define associations here if needed
    }

    // Método de instância para verificar a senha
    async verifyPassword(password) {
      // Decodifica a senha armazenada em Base64
      const decodedPassword = Buffer.from(this.password, 'base64').toString();
      return decodedPassword === password; // Compara a senha decodificada com a fornecida
    }
  }

  Correspondente.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pix_account: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Correspondente',
    tableName: 'correspondents',
  });

  return Correspondente;
};
