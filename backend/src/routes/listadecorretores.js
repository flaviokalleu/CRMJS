const express = require('express');
const router = express.Router();
const { Corretor } = require('../models');

// Rota para listar todos os corretores
router.get('/', async (req, res) => {
    try {
        const corretores = await Corretor.findAll();
        res.json(corretores);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar corretores", error });
    }
});

module.exports = router;
