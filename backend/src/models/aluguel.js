// models/aluguel.js
module.exports = (sequelize, DataTypes) => {
  const Aluguel = sequelize.define('Aluguel', {
    nome_imovel: DataTypes.STRING,
    descricao: DataTypes.STRING,
    valor_aluguel: DataTypes.FLOAT,
    quartos: DataTypes.INTEGER,
    banheiro: DataTypes.INTEGER,
    dia_vencimento: DataTypes.INTEGER,
    foto_capa: DataTypes.STRING,
    alugado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    foto_adicional: {
      type: DataTypes.TEXT, // Altere para TEXT para armazenar uma string JSON
      get() {
        const value = this.getDataValue('foto_adicional');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('foto_adicional', JSON.stringify(value));
      }
    }
  }, {
    tableName: 'alugueis' // Definido corretamente aqui
  });

  return Aluguel;
};
