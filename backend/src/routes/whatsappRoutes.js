const express = require('express');
const { Client } = require('whatsapp-web.js');
const WebSocket = require('ws');
const qrImage = require('qr-image');
const { WhatsApp, Corretor, Cliente, Nota, Correspondente } = require('../models');

/**
 * WhatsApp API Module
 * Handles WhatsApp Web client integration, authentication, and messaging
 */

// Global variables for tracking client state
let client = null; // WhatsApp client instance
let qrCodeData = null; // Current QR code for authentication
let isRestarting = false; // Flag to prevent multiple restart attempts
let isAuthenticated = false; // Flag to track authentication status

// WebSocket server for real-time communication
const wss = new WebSocket.Server({ noServer: true });

/**
 * Database Functions
 */

// Initialize the database with default records if needed
async function initializeWhatsAppRecords() {
  try {
    const existingRecords = await WhatsApp.findAll();
    if (existingRecords.length === 0) {
      await WhatsApp.create({
        message: 'Mensagem padrão',
        sender: 'Seu Nome',
        receiver: 'Número do Destinatário',
        authenticated: false,
      });
      console.log('Registro padrão do WhatsApp criado com sucesso.');
    }
    return true;
  } catch (error) {
    console.error('Erro ao inicializar registros do WhatsApp:', error);
    return false;
  }
}

// Get the primary WhatsApp configuration record
async function getWhatsAppRecord() {
  try {
    const records = await WhatsApp.findAll();
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('Erro ao buscar registro do WhatsApp:', error);
    return null;
  }
}

