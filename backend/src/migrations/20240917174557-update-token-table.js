'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('token', 'userType', {
      type: Sequelize.STRING,  // Adiciona o tipo de usuário (corretor, correspondente, administrador)
      allowNull: false,        // Faz com que o campo seja obrigatório
    });
   

    // Se houver necessidade de algum índice para otimizar as consultas com userId
    await queryInterface.addIndex('token', ['userId']);
  },

  down: async (queryInterface, Sequelize) => {
    // Reverte as alterações feitas na tabela token
    await queryInterface.removeColumn('token', 'userType');
    
    await queryInterface.removeIndex('token', ['userId']);
  }
};
