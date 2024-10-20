'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionando a coluna email na tabela token
    await queryInterface.addColumn('token', 'email', {
      type: Sequelize.STRING,
      allowNull: false, // O campo não pode ser nulo
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Removendo a coluna email da tabela token
    await queryInterface.removeColumn('token', 'email');
  }
};
