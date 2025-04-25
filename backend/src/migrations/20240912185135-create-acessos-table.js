'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('acessos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ip: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      referer: {
        type: Sequelize.STRING(255)
      },
      userAgent: {
        type: Sequelize.STRING(255)
      },
      timestamp: {
        type: Sequelize.DATE
      },
      corretorId: {
        type: Sequelize.INTEGER,
        references: { model: 'corretores', key: 'id' }
      },
      correspondenteId: {
        type: Sequelize.INTEGER,
        references: { model: 'correspondents', key: 'id' }
      },
      administradorId: {
        type: Sequelize.INTEGER,
        references: { model: 'administradors', key: 'id' }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('acessos');
  }
};