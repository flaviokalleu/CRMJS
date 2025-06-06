'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    nome: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    valor_renda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    estado_civil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    naturalidade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profissao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data_admissao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_nascimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    renda_tipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    possui_carteira_mais_tres_anos: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    numero_pis: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    possui_dependente: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    documentos_pessoais: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extrato_bancario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentos_dependente: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentos_conjuge: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'aguardando_aprovação'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'clientes',
    underscored: true, // importante!
  });

  Cliente.associate = function(models) {
    Cliente.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Cliente.hasMany(models.Nota, { foreignKey: 'cliente_id', as: 'notas' });
  };

  return Cliente;
};
