'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClienteAluguel extends Model {
    static associate(models) {
      // Nenhuma associação, pois são independentes
    }
  }

  ClienteAluguel.init({
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permite que seja nulo para que seja gerado automaticamente
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false, // Garante que o nome não pode ser nulo
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false, // Garante que o CPF não pode ser nulo
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // Garante que o email não pode ser nulo
      validate: {
        isEmail: {
          msg: 'Email deve ser um endereço de email válido.',
        },
      },
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false, // Garante que o telefone não pode ser nulo
    },
    valor_aluguel: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'O campo valor_aluguel não pode ser nulo.',
        },
        isDecimal: {
          msg: 'O campo valor_aluguel deve ser um número decimal.',
        },
      },
    },
    dia_vencimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'O campo dia_vencimento não pode ser nulo.',
        },
        isInt: {
          msg: 'O campo dia_vencimento deve ser um número inteiro.',
        },
      },
    },
  }, {
    sequelize,
    modelName: 'ClienteAluguel',
  });

  return ClienteAluguel;
};
