const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Token', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    refreshToken: {
      type: DataTypes.STRING(255), // Adicionando refreshToken
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER, // ID do usuário (corretor, correspondente ou administrador)
      allowNull: false
    },
    userType: {
      type: DataTypes.ENUM('corretor', 'correspondente', 'administrador'), // Diferencia o tipo de usuário
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true, // Pode ser null se não for necessário
      defaultValue: null // Valor padrão
    },
  }, {
    sequelize,
    tableName: 'token',
    timestamps: true, // Mantém as colunas createdAt e updatedAt
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "userId_userType_index", // Index para combinar userId e userType para garantir unicidade lógica
        using: "BTREE",
        fields: [
          { name: "userId" },
          { name: "userType" },
        ]
      }
    ]
  });
};
