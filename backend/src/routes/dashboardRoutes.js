const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { Corretor, Cliente, Correspondente } = require('../models');
const Sequelize = require('sequelize');
const { Op, fn, col } = Sequelize;
const literal = Sequelize.literal;

// Middleware de autenticação
router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const userRole = req.user.role; // Assumindo que a role do usuário está disponível em req.user
        const corretor = await Corretor.findOne({ where: { email: req.user.email } });

        // Condição para filtrar dados com base na role
        let whereCondition = {};
        if (userRole === 'corretor' && corretor) {
            whereCondition = { corretorId: corretor.id };
        } else if (userRole === 'Administrador' || userRole === 'Correspondente') {
            whereCondition = {}; // Acesso total para administradores e correspondentes
        }

        // Contar o número total de corretores
        const totalCorretores = userRole === 'corretor' ? 1 : await Corretor.count();

        // Contar o número total de clientes
        const totalClientes = await Cliente.count({ where: whereCondition });

        // Contar o número total de correspondentes
        const totalCorrespondentes = await Correspondente.count();

        // Contar o número de clientes cadastrados este mês
        const clientesEsteMes = await Cliente.count({
            where: {
                ...whereCondition,
                created_at: {
                    [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        });

        // Obter os 5 corretores com o maior número de clientes
        const top5Corretores = (userRole === 'corretor')
            ? []
            : await Cliente.findAll({
                attributes: [
                    'corretorId',
                    [fn('COUNT', col('corretorId')), 'clients']
                ],
                include: [
                    {
                        model: Corretor,
                        attributes: ['id', 'first_name', 'last_name', 'photo'],
                        as: 'corretor'
                    }
                ],
                group: ['corretorId', 'corretor.id', 'corretor.first_name', 'corretor.last_name', 'corretor.photo'],
                order: [[fn('COUNT', col('corretorId')), 'DESC']],
                limit: 5
            });

        // Ajustar corretores que possam ter 'null' como valor em 'photo'
        const top5CorretoresAdjusted = top5Corretores.map(corretorData => {
            const corretor = corretorData.corretor || {};
            return {
                ...corretorData.toJSON(),
                corretor: {
                    ...corretor,
                    photo: corretor.photo || '/path/to/default/photo.jpg', // Foto padrão
                }
            };
        });

        // Responder com os dados do dashboard
        res.json({
            totalCorretores,
            totalClientes,
            totalCorrespondentes,
            clientesEsteMes,
            top5Corretores: top5CorretoresAdjusted
        });
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard', error);
        res.status(500).json({ message: 'Erro ao buscar dados do dashboard', error });
    }
});

// Rota para obter clientes aguardando aprovação
router.get('/clientes', async (req, res) => {
    try {
        const status = req.query.status; // Obter o status da query
        const whereCondition = {};

        if (status) {
            whereCondition.status = status; // Filtrar pelo status se fornecido
        }

        const clientes = await Cliente.findAll({ where: whereCondition });
        const total = await Cliente.count({ where: whereCondition });

        res.json({ clientes, total });
    } catch (error) {
        console.error('Erro ao buscar clientes', error);
        res.status(500).json({ message: 'Erro ao buscar clientes', error });
    }
});

// Rota para obter dados mensais de clientes cadastrados
router.get('/monthly', async (req, res) => {
    try {
        const userRole = req.user.role;
        const corretor = await Corretor.findOne({ where: { email: req.user.email } });

        let whereCondition = {};
        if (userRole === 'corretor' && corretor) {
            whereCondition = { corretorId: corretor.id };
        }

        // Obter o número de clientes cadastrados por mês
        const monthlyClients = await Cliente.findAll({
            attributes: [
                [literal('EXTRACT(MONTH FROM "created_at")'), 'month'],
                [literal('EXTRACT(YEAR FROM "created_at")'), 'year'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                ...whereCondition,
                created_at: {
                    [Op.gte]: new Date(new Date().getFullYear(), 0, 1), // Início do ano atual
                },
            },
            group: [literal('EXTRACT(YEAR FROM "created_at")'), literal('EXTRACT(MONTH FROM "created_at")')],
            order: [
                [literal('EXTRACT(YEAR FROM "created_at")'), 'ASC'],
                [literal('EXTRACT(MONTH FROM "created_at")'), 'ASC']
            ]
        });

        // Inicializar array para os 12 meses do ano
        const monthlyData = Array(12).fill(0);
        monthlyClients.forEach(client => {
            const month = parseInt(client.get('month')) - 1; // Ajustar para índice do array (0-11)
            monthlyData[month] = parseInt(client.get('count')); // Garantir que count é um número
        });

        res.json({ monthlyData });
    } catch (error) {
        console.error('Erro ao buscar dados mensais de clientes cadastrados', error);
        res.status(500).json({ message: 'Erro ao buscar dados mensais de clientes cadastrados', error });
    }
});

// Rota para obter dados semanais de clientes cadastrados
router.get('/weekly', async (req, res) => {
    try {
        const userRole = req.user.role;
        const corretor = await Corretor.findOne({ where: { email: req.user.email } });

        let whereCondition = {};
        if (userRole === 'corretor' && corretor) {
            whereCondition = { corretorId: corretor.id };
        }

        // Obter o número de clientes cadastrados por dia da semana
        const weeklyClients = await Cliente.findAll({
            attributes: [
                [literal('EXTRACT(DOW FROM "created_at")'), 'dayOfWeek'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                ...whereCondition,
                created_at: {
                    [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
                },
            },
            group: [literal('EXTRACT(DOW FROM "created_at")')],
            order: [[literal('EXTRACT(DOW FROM "created_at")'), 'ASC']]
        });

        // Inicializar array para os 7 dias da semana (0 = Domingo, 6 = Sábado)
        const weeklyData = Array(7).fill(0);
        weeklyClients.forEach(client => {
            const day = parseInt(client.get('dayOfWeek')); // DOW retorna 0 (Domingo) a 6 (Sábado)
            weeklyData[day] = parseInt(client.get('count')); // Garantir que count é um número
        });

        res.json({ weeklyData });
    } catch (error) {
        console.error('Erro ao buscar dados semanais de clientes cadastrados', error);
        res.status(500).json({ message: 'Erro ao buscar dados semanais de clientes cadastrados', error });
    }
});

module.exports = router;