const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../routes/authRoutes'); // Ajuste o caminho conforme necessário
const { checkKey } = require('../middleware/checkKeyMiddleware'); // Importa o middleware checkKey

// Rota protegida
router.get('/protected', authenticateToken, checkKey, (req, res) => {
  // Se ambas as validações passarem, esta mensagem será enviada
  res.json({ 
    message: 'Você está autenticado!', 
    keyExpiration: req.keyExpiration // Inclui a informação sobre o tempo restante da chave, se necessário
  });
});

module.exports = router;
