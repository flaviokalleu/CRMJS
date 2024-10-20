const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Middleware de autenticação
const { Corretor, Administrador, Correspondente } = require('../models'); // Modelos

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email; // Obtém o email do usuário do token

        // Verifica se o usuário é um Corretor
        let user = await Corretor.findOne({ where: { email: userEmail } });
        if (user) return res.json({ ...user.toJSON(), type: 'Corretor' });

        // Verifica se o usuário é um Administrador
        user = await Administrador.findOne({ where: { email: userEmail } });
        if (user) return res.json({ ...user.toJSON(), type: 'Administrador' });

        // Verifica se o usuário é um Correspondente
        user = await Correspondente.findOne({ where: { email: userEmail } });
        if (user) return res.json({ ...user.toJSON(), type: 'Correspondente' });

        res.status(404).json({ error: 'User not found' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
