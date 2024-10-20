const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Imovel = sequelize.define('Imovel', {
    nome_imovel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descricao_imovel: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    endereco: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quartos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    banheiro: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: true
    },
    valor_avaliacao: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    valor_venda: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    documentacao: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imagens: {
      type: DataTypes.JSON,
      allowNull: true
    },
    imagem_capa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    localizacao: {
      type: DataTypes.STRING,
      allowNull: true
    },
    exclusivo: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    tem_inquilino: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    situacao_imovel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize, // Instância do Sequelize
    modelName: 'Imovel', // Nome do modelo
    tableName: 'imoveis', // Nome da tabela no banco de dados
    timestamps: true, // Adiciona campos `createdAt` e `updatedAt`
  });

  return Imovel;
};
