// backend/models/acesso.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Acesso = sequelize.define('Acesso', {
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
    // Removido correspondenteId e administradorId
  }, {
    tableName: 'acessos',
    underscored: true
  });

  Acesso.associate = (models) => {
    Acesso.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Acesso;
};
