const express = require('express');
const { Client } = require('whatsapp-web.js');
const WebSocket = require('ws');
const qrImage = require('qr-image');
const { WhatsApp, Corretor, Cliente, Nota, Correspondente } = require('../models');


let client; // Variável para armazenar a instância do cliente
let qrCodeData; // Variável para armazenar o QR Code
let isRestarting = false; // Variável para evitar múltiplas reinicializações
let isAuthenticated = false; // Flag para rastrear autenticação

// Criação do servidor WebSocket
const wss = new WebSocket.Server({ noServer: true });

// Função para inicializar registros no banco de dados
const initializeWhatsAppRecords = async () => {
  const existingRecords = await WhatsApp.findAll();
  if (existingRecords.length === 0) {
    await WhatsApp.create({
      message: 'Mensagem padrão',
      sender: 'Seu Nome',
      receiver: 'Número do Destinatário',
      authenticated: false,
    });
    console.log('Registro padrão criado.');
  }
};

// Função para obter o registro do WhatsApp
const getWhatsAppRecord = async () => {
  const records = await WhatsApp.findAll();
  return records.length > 0 ? records[0] : null; // Retorna o primeiro registro ou null se não houver registros
};

// Função para inicializar o cliente WhatsApp
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
        qrCodeData = qr; // Armazena o QR Code gerado
        broadcast({ qrCode: qr });
      }
    } catch (error) {
      console.error('Erro ao verificar a autenticação antes de gerar o QR Code:', error);
    }
  });

  client.on('ready', () => {
    console.log('Cliente está pronto!');
    isAuthenticated = true; // Marque como autenticado
    broadcast({ status: 'ready' });
  });
  
  client.on('authenticated', async () => {
    console.log('Cliente autenticado!');
    isAuthenticated = true; // Atualiza o status de autenticação
    try {
      const record = await getWhatsAppRecord();
      if (record) {
        await WhatsApp.update(
          { authenticated: true },
          { where: { id: record.id } }
        );
      }
      broadcast({ status: 'authenticated' });
    } catch (error) {
      console.error('Erro ao atualizar o status de autenticação:', error);
    }
  });

  client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
    isAuthenticated = false; // Reseta o status de autenticação
    broadcast({ status: 'disconnected' });
    restartWhatsAppClient(); // Chama a função de reinicialização
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

// Função para reinicializar o cliente WhatsApp
const restartWhatsAppClient = async () => {
  if (isRestarting) return; // Se já está reiniciando, não faça nada
  isRestarting = true; // Indica que a reinicialização está em andamento

  try {
    if (client) {
      console.log('Reiniciando a instância atual do cliente...');
      await client.destroy();
      client = null; // Limpa a referência para garantir nova inicialização
    }

    const record = await getWhatsAppRecord();
    if (record && !record.authenticated) {
      await initializeWhatsAppClient(); // Reinicializa a conexão apenas se não estiver autenticado
    } else {
      console.log('Cliente já autenticado, reinicialização não necessária.');
    }
  } catch (error) {
    console.error('Erro ao reiniciar o cliente:', error);
  } finally {
    isRestarting = false; // Reinicialização concluída
  }
};

// Inicializa o cliente do WhatsApp
initializeWhatsAppClient();

// Criação das rotas
const router = express.Router();

// Rota para obter o QR Code como imagem PNG
router.get('/qr-code', (req, res) => {
  if (qrCodeData) {
    const qrImageBuffer = qrImage.image(qrCodeData, { type: 'png' }); // Gera a imagem do QR Code
    res.setHeader('Content-Type', 'image/png'); // Define o tipo de conteúdo como imagem PNG
    qrImageBuffer.pipe(res); // Envia a imagem como resposta
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

      const record = await getWhatsAppRecord();
      if (record) {
        await WhatsApp.update(
          { authenticated: false },
          { where: { id: record.id } } // Atualiza o registro encontrado
        );
      }
      restartWhatsAppClient(); // Reinicializa o cliente para gerar um novo QR Code
    }
    res.json({ message: 'Desconectado e reiniciado com sucesso.' });
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

// Rota para buscar corretor de um cliente
router.get('/clientes/:id/corretor', async (req, res) => {
  try {
    const clienteId = req.params.id;
    const cliente = await Cliente.findByPk(clienteId); // Ou sua lógica de busca

    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    const corretorId = cliente.corretorId; // Supondo que o campo seja 'corretorId'
    const corretor = await Corretor.findByPk(corretorId);

    if (!corretor) {
      return res.status(404).json({ message: "Corretor não encontrado." });
    }

    res.json(corretor);
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    res.status(500).json({ message: "Erro ao buscar corretor." });
  }
});

// Rota para notificar o corretor
router.post('/notificar', async (req, res) => {
  const { corretorId, status, nota } = req.body;

  try {
    // Busca o corretor pelo ID
    const corretor = await Corretor.findByPk(corretorId);

    if (!corretor) {
      return res.status(404).json({ message: 'Corretor não encontrado.' });
    }

    // Mensagem a ser enviada
    let message;
    if (nota) {
      message = `Nova nota adicionada para o cliente: ${nota}`;
    } else if (status) {
      message = `O status do cliente foi atualizado para: ${status}`;
    } else {
      return res.status(400).json({ message: 'Nem nota nem status foram fornecidos.' });
    }

    // Verifica se o cliente foi inicializado e está autenticado
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


router.post('/notificartodos', async (req, res) => {
  const { notaId } = req.body;

  try {
    // Busca a nota pelo ID
    const nota = await Nota.findByPk(notaId, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [
            {
              model: Corretor,
              as: 'corretor'
            }
          ]
        }
      ]
    });

    if (!nota) {
      return res.status(404).json({ message: 'Nota não encontrada.' });
    }

    // Acesse o corretor através do cliente da nota
    const corretor = nota.cliente.corretor;

    if (!corretor) {
      return res.status(404).json({ message: 'Corretor não encontrado.' });
    }

    // Cria a mensagem para ser enviada
    const mensagem = `O corretor ${corretor.first_name} ${corretor.last_name} informou que a nota do cliente ${nota.destinatario} foi concluída.`;

    // Busca todos os correspondentes
    const correspondentes = await Correspondente.findAll();

    // Envia a notificação para todos os correspondentes
    for (const correspondente of correspondentes) {
      if (client && isAuthenticated) {
        await client.sendMessage(`55${correspondente.phone}@c.us`, mensagem);
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
  const { clienteNome } = req.body; // Recebe o nome do cliente do corpo da requisição

  try {
    // Mensagem a ser enviada
    const mensagem = `Novo cliente cadastrado: ${clienteNome}.`;

    // Busca todos os correspondentes
    const correspondentes = await Correspondente.findAll();

    // Envia a notificação para todos os correspondentes
    for (const correspondente of correspondentes) {
      if (client && isAuthenticated) {
        await client.sendMessage(`55${correspondente.phone}@c.us`, mensagem);
      }
    }

    res.json({ message: 'Notificações enviadas com sucesso para os correspondentes.' });
  } catch (error) {
    console.error('Erro ao notificar correspondentes:', error);
    res.status(500).json({ message: 'Erro ao notificar correspondentes.' });
  }
});

module.exports = router;
