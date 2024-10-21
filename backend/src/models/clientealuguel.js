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
      allowNull: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Email deve ser um endereço de email válido.',
        },
      },
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false,
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
    pago: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    historico_pagamentos: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  }, {
    sequelize,
    modelName: 'ClienteAluguel',
  });

  return ClienteAluguel;
};
