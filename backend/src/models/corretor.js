const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Corretor extends Model {
    static associate(models) {
      // Define a associação com o modelo Cliente
      Corretor.hasMany(models.Cliente, {
        foreignKey: 'corretorId',
        as: 'clientes'
      });
    }

    // Método para verificar a senha
    async verifyPassword(password) {
      // Decodifica a senha armazenada em Base64
      const decodedPassword = Buffer.from(this.password, 'base64').toString();
      return decodedPassword === password; // Compara a senha decodificada com a fornecida
    }
  }

  Corretor.init({
    username: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    telefone: DataTypes.STRING,
    password: DataTypes.STRING, // A senha será armazenada em Base64
    creci: DataTypes.STRING,
    address: DataTypes.STRING,
    pix_account: DataTypes.STRING,
    photo: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Corretor',
    tableName: 'corretores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Corretor;
};
