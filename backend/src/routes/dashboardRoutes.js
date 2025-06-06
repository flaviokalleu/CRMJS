const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { User, Cliente } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// Middleware de autenticação
router.use(authMiddleware);

// Dashboard principal
router.get('/', async (req, res) => {
    try {
        const userRole = req.user.role;
        const user = await User.findOne({ where: { email: req.user.email } });

        let whereCondition = {};
        if (userRole === 'corretor' && user && user.is_corretor) {
            whereCondition = { userId: user.id };
        }

        const totalCorretores = userRole === 'corretor'
            ? 1
            : await User.count({ where: { is_corretor: true } });

        const totalClientes = await Cliente.count({ where: whereCondition });
        const totalCorrespondentes = await User.count({ where: { is_correspondente: true } });

        const clientesEsteMes = await Cliente.count({
            where: {
                ...whereCondition,
                created_at: {
                    [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        });

        // Top 5 usuários por número de clientes
        const top5Usuarios = await Cliente.findAll({
            attributes: [
                'user_id',
                [fn('COUNT', col('user_id')), 'clientes']
            ],
            include: [{
                model: User,
                attributes: ['id', 'first_name', 'last_name', 'photo'],
                as: 'user'
                // Removido o filtro where: { is_corretor: true }
            }],
            group: [
                'user_id',
                'user.id', 'user.first_name', 'user.last_name', 'user.photo'
            ],
            order: [[fn('COUNT', col('user_id')), 'DESC']],
            limit: 5
        });

        const top5UsuariosAdjusted = top5Usuarios.map(usuarioData => {
            const user = usuarioData.user || {};
            return {
                ...usuarioData.toJSON(),
                user: {
                    ...user,
                    photo: user.photo || '/path/to/default/photo.jpg',
                }
            };
        });

        res.json({
            totalCorretores,
            totalClientes,
            totalCorrespondentes,
            clientesEsteMes,
            top5Usuarios: top5UsuariosAdjusted // <-- alterado aqui
        });
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard', error);
        res.status(500).json({ message: 'Erro ao buscar dados do dashboard', error });
    }
});

// Clientes aguardando aprovação
router.get('/clientes', async (req, res) => {
    try {
        const status = req.query.status;
        const whereCondition = {};
        if (status) whereCondition.status = status;

        const clientes = await Cliente.findAll({ where: whereCondition });
        const total = await Cliente.count({ where: whereCondition });

        res.json({ clientes, total });
    } catch (error) {
        console.error('Erro ao buscar clientes', error);
        res.status(500).json({ message: 'Erro ao buscar clientes', error });
    }
});

// Dados mensais de clientes cadastrados
router.get('/monthly', async (req, res) => {
    try {
        const userRole = req.user.role;
        const user = await User.findOne({ where: { email: req.user.email } });

        let whereCondition = {};
        if (userRole === 'corretor' && user && user.is_corretor) {
            whereCondition = { userId: user.id };
        }

        const monthlyclientes = await Cliente.findAll({
            attributes: [
                [literal('EXTRACT(MONTH FROM "created_at")'), 'month'],
                [literal('EXTRACT(YEAR FROM "created_at")'), 'year'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                ...whereCondition,
                created_at: {
                    [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
                },
            },
            group: [literal('EXTRACT(YEAR FROM "created_at")'), literal('EXTRACT(MONTH FROM "created_at")')],
            order: [
                [literal('EXTRACT(YEAR FROM "created_at")'), 'ASC'],
                [literal('EXTRACT(MONTH FROM "created_at")'), 'ASC']
            ]
        });

        const monthlyData = Array(12).fill(0);
        monthlyclientes.forEach(client => {
            const month = parseInt(client.get('month')) - 1;
            monthlyData[month] = parseInt(client.get('count'));
        });

        res.json({ monthlyData });
    } catch (error) {
        console.error('Erro ao buscar dados mensais de clientes cadastrados', error);
        res.status(500).json({ message: 'Erro ao buscar dados mensais de clientes cadastrados', error });
    }
});

// Dados semanais de clientes cadastrados
router.get('/weekly', async (req, res) => {
    try {
        const userRole = req.user.role;
        const user = await User.findOne({ where: { email: req.user.email } });

        let whereCondition = {};
        if (userRole === 'corretor' && user && user.is_corretor) {
            whereCondition = { userId: user.id };
        }

        const weeklyclientes = await Cliente.findAll({
            attributes: [
                [literal('EXTRACT(DOW FROM "created_at")'), 'dayOfWeek'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                ...whereCondition,
                created_at: {
                    [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            group: [literal('EXTRACT(DOW FROM "created_at")')],
            order: [[literal('EXTRACT(DOW FROM "created_at")'), 'ASC']]
        });

        const weeklyData = Array(7).fill(0);
        weeklyclientes.forEach(client => {
            const day = parseInt(client.get('dayOfWeek'));
            weeklyData[day] = parseInt(client.get('count'));
        });

        res.json({ weeklyData });
    } catch (error) {
        console.error('Erro ao buscar dados semanais de clientes cadastrados', error);
        res.status(500).json({ message: 'Erro ao buscar dados semanais de clientes cadastrados', error });
    }
});

module.exports = router;