// backup.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const { google } = require('googleapis');
const archiver = require('archiver');
require('dotenv').config();

const performBackup = async () => {
  try {
    const sqlFilePath = './backup/gci.sql'; // Caminho do arquivo SQL
    const uploadsBackupPath = './backup/uploads'; // Caminho da pasta de uploads
    const zipFilePath = './backup/backup.zip'; // Caminho do arquivo ZIP
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Inicia a conexão
    connection.connect(err => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
      }
      console.log('Conectado ao banco de dados.');
    });

    // Realiza o backup das tabelas
    connection.query('SHOW TABLES', async (err, tables) => {
      if (err) {
        console.error('Erro ao obter tabelas:', err);
        connection.end(); // Fecha a conexão em caso de erro
        return;
      }

      let sqlDump = '';

      for (const table of tables) {
        const tableName = table[`Tables_in_${process.env.DB_NAME}`];

        // Adiciona comando para criar a tabela
        sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;

        const createTableQuery = `SHOW CREATE TABLE \`${tableName}\``;
        const [createTable] = await connection.promise().query(createTableQuery);
        sqlDump += `${createTable[0]['Create Table']};\n\n`;

        // Adiciona os dados da tabela
        const selectQuery = `SELECT * FROM \`${tableName}\``;
        const [rows] = await connection.promise().query(selectQuery);

        if (rows.length > 0) {
          rows.forEach(row => {
            sqlDump += `INSERT INTO \`${tableName}\` SET `;
            sqlDump += Object.entries(row)
              .map(([key, value]) => `\`${key}\`=${mysql.escape(value)}`)
              .join(', ');
            sqlDump += ';\n';
          });
        }

        sqlDump += '\n\n';
      }

      // Salva o dump em um arquivo SQL
      fs.writeFileSync(sqlFilePath, sqlDump);
      console.log(`Backup do banco de dados salvo em: ${sqlFilePath}`);

      // Fecha a conexão
      connection.end();

      // Realiza o backup da pasta de uploads
      await backupUploads(uploadsBackupPath);

      // Cria arquivos ZIP
      await createZipFile(sqlFilePath, uploadsBackupPath, zipFilePath);

      // Tente fazer upload para o Google Drive
      await uploadToGoogleDrive(zipFilePath);

      // Limpa a pasta de backup
      clearBackupDirectory('./backup');
    });
  } catch (error) {
    console.error('Erro durante o backup:', error);
  }
};

// Função para fazer o backup da pasta de uploads
const backupUploads = async (destinationPath) => {
  const uploadsPath = '/home/deploy/crm/backend/uploads';

  // Cria a pasta de destino se não existir
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }

  // Função auxiliar para copiar arquivos e diretórios recursivamente
  const copyRecursive = (src, dest) => {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      // Se for um diretório, cria o diretório de destino
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      // Lê o conteúdo do diretório e copia recursivamente
      fs.readdirSync(src).forEach((childItem) => {
        const childSrc = path.join(src, childItem);
        const childDest = path.join(dest, childItem);
        copyRecursive(childSrc, childDest);
      });
    } else {
      // Se for um arquivo, copia
      fs.copyFileSync(src, dest);
      console.log(`Arquivo ${src} copiado para ${dest}.`);
    }
  };

  // Copia todos os arquivos e diretórios da pasta de uploads para a pasta de backup
  copyRecursive(uploadsPath, destinationPath);
};

// Função para criar um arquivo ZIP
const createZipFile = (sqlFilePath, uploadsBackupPath, zipFilePath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip');

    output.on('close', () => {
      console.log(`Arquivo ZIP criado: ${zipFilePath}`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error('Erro ao criar o arquivo ZIP:', err);
      reject(err);
    });

    archive.pipe(output);

    // Adiciona o arquivo SQL ao ZIP
    archive.file(sqlFilePath, { name: 'gci.sql' });

    // Adiciona a pasta de uploads ao ZIP
    archive.directory(uploadsBackupPath, 'uploads');

    archive.finalize();
  });
};

// Função para fazer upload para o Google Drive
const uploadToGoogleDrive = async (filePath) => {
  // Carrega as credenciais do arquivo
  const { client_secret, client_id } = JSON.parse(fs.readFileSync('/home/deploy/crm/backend/dist/utils/credentials.json')).web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret
  );

  // Tente carregar o token do arquivo
  let token;
  try {
    token = fs.readFileSync('/home/deploy/crm/backend/dist/utils/token.json');
    oauth2Client.setCredentials(JSON.parse(token));
  } catch (error) {
    console.error('Erro ao carregar o token:', error);
    return;
  }

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // Cria um arquivo no Google Drive
  const fileMetadata = {
    name: 'backup.zip',
    parents: ['1PS2dJEOlwNebl6jViBa-UTEmEh1kccSk'], // ID da pasta
  };
  const media = {
    mimeType: 'application/zip',
    body: fs.createReadStream(filePath),
  };

  try {
    // Verifica se o arquivo já existe e o substitui
    const response = await drive.files.list({
      q: "name='backup.zip' and '1PS2dJEOlwNebl6jViBa-UTEmEh1kccSk' in parents",
      fields: 'files(id)',
    });

    if (response.data.files.length > 0) {
      const fileId = response.data.files[0].id;
      await drive.files.delete({ fileId });
      console.log('Arquivo existente substituído.');
    }

    const uploadResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    console.log('Arquivo carregado com sucesso. ID do arquivo:', uploadResponse.data.id);
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo para o Google Drive:', error);
  }
};

// Função para limpar a pasta de backup
const clearBackupDirectory = (backupPath) => {
  fs.readdir(backupPath, (err, files) => {
    if (err) {
      console.error('Erro ao ler a pasta de backup:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(backupPath, file);
      fs.unlink(filePath, err => {
        if (err) {
          console.error(`Erro ao deletar o arquivo ${filePath}:`, err);
        } else {
          console.log(`Arquivo ${filePath} deletado com sucesso.`);
        }
      });
    });
  });
};

// Exporta a função para ser utilizada em outro arquivo
module.exports = performBackup;
