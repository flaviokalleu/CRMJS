const express = require('express');
const { Client } = require('whatsapp-web.js');
const WebSocket = require('ws');
const qrImage = require('qr-image');
const { WhatsApp, User, Cliente, Nota } = require('../models'); // Use User no lugar de Corretor/Correspondente

let client;
let qrCodeData;
let isRestarting = false;
let isAuthenticated = false;

// Criação do servidor WebSocket
const wss = new WebSocket.Server({ noServer: true });

// Função para inicializar registros no banco de dados
const initializeWhatsAppRecords = async () => {
  try {
    const existingRecord = await WhatsApp.findOne();
    if (!existingRecord && isAuthenticated) {
      await WhatsApp.create({
        message: 'Mensagem padrão',
        sender: 'Seu Nome',
        receiver: 'Número do Destinatário',
        authenticated: true,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Novo registro criado após autenticação.');
    }
    return existingRecord;
  } catch (error) {
    console.error('Erro ao inicializar registro do WhatsApp:', error);
    throw error;
  }
};

const getWhatsAppRecord = async () => {
  const records = await WhatsApp.findAll();
  return records.length > 0 ? records[0] : null;
};

const initializeWhatsAppClient = async () => {
  await initializeWhatsAppRecords();

  client = new Client({
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--window-size=1280,800',
        '--disable-infobars',
        '--disable-dev-shm-usage',
      ],
    },
  });

  client.on('qr', async (qr) => {
    try {
      const record = await getWhatsAppRecord();
      if (record && record.authenticated) {
        console.log('Cliente já está autenticado, QR Code não gerado.');
      } else {
        console.log('QR Code gerado');
        qrCodeData = qr;
        broadcast({ qrCode: qr });
      }
    } catch (error) {
      console.error('Erro ao verificar a autenticação antes de gerar o QR Code:', error);
    }
  });

  client.on('ready', () => {
    console.log('Cliente está pronto!');
    isAuthenticated = true;
    broadcast({ status: 'ready' });
  });

  client.on('authenticated', async () => {
    console.log('Cliente autenticado!');
    isAuthenticated = true;
    try {
      await initializeWhatsAppRecords();
      broadcast({ status: 'authenticated' });
    } catch (error) {
      console.error('Erro ao criar registro após autenticação:', error);
    }
  });

  client.on('disconnected', async (reason) => {
    console.log('Cliente desconectado:', reason);
    isAuthenticated = false;
    try {
      await WhatsApp.destroy({ where: {}, truncate: true });
      console.log('Registro deletado após desconexão.');
      broadcast({ status: 'disconnected' });
      restartWhatsAppClient();
    } catch (error) {
      console.error('Erro ao deletar registro após desconexão:', error);
    }
  });

  client.initialize();
};

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const restartWhatsAppClient = async () => {
  if (isRestarting) return;
  isRestarting = true;
  try {
    if (client) {
      console.log('Reiniciando a instância atual do cliente...');
      await client.destroy();
      client = null;
    }
    const record = await getWhatsAppRecord();
    if (record && !record.authenticated) {
      await initializeWhatsAppClient();
    } else {
      console.log('Cliente já autenticado, reinicialização não necessária.');
    }
  } catch (error) {
    console.error('Erro ao reiniciar o cliente:', error);
  } finally {
    isRestarting = false;
  }
};

initializeWhatsAppClient();

const router = express.Router();

// Rota para obter o QR Code como imagem PNG
router.get('/qr-code', (req, res) => {
  if (qrCodeData) {
    const qrImageBuffer = qrImage.image(qrCodeData, { type: 'png' });
    res.setHeader('Content-Type', 'image/png');
    qrImageBuffer.pipe(res);
  } else {
    res.status(404).json({ message: 'QR Code não disponível ainda.' });
  }
});

