const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { User } = require('../models');

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;

        const user = await User.findOne({ 
            where: { email: userEmail },
            attributes: { exclude: ['password'] } // Excluir senha
        });
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Determinar o tipo de usuário
        let type = 'User';
        let role = null;
        
        if (user.is_administrador) {
            type = 'Administrador';
            role = 'administrador';
        } else if (user.is_corretor) {
            type = 'Corretor';
            role = 'corretor';
        } else if (user.is_correspondente) {
            type = 'Correspondente';
            role = 'correspondente';
        }

        res.json({ 
            user: user.toJSON(), 
            type,
            role
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
