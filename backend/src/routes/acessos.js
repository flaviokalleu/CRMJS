const express = require('express');
const router = express.Router();
const { Acesso, Corretor, Correspondente, Administrador } = require('../models'); // Adjust path as necessary
const geoip = require('geoip-lite');
const requestIp = require('request-ip'); // Import request-ip package

// Middleware to enable request-ip
router.use(requestIp.mw());

router.post('/', async (req, res) => {
    // Get the client's IP address using request-ip
    const ip = req.clientIp; // Use request-ip's middleware to get the client's IP
    const referer = req.body.referer;
    const role = req.body.role;

    try {
        const geo = geoip.lookup(ip) || {};

        // Check if req.user is defined
        const userEmail = req.user ? req.user.email : null;

        await Acesso.create({
            ip,
            referer,
            userAgent: req.headers['user-agent'],
            geoCity: geo.city || null,
            geoRegion: geo.region || null,
            geoCountry: geo.country || null,
            timestamp: new Date(),
            userId: role === 'corretor' ? userEmail : null,
            correspondenteId: role === 'correspondente' ? userEmail : null,
            administradorId: role === 'administrador' ? userEmail : null,
        });

        res.status(201).send({ message: 'Acesso registrado com sucesso.' });
    } catch (error) {
        console.error("Erro ao registrar acesso:", error);
        res.status(500).send({ error: 'Erro ao registrar acesso.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const acessos = await Acesso.findAll({
            include: [
                {
                    model: Corretor,
                    as: 'corretor',
                    attributes: ['email', 'first_name'], // Fetch email instead of id
                },
                {
                    model: Correspondente,
                    as: 'correspondente', // Corrected casing to match your models
                    attributes: ['email', 'first_name'], // Fetch email instead of id
                },
                {
                    model: Administrador,
                    as: 'administrador', // Corrected casing to match your models
                    attributes: ['email', 'first_name'], // Fetch email instead of id
                },
            ],
        });

        res.json(acessos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar acessos.' });
    }
});

module.exports = router;