// Update the authentication status in the database
async function updateAuthenticationStatus(status) {
  try {
    const record = await getWhatsAppRecord();
    if (record) {
      await WhatsApp.update(
        { authenticated: status },
        { where: { id: record.id } }
      );
      console.log(`Status de autenticação atualizado para: ${status}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao atualizar status de autenticação:', error);
    return false;
  }
}

/**
 * WhatsApp Client Functions
 */

// Initialize the WhatsApp client with proper configuration
async function initializeWhatsAppClient() {
  if (client) {
    console.log('Cliente já inicializado, destruindo instância anterior...');
    await client.destroy().catch(err => console.error('Erro ao destruir cliente:', err));
    client = null;
  }

  try {
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
        defaultViewport: { width: 1280, height: 800 },
      },
      authTimeoutMs: 60000, // 60 seconds timeout for authentication
      qrMaxRetries: 5,      // Max retries for QR code generation
      restartOnAuthFail: true,
    });

    // Set up event listeners
    setupWhatsAppEventListeners();

    // Initialize the client
    await client.initialize().catch(error => {
      console.error('Erro ao inicializar cliente WhatsApp:', error);
      throw error;
    });

    console.log('Cliente WhatsApp inicializado com sucesso.');
    return true;
  } catch (error) {
    console.error('Falha ao inicializar cliente WhatsApp:', error);
    return false;
  }
}

// Setup event listeners for the WhatsApp client
function setupWhatsAppEventListeners() {
  // QR Code generation event
  client.on('qr', async (qr) => {
    try {
      const record = await getWhatsAppRecord();
      if (record && record.authenticated && isAuthenticated) {
        console.log('Cliente já autenticado, QR Code ignorado.');
      } else {
        console.log('Novo QR Code gerado.');
        qrCodeData = qr;
        broadcast({ type: 'qrCode', data: qr });
      }
    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
    }
  });

  // Client ready event
  client.on('ready', async () => {
    console.log('Cliente WhatsApp está pronto e conectado!');
    isAuthenticated = true;
    await updateAuthenticationStatus(true);
    broadcast({ type: 'status', status: 'ready' });
  });
  
  // Authentication event
  client.on('authenticated', async () => {
    console.log('Cliente WhatsApp autenticado com sucesso!');
    isAuthenticated = true;
    await updateAuthenticationStatus(true);
    broadcast({ type: 'status', status: 'authenticated' });
  });

  // Authentication failure event
  client.on('auth_failure', async (error) => {
    console.error('Falha na autenticação do WhatsApp:', error);
    isAuthenticated = false;
    await updateAuthenticationStatus(false);
    broadcast({ type: 'status', status: 'auth_failure', error: error.message });
  });

  // Disconnection event
  client.on('disconnected', async (reason) => {
    console.log('Cliente WhatsApp desconectado:', reason);
    isAuthenticated = false;
    await updateAuthenticationStatus(false);
    broadcast({ type: 'status', status: 'disconnected', reason });
    
    // Schedule restart after disconnection
    setTimeout(() => restartWhatsAppClient(), 5000);
  });

  // Message received event - for future use
  client.on('message', async (message) => {
    console.log('Nova mensagem recebida:', message.body);
    // Process incoming messages if needed
  });
}

/**
 * Utility Functions
 */

// Broadcast a message to all connected WebSocket clients
function broadcast(data) {
  if (!wss || !wss.clients) return;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        console.error('Erro ao enviar mensagem via WebSocket:', error);
      }
    }
  });
}

// Restart the WhatsApp client safely
async function restartWhatsAppClient() {
  if (isRestarting) {
    console.log('Reinicialização já em andamento, ignorando solicitação.');
    return false;
  }
  
  isRestarting = true;
  console.log('Reiniciando cliente WhatsApp...');
  
  try {
    if (client) {
      await client.destroy().catch(err => console.error('Erro ao destruir cliente durante reinicialização:', err));
      client = null;
    }
    
    qrCodeData = null;
    isAuthenticated = false;
    
    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reinitialize the client
    const success = await initializeWhatsAppClient();
    console.log(success ? 'Cliente reiniciado com sucesso.' : 'Falha ao reiniciar cliente.');
    
    return success;
  } catch (error) {
    console.error('Erro crítico durante reinicialização do cliente:', error);
    return false;
  } finally {
    isRestarting = false;
  }
}

// Send a WhatsApp message with error handling
async function sendWhatsAppMessage(phoneNumber, message) {
  if (!client || !isAuthenticated) {
    throw new Error('Cliente WhatsApp não inicializado ou não autenticado.');
  }
  
  try {
    // Format the phone number correctly
    const formattedNumber = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    const chatId = `${formattedNumber}@c.us`;
    
    // Send the message and await confirmation
    const result = await client.sendMessage(chatId, message);
    console.log(`Mensagem enviada com sucesso para ${chatId}`);
    return result;
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${phoneNumber}:`, error);
    throw error;
  }
}

// Initialize the WhatsApp client on module load
initializeWhatsAppClient().then(success => {
  console.log(success ? 'Módulo WhatsApp iniciado com sucesso.' : 'Falha ao iniciar módulo WhatsApp.');
});

/**
 * Express Router Configuration
 */
const router = express.Router();

// GET: QR Code image for authentication
router.get('/qr-code', (req, res) => {
  if (!qrCodeData) {
    return res.status(404).json({ 
      success: false, 
      message: 'QR Code não disponível. Tente reiniciar o cliente.' 
    });
  }
  
  try {
    const qrImageBuffer = qrImage.image(qrCodeData, { type: 'png', size: 8 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    qrImageBuffer.pipe(res);
  } catch (error) {
    console.error('Erro ao gerar imagem do QR Code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao gerar imagem do QR Code.' 
    });
  }
});

// POST: Disconnect and reset the WhatsApp session
router.post('/disconnect', async (req, res) => {
  try {
    if (client) {
      await client.destroy();
      console.log('Cliente desconectado manualmente.');
      
      isAuthenticated = false;
      await updateAuthenticationStatus(false);
      
      // Schedule client restart
      setTimeout(() => restartWhatsAppClient(), 2000);
      
      return res.json({ 
        success: true, 
        message: 'Desconectado com sucesso. Um novo QR Code será gerado em breve.' 
      });
    }
    
    return res.status(400).json({ 
      success: false, 
      message: 'Cliente não está conectado.' 
    });
  } catch (error) {
    console.error('Erro ao desconectar cliente:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao desconectar cliente.',
      error: error.message 
    });
  }
});

// POST: Force restart the WhatsApp client
router.post('/restart', async (req, res) => {
  try {
    const success = await restartWhatsAppClient();
    
    if (success) {
      return res.json({ 
        success: true, 
        message: 'Cliente reiniciado com sucesso. Um novo QR Code será gerado em breve.' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Falha ao reiniciar cliente.' 
      });
    }
  } catch (error) {
    console.error('Erro ao reiniciar cliente:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao reiniciar cliente.',
      error: error.message 
    });
  }
});

// GET: Check authentication status
router.get('/status', async (req, res) => {
  try {
    const record = await getWhatsAppRecord();
    
    // Return both the current runtime status and the database status
    return res.json({ 
      success: true,
      runtimeAuthenticated: isAuthenticated,
      dbAuthenticated: record ? record.authenticated : false,
      clientInitialized: client !== null
    });
  } catch (error) {
    console.error('Erro ao verificar status de autenticação:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar status de autenticação.',
      error: error.message 
    });
  }
});

// GET: Get corretor details for a specific client
router.get('/clientes/:id/corretor', async (req, res) => {
  try {
    const clienteId = req.params.id;
    const cliente = await Cliente.findByPk(clienteId);

    if (!cliente) {
      return res.status(404).json({ 
        success: false, 
        message: "Cliente não encontrado." 
      });
    }

    const corretorId = cliente.corretorId;
    if (!corretorId) {
      return res.status(404).json({ 
        success: false, 
        message: "Cliente não possui corretor associado." 
      });
    }

    const corretor = await Corretor.findByPk(corretorId);
    if (!corretor) {
      return res.status(404).json({ 
        success: false, 
        message: "Corretor não encontrado." 
      });
    }

    return res.json({ 
      success: true, 
      data: corretor 
    });
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro ao buscar corretor.",
      error: error.message 
    });
  }
});

