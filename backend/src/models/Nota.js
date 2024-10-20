'use strict';
const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  class Nota extends Model {
    static associate(models) {
      // Associação de Nota com Cliente (muitos para um)
      Nota.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id', // Usando `cliente_id` como chave estrangeira
        as: 'cliente'
      });
    }
  }

  Nota.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, // Define o ID como autoincrementado
      primaryKey: true,    // Define o ID como chave primária
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes', // Nome da tabela associada
        key: 'id'
      }
    },
    processoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nova: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    destinatario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    texto: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    criado_por_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdat: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedat: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    }
  }, 
  {
    sequelize,
    modelName: 'Nota',
    tableName: 'notas',
    timestamps: true, // Isso gerará automaticamente as colunas createdAt e updatedAt
    createdAt: 'createdat', // Nome da coluna para a data de criação
    updatedAt: 'updatedat'  // Nome da coluna para a data de atualização
  });

  return Nota;
};
