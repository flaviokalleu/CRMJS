const express = require('express');
const router = express.Router();
const { Acesso, User } = require('../models');
const { Op } = require('sequelize');
const geoip = require('geoip-lite');
const requestIp = require('request-ip');

// Middleware para capturar IP
router.use(requestIp.mw());

// Função para obter dados geográficos
const obterDadosGeo = (ip) => {
    try {
        // Ignorar IPs locais
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return {
                city: 'Local',
                region: 'Local',
                country: 'BR',
                timezone: 'America/Sao_Paulo',
                ll: null,
            };
        }
        
        const geo = geoip.lookup(ip);
        return {
            city: geo?.city || null,
            region: geo?.region || null,
            country: geo?.country || null,
            timezone: geo?.timezone || null,
            ll: geo?.ll || null,
        };
    } catch (error) {
        console.error('Erro ao obter dados geográficos:', error);
        return {
            city: null,
            region: null,
            country: null,
            timezone: null,
            ll: null,
        };
    }
};

// Função para determinar o tipo de dispositivo
const obterTipoDispositivo = (userAgent) => {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        return 'Tablet';
    } else {
        return 'Desktop';
    }
};

// Rota para registrar um novo acesso
router.post('/', async (req, res) => {
    try {
        const ip = req.clientIp || req.ip || 'unknown';
        const { referer, role, userId, page } = req.body;
        const userAgent = req.headers['user-agent'] || '';
        
        // Obter dados geográficos
        const geoData = obterDadosGeo(ip);
        
        // Determinar tipo de dispositivo
        const deviceType = obterTipoDispositivo(userAgent);
        
        // Criar registro de acesso
        const novoAcesso = await Acesso.create({
            ip,
            referer: referer || null,
            userAgent,
            deviceType,
            page: page || null,
            geoCity: geoData.city,
            geoRegion: geoData.region,
            geoCountry: geoData.country,
            geoTimezone: geoData.timezone,
            geoCoordinates: geoData.ll ? JSON.stringify(geoData.ll) : null,
            timestamp: new Date(),
            user_id: userId || null,
        });

        res.status(201).json({ 
            message: 'Acesso registrado com sucesso.',
            id: novoAcesso.id,
            timestamp: novoAcesso.timestamp
        });
    } catch (error) {
        console.error("Erro ao registrar acesso:", error);
        res.status(500).json({ error: 'Erro ao registrar acesso.' });
    }
});

