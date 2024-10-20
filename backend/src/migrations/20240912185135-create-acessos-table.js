'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('acessos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      referer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      corretorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'corretores', // Nome da tabela referenciada
          key: 'id' // Chave primária da tabela referenciada
        }
      },
      correspondenteId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'correspondents', // Nome da tabela referenciada
          key: 'id' // Chave primária da tabela referenciada
        }
      },
      administradorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'administradors', // Nome da tabela referenciada
          key: 'id' // Chave primária da tabela referenciada
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('acessos');
  }
};
