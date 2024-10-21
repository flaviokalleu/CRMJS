'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.bulkInsert('administradors', [{
        username: 'admin',
        first_Name: 'Admin',
        last_Name: 'User',
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

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('administradors', null, {});
  }
};