// POST: Send notification to a corretor
router.post('/notificar', async (req, res) => {
  const { corretorId, status, nota } = req.body;

  // Validate input
  if (!corretorId) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID do corretor é obrigatório.' 
    });
  }

  if (!status && !nota) {
    return res.status(400).json({ 
      success: false, 
      message: 'Status ou nota deve ser fornecido.' 
    });
  }

  try {
    // Find the corretor
    const corretor = await Corretor.findByPk(corretorId);
    if (!corretor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Corretor não encontrado.' 
      });
    }

    // Check if phone number exists
    if (!corretor.telefone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Corretor não possui telefone cadastrado.' 
      });
    }

    // Create message content
    let message;
    if (nota) {
      message = `Nova nota adicionada: ${nota}`;
    } else {
      message = `Status atualizado para: ${status}`;
    }

    // Send the WhatsApp message
    await sendWhatsAppMessage(corretor.telefone, message);

    return res.json({ 
      success: true, 
      message: 'Notificação enviada com sucesso.' 
    });
  } catch (error) {
    console.error('Erro ao notificar corretor:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao notificar corretor.',
      error: error.message 
    });
  }
});

// POST: Notify all correspondentes about a nota
router.post('/notificartodos', async (req, res) => {
  const { notaId } = req.body;

  // Validate input
  if (!notaId) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID da nota é obrigatório.' 
    });
  }

  try {
    // Find the nota with its relationships
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
      return res.status(404).json({ 
        success: false, 
        message: 'Nota não encontrada.' 
      });
    }

    // Check if cliente exists
    if (!nota.cliente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente não encontrado para esta nota.' 
      });
    }

    // Check if corretor exists
    const corretor = nota.cliente.corretor;
    if (!corretor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Corretor não encontrado para este cliente.' 
      });
    }

    // Create notification message
    const mensagem = `O corretor ${corretor.first_name} ${corretor.last_name} informou que a nota do cliente ${nota.destinatario} foi concluída.`;

    // Find all correspondentes
    const correspondentes = await Correspondente.findAll();
    if (correspondentes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nenhum correspondente encontrado para notificar.' 
      });
    }

    // Send notifications to all correspondentes
    const sentResults = [];
    for (const correspondente of correspondentes) {
      if (!correspondente.phone) {
        console.warn(`Correspondente ID ${correspondente.id} não possui telefone cadastrado.`);
        continue;
      }
      
      try {
        await sendWhatsAppMessage(correspondente.phone, mensagem);
        sentResults.push({
          id: correspondente.id,
          status: 'success'
        });
      } catch (error) {
        console.error(`Erro ao enviar para correspondente ID ${correspondente.id}:`, error);
        sentResults.push({
          id: correspondente.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return res.json({ 
      success: true, 
      message: 'Notificações processadas.',
      results: sentResults
    });
  } catch (error) {
    console.error('Erro ao notificar correspondentes:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao notificar correspondentes.',
      error: error.message 
    });
  }
});

// POST: Notify correspondentes about new client
router.post('/notificarCorrespondentes', async (req, res) => {
  const { clienteNome } = req.body;

  // Validate input
  if (!clienteNome) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nome do cliente é obrigatório.' 
    });
  }

  try {
    // Find all correspondentes
    const correspondentes = await Correspondente.findAll();
    if (correspondentes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nenhum correspondente encontrado para notificar.' 
      });
    }

    // Create notification message
    const mensagem = `Novo cliente cadastrado: ${clienteNome}.`;

    // Send notifications to all correspondentes
    const sentResults = [];
    for (const correspondente of correspondentes) {
      if (!correspondente.phone) {
        console.warn(`Correspondente ID ${correspondente.id} não possui telefone cadastrado.`);
        continue;
      }
      
      try {
        await sendWhatsAppMessage(correspondente.phone, mensagem);
        sentResults.push({
          id: correspondente.id,
          status: 'success'
        });
      } catch (error) {
        console.error(`Erro ao enviar para correspondente ID ${correspondente.id}:`, error);
        sentResults.push({
          id: correspondente.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return res.json({ 
      success: true, 
      message: 'Notificações de novo cliente processadas.',
      results: sentResults
    });
  } catch (error) {
    console.error('Erro ao notificar correspondentes sobre novo cliente:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao notificar correspondentes sobre novo cliente.',
      error: error.message 
    });
  }
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Nova conexão WebSocket estabelecida.');
  
  // Send initial status to the new connection
  ws.send(JSON.stringify({ 
    type: 'status', 
    status: isAuthenticated ? 'authenticated' : 'disconnected',
    qrAvailable: qrCodeData !== null
  }));
  
  // Handle WebSocket messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Mensagem WebSocket recebida:', message);
      
      // Process WebSocket commands here if needed
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  });
  
  // Handle WebSocket disconnection
  ws.on('close', () => {
    console.log('Conexão WebSocket encerrada.');
  });
});

// Export the router and the WebSocket server
module.exports = { router, wss };