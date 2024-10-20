'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('token', 'refreshToken', {
      type: Sequelize.STRING,
      allowNull: false, // Você pode definir como true se preferir
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('token', 'refreshToken');
  }
};
