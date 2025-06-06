const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Exemplo: se quiser manter associação com clientes
      User.hasMany(models.Cliente, {
        foreignKey: 'user_id',
        as: 'clientes'
      });
      // Adicione outras associações conforme necessário
    }

    // Método para verificar a senha
    async verifyPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  User.init({
    username: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    telefone: DataTypes.STRING,
    password: DataTypes.STRING,
    creci: DataTypes.STRING,
    address: DataTypes.STRING,
    pix_account: DataTypes.STRING,
    photo: DataTypes.STRING,
    // Flags de papel
    is_corretor: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_administrador: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_correspondente: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};