// Rota para desconectar e deletar a sessão
router.post('/disconnect', async (req, res) => {
  try {
    if (client) {
      await client.destroy();
      console.log('Cliente desconectado com sucesso.');
      await WhatsApp.destroy({ where: {}, truncate: true });
      console.log('Registro deletado após desconexão manual.');
      restartWhatsAppClient();
    }
    res.json({ message: 'Desconectado e registro deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({ message: 'Erro ao desconectar.' });
  }
});

// Rota para verificar o status de autenticação
router.get('/status', async (req, res) => {
  try {
    const record = await getWhatsAppRecord();
    if (record) {
      res.json({ authenticated: record.authenticated });
    } else {
      res.status(404).json({ message: 'Registro não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao verificar o status de autenticação:', error);
    res.status(500).json({ message: 'Erro ao verificar o status de autenticação.' });
  }
});

// Rota para buscar o corretor (User) de um cliente
router.get('/clientes/:id/corretor', async (req, res) => {
  try {
    const clienteId = req.params.id;
    const cliente = await Cliente.findByPk(clienteId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    const user = cliente.user;
    if (!user || !user.is_corretor) {
      return res.status(404).json({ message: "Corretor não encontrado." });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    res.status(500).json({ message: "Erro ao buscar corretor." });
  }
});

// Rota para notificar o corretor (User)
router.post('/notificar', async (req, res) => {
  const { userId, status, nota } = req.body;

  try {
    const corretor = await User.findByPk(userId);

    if (!corretor || !corretor.is_corretor) {
      return res.status(404).json({ message: 'Corretor não encontrado.' });
    }

    let message;
    if (nota) {
      message = `Nova nota adicionada para o cliente: ${nota}`;
    } else if (status) {
      message = `O status do cliente foi atualizado para: ${status}`;
    } else {
      return res.status(400).json({ message: 'Nem nota nem status foram fornecidos.' });
    }

    if (client && isAuthenticated) {
      await client.sendMessage(`55${corretor.telefone}@c.us`, message);
      return res.json({ message: 'Notificação enviada com sucesso.' });
    } else {
      return res.status(500).json({ message: 'Cliente WhatsApp não inicializado ou não está pronto.' });
    }
  } catch (error) {
    console.error('Erro ao notificar corretor:', error);
    res.status(500).json({ message: 'Erro ao notificar corretor.' });
  }
});

// Rota para notificar todos os correspondentes após uma nota
router.post('/notificartodos', async (req, res) => {
  const { notaId } = req.body;

  try {
    const nota = await Nota.findByPk(notaId, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ]
    });

    if (!nota) {
      return res.status(404).json({ message: 'Nota não encontrada.' });
    }

    const corretor = nota.cliente.user;
    if (!corretor || !corretor.is_corretor) {
      return res.status(404).json({ message: 'Corretor não encontrado.' });
    }

    const mensagem = `O corretor ${corretor.first_name} ${corretor.last_name} informou que a nota do cliente ${nota.destinatario} foi concluída.`;

    // Busca todos os correspondentes (User)
    const correspondentes = await User.findAll({ where: { is_correspondente: true } });

    for (const correspondente of correspondentes) {
      if (client && isAuthenticated) {
        await client.sendMessage(`55${correspondente.telefone}@c.us`, mensagem);
      }
    }

    res.json({ message: 'Notificações enviadas com sucesso.' });
  } catch (error) {
    console.error('Erro ao notificar todos os correspondentes:', error);
    res.status(500).json({ message: 'Erro ao notificar todos os correspondentes.' });
  }
});

// Rota para notificar todos os correspondentes após cadastrar um cliente
router.post('/notificarCorrespondentes', async (req, res) => {
  const { clienteNome } = req.body;

  try {
    const mensagem = `Novo cliente cadastrado: ${clienteNome}.`;

    const correspondentes = await User.findAll({ where: { is_correspondente: true } });

    for (const correspondente of correspondentes) {
      if (client && isAuthenticated) {
        await client.sendMessage(`55${correspondente.telefone}@c.us`, mensagem);
      }
    }

    res.json({ message: 'Notificações enviadas com sucesso para os correspondentes.' });
  } catch (error) {
    console.error('Erro ao notificar correspondentes:', error);
    res.status(500).json({ message: 'Erro ao notificar correspondentes.' });
  }
});

module.exports = router;
module.exports.client = client;
module.exports.isAuthenticated = isAuthenticated;
