'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cliente extends Model {
    static associate(models) {
      // Associação de Cliente com Corretor (muitos para um)
      Cliente.belongsTo(models.Corretor, {
        foreignKey: 'corretorId',
        as: 'corretor'
      });
      
      // Associação de Cliente com Nota (um para muitos)
      Cliente.hasMany(models.Nota, {
        foreignKey: 'cliente_id', // Usando `cliente_id` como chave estrangeira
        as: 'notas'
      });
    }
  }

  Cliente.init({
    nome: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    valor_renda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    estado_civil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    naturalidade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profissao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data_admissao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_nascimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    renda_tipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    possui_carteira_mais_tres_anos: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    numero_pis: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    possui_dependente: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    documentos_pessoais: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extrato_bancario: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentos_dependente: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentos_conjuge: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'aguardando_aprovação'
    },
    
  }, {
    sequelize,
    modelName: 'Cliente',
    tableName: 'clientes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Cliente;
};
