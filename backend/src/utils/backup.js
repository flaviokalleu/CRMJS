const fs = require('fs');
const mysql = require('mysql');
const { google } = require('googleapis');
const { ZipFile } = require('yazl');
require('dotenv').config();
const path = require('path');

const performBackup = async () => {
  try {
    const backupDir = './backup';
    const backupFileName = 'backup.zip';
    const backupFilePath = `${backupDir}/${backupFileName}`;
    const sqlFilePath = `${backupDir}/gci.sql`;
    const uploadsDir = path.join(__dirname, '../../uploads'); // Diretório uploads

    // Cria a pasta de backup se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Configurações do banco de dados
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Conecta ao banco de dados
    connection.connect((err) => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
      }
      console.log('Conectado ao banco de dados.');
    });

    // Consulta para pegar todas as tabelas
    connection.query('SHOW TABLES', (err, tables) => {
      if (err) {
        console.error('Erro ao obter tabelas:', err);
        connection.end();
        return;
      }

      const backupData = [];
      let queryCount = tables.length; // Inicializa o contador com o número de tabelas

      // Para cada tabela, faz o SELECT e salva no arquivo SQL
      tables.forEach((table) => {
        const tableName = table[`Tables_in_${process.env.DB_NAME}`];

        connection.query(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) {
            console.error(`Erro ao consultar a tabela ${tableName}:`, err);
            // Decrementa o contador mesmo em caso de erro para evitar deadlock
            queryCount--;
            checkIfComplete();
            return;
          }

          // Formata os dados para SQL
          const insertStatements = rows.map(row => {
            const values = Object.values(row).map(value => `'${value}'`).join(', ');
            return `INSERT INTO ${tableName} VALUES (${values});`;
          }).join('\n');

          backupData.push(insertStatements);

          // Decrementa o contador de consultas
          queryCount--;
          checkIfComplete();
        });
      });

      // Se não houver tabelas, encerra a conexão
      if (tables.length === 0) {
        console.log('Nenhuma tabela encontrada.');
        connection.end();
      }

      // Função para verificar se todas as consultas foram processadas
      const checkIfComplete = () => {
        if (queryCount === 0) {
          fs.writeFileSync(sqlFilePath, backupData.join('\n'));
          console.log('Backup do banco de dados realizado com sucesso.');

          // Cria um arquivo zip
          console.log("Criando arquivo zip...");
          const zipfile = new ZipFile();
          zipfile.addFile(sqlFilePath, 'gci.sql');

          // Adiciona a pasta uploads ao arquivo zip
          addUploadsToZip(zipfile, uploadsDir);

          zipfile.end();

          // Salva o zip
          const writeStream = fs.createWriteStream(backupFilePath);
          zipfile.outputStream.pipe(writeStream);

          // Após o arquivo zip ser criado, faça o upload
          writeStream.on('close', async () => {
            console.log("Arquivo zip criado com sucesso.");
            // 2. Fazer upload para o Google Drive
            console.log('Fazendo upload do backup para o Google Drive...');
            const auth = new google.auth.GoogleAuth({
              keyFile: './src/utils/credentials.json',
              scopes: ['https://www.googleapis.com/auth/drive.file'],
            });

            const drive = google.drive({ version: 'v3', auth });

            // Cria a pasta "backup" no Google Drive
            const folderName = 'backup';
            const folderId = await createFolderIfNotExists(drive, folderName);

            const fileMetadata = {
              name: backupFileName,
              mimeType: 'application/zip',
              parents: [folderId], // Define a pasta pai
            };
            const media = {
              mimeType: 'application/zip',
              body: fs.createReadStream(backupFilePath),
            };

            try {
              const response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
              });
              console.log(`Backup enviado para o Google Drive na pasta "${folderName}" com ID: ${response.data.id}`);

              // Compartilha o arquivo com o seu email pessoal
              await shareFileWithEmail(drive, response.data.id, 'kalleu.dc@gmail.com'); // Substitua pelo seu email

            } catch (error) {
              console.error('Erro ao enviar para o Google Drive:', error);
            }

            // Encerra a conexão após o upload
            connection.end();
          });
        }
      }
    });
  } catch (error) {
    console.error('Erro durante o backup:', error);
  }
};

// Função para adicionar a pasta uploads ao arquivo zip
const addUploadsToZip = (zipfile, uploadsDir) => {
  if (fs.existsSync(uploadsDir)) {
    fs.readdirSync(uploadsDir).forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        zipfile.addFile(filePath, `uploads/${file}`); // Adiciona o arquivo ao zip com o caminho "uploads/"
      } else if (stat.isDirectory()) {
        addUploadsToZip(zipfile, filePath); // Recursivamente adiciona diretórios
      }
    });
  } else {
    console.error('A pasta uploads não existe.');
  }
};

// Função para criar a pasta no Google Drive se não existir
const createFolderIfNotExists = async (drive, folderName) => {
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: 'files(id, name)',
  });

  const folder = res.data.files.find(file => file.name === folderName);
  if (folder) {
    console.log(`Pasta "${folderName}" já existe com ID: ${folder.id}`);
    return folder.id; // Retorna o ID da pasta existente
  } else {
    // Cria a nova pasta
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    const folderResponse = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });
    console.log(`Pasta "${folderName}" criada com ID: ${folderResponse.data.id}`);
    return folderResponse.data.id; // Retorna o ID da nova pasta
  }
};

// Função para compartilhar o arquivo com um email
const shareFileWithEmail = async (drive, fileId, emailAddress) => {
  const permission = {
    type: 'user',
    role: 'reader',
    emailAddress: emailAddress,
  };

  try {
    await drive.permissions.create({
      resource: permission,
      fileId: fileId,
      fields: 'id',
    });
    console.log(`Arquivo compartilhado com o email: ${emailAddress}`);
  } catch (error) {
    console.error('Erro ao compartilhar arquivo:', error);
  }
};

module.exports = performBackup; // Exporta a função performBackup
