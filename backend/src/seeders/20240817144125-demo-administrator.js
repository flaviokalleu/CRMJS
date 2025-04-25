'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar se a tabela administradors existe
      const tableExists = await queryInterface.tableExists('administradors');
      if (!tableExists) {
        console.error('Tabela administradors não existe.');
        return;
      }

      // Inserir dados com os nomes de colunas corretos
      await queryInterface.bulkInsert('administradors', [{
        username: 'admin',
        first_name: 'Admin', // Corrigido de first_Name para firstname
        last_name: 'User',   // Corrigido de last_Name para lastname
        email: 'admin@admin.com',
        phone: '1234567890',
        password: Buffer.from('admin').toString('base64'), // Codificando a senha em Base64
        address: '123 Admin St',
        pix_account: '123456',
        photo: 'admin.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    } catch (error) {
      console.error('Erro ao inserir dados no seeder:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('administradors', null, {});
  }
};