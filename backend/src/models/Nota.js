'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
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
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    processo_id: DataTypes.INTEGER,
    nova: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    destinatario: DataTypes.STRING,
    texto: DataTypes.TEXT,
    data_criacao: DataTypes.DATE,
    criado_por_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Nota',
    tableName: 'notas',
    underscored: true,
    timestamps: true
  });

  Nota.associate = function(models) {
    Nota.belongsTo(models.Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
  };

  return Nota;
};
