const { Model, DataTypes } = require('sequelize');

class WhatsApp extends Model {}

const initializeWhatsAppModel = (sequelize) => {
  WhatsApp.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      receiver: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      authenticated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'WhatsApp',
      tableName: 'whatsapps',
    }
  );

  return WhatsApp;
};

module.exports = initializeWhatsAppModel;