// Rota para listar todos os acessos (agora com nome do usuário se existir)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, country, startDate, endDate } = req.query;

        // Filtros
        let whereSql = 'WHERE 1=1';
        const replacements = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        };
        if (country) {
            whereSql += ' AND a.geo_country = :country';
            replacements.country = country;
        }
        if (startDate) {
            whereSql += ' AND a.timestamp >= :startDate';
            replacements.startDate = startDate;
        }
        if (endDate) {
            whereSql += ' AND a.timestamp <= :endDate';
            replacements.endDate = endDate;
        }

        // Query com LEFT JOIN para trazer nome do usuário se existir
        const acessos = await Acesso.sequelize.query(
            `
            SELECT 
                a.*,
                u.first_name as user_first_name,
                u.last_name as user_last_name
            FROM acessos a
            LEFT JOIN users u ON a.user_id = u.id
            ${whereSql}
            ORDER BY a.timestamp DESC
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements,
                type: Acesso.sequelize.QueryTypes.SELECT,
            }
        );

        // Contagem total para paginação
        const [{ total }] = await Acesso.sequelize.query(
            `
            SELECT COUNT(*) as total
            FROM acessos a
            LEFT JOIN users u ON a.user_id = u.id
            ${whereSql}
            `,
            {
                replacements,
                type: Acesso.sequelize.QueryTypes.SELECT,
            }
        );

        res.json({
            acessos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: parseInt(total),
                itemsPerPage: parseInt(limit),
            }
        });
    } catch (error) {
        console.error('Erro ao buscar acessos:', error);
        res.status(500).json({ error: 'Erro ao buscar acessos.' });
    }
});

// Rota para obter estatísticas de acessos (SIMPLIFICADA)
router.get('/stats', async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        // Calcular data de início baseada no período
        const now = new Date();
        const startDate = new Date();
        
        switch (period) {
            case '24h':
                startDate.setHours(now.getHours() - 24);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }
        
        const where = {
            timestamp: {
                [Op.gte]: startDate,
                [Op.lte]: now,
            }
        };
        
        // Estatísticas gerais
        const totalAcessos = await Acesso.count({ where });
        
        // Acessos com usuário vs anônimos
        const acessosComUsuario = await Acesso.count({ 
            where: { 
                ...where, 
                user_id: { [Op.ne]: null } 
            } 
        });
        const acessosAnonimos = totalAcessos - acessosComUsuario;
        
        // Top países
        const topPaises = await Acesso.findAll({
            attributes: [
                'geoCountry',
                [Acesso.sequelize.fn('COUNT', Acesso.sequelize.col('id')), 'count']
            ],
            where: {
                ...where,
                geoCountry: { [Op.ne]: null }
            },
            group: ['geoCountry'],
            order: [[Acesso.sequelize.fn('COUNT', Acesso.sequelize.col('id')), 'DESC']],
            limit: 10,
            raw: true,
        });
        
        // Dispositivos mais usados
        const topDispositivos = await Acesso.findAll({
            attributes: [
                'deviceType',
                [Acesso.sequelize.fn('COUNT', Acesso.sequelize.col('id')), 'count']
            ],
            where,
            group: ['deviceType'],
            order: [[Acesso.sequelize.fn('COUNT', Acesso.sequelize.col('id')), 'DESC']],
            raw: true,
        });
        
        // Páginas mais visitadas
        const topPaginas = await Acesso.findAll({
            attributes: [
                'page',
                [Acesso.sequelize.fn('COUNT', Acesso.sequelize.col('id')), 'count']
            ],
            where: {
                ...where,
                page: { [Op.ne]: null }
            },
            group: ['page'],
            order: [[Acesso.sequelize.fn('COUNT', Acesso.sequelize.col('id')), 'DESC']],
            limit: 10,
            raw: true,
        });
        
        res.json({
            periodo: period,
            dataInicio: startDate,
            dataFim: now,
            totalAcessos,
            acessosPorRole: {
                'usuario': acessosComUsuario,
                'anonimo': acessosAnonimos
            },
            topPaises: topPaises.map(p => ({ geoCountry: p.geoCountry, count: parseInt(p.count) })),
            topDispositivos: topDispositivos.reduce((acc, item) => {
                acc[item.deviceType] = parseInt(item.count);
                return acc;
            }, {}),
            topPaginas: topPaginas.map(p => ({ page: p.page, count: parseInt(p.count) })),
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
    }
});

// Rota para obter acessos de um usuário específico (SEM incluir User)
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20 } = req.query;
        
        const acessos = await Acesso.findAll({
            where: { user_id: userId },
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
        });
        
        res.json(acessos);
    } catch (error) {
        console.error('Erro ao buscar acessos do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar acessos do usuário.' });
    }
});

// Rota para deletar acessos antigos (limpeza)
router.delete('/cleanup', async (req, res) => {
    try {
        const { days = 90 } = req.query;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        
        const deletedCount = await Acesso.destroy({
            where: {
                timestamp: {
                    [Op.lt]: cutoffDate
                }
            }
        });
        
        res.json({
            message: `${deletedCount} registros de acesso antigos foram removidos.`,
            cutoffDate,
            deletedCount
        });
    } catch (error) {
        console.error('Erro ao limpar acessos antigos:', error);
        res.status(500).json({ error: 'Erro ao limpar acessos antigos.' });
    }
});

module.exports = router;
