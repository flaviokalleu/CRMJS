require('dotenv').config(); // Certifique-se de que isso está no início do arquivo
const { Sequelize } = require('sequelize');
const { Estado, Municipio } = require('./models'); // Certifique-se de que o caminho está correto
const axios = require('axios');

// Configuração manual do Sequelize com informações explícitas
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Nome do banco de dados
  process.env.DB_USERNAME, // Nome de usuário
  process.env.DB_PASSWORD, // Senha
  {
    host: process.env.DB_HOST, // Host do banco de dados
    dialect: 'postgres', // Tipo de banco de dados
    logging: false,  // Defina como `true` se quiser ver os logs SQL
  }
);

const fetchMunicipios = async () => {
  try {
    const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/distritos');
    console.log('Dados retornados:', response.data); // Adicione este log
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do IBGE:', error);
    throw error;
  }
};

const populateDatabase = async () => {
  const municipios = await fetchMunicipios();
  const estados = {};

  // Sincroniza os modelos com o banco de dados, com a opção de recriar as tabelas
  await sequelize.sync({ force: true });

  // Verifique a estrutura dos dados
  console.log('Estrutura dos dados de municípios:', municipios);

  for (const municipio of municipios) {
    // Verifique a estrutura do objeto `municipio`
    console.log('Municipio:', municipio);

    const estadoNome = municipio.municipio?.microrregiao?.mesorregiao?.UF?.nome; // Nome do estado
    const estadoSigla = municipio.municipio?.microrregiao?.mesorregiao?.UF?.sigla; // Sigla do estado

    if (!estadoNome || !estadoSigla) {
      console.warn('Dados de estado inválidos:', municipio);
      continue; // Pule este item se os dados forem inválidos
    }

    // Verifique se o estado já existe, se não existir, crie-o
    if (!estados[estadoSigla]) {
      const [estado] = await Estado.findOrCreate({
        where: { sigla: estadoSigla },
        defaults: { nome: estadoNome, sigla: estadoSigla },
      });
      estados[estadoSigla] = estado;
    }

    // Verifique se o município já existe antes de criar um novo
    const [municipioExistente] = await Municipio.findOrCreate({
      where: { nome: municipio.nome, estadoId: estados[estadoSigla].id },
      defaults: { estadoId: estados[estadoSigla].id },
    });

    if (municipioExistente) {
      console.log(`Município já existe: ${municipioExistente.nome}`);
    } else {
      console.log(`Município criado: ${municipio.nome}`);
    }
  }

  console.log('Banco de dados populado com sucesso!');
};

console.log('Database Config:', {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST,
});

populateDatabase()
  .then(() => sequelize.close())
  .catch((error) => {
    console.error('Erro ao popular o banco de dados:', error);
    sequelize.close();
  });
