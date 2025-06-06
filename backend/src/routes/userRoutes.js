const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Middleware de autenticação
const { User } = require('../models'); // Use apenas User

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email; // Obtém o email do usuário do token

        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let type = 'User';
        if (user.is_corretor) type = 'Corretor';
        else if (user.is_administrador) type = 'Administrador';
        else if (user.is_correspondente) type = 'Correspondente';

        res.json({ ...user.toJSON(), type });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
