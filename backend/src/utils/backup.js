const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const backupDatabase = async () => {
  const dbName = process.env.DB_NAME || 'crm';
  const dbUser = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '99480231a';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const backupDir = path.resolve(__dirname, '../../backups');
  const backupFile = `backup_${dbName}_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, backupFile);
  const command = `PGPASSWORD="${dbPassword}" pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} ${dbName} > ${backupPath}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Erro ao criar backup:', error);
        reject(error);
      } else {
        console.log(`Backup criado com sucesso: ${backupPath}`);
        resolve(backupPath);
      }
    });
  });
};

module.exports = { backupDatabase };