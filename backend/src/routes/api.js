const express = require('express');
const router = express.Router();
const { User, Cliente, Administrador, Correspondente, Imovel, Proprietario, Lembrete, Corretor } = require('../models');

// Endpoints para User
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoints para Cliente
router.get('/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.findAll();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoints para Administrador
router.get('/administradores', async (req, res) => {
    try {
        const administradores = await Administrador.findAll();
        res.json(administradores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoints para Correspondente
router.get('/correspondentes', async (req, res) => {
    try {
        const correspondentes = await Correspondente.findAll();
        res.json(correspondentes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoints para Imovel
router.get('/imoveis', async (req, res) => {
    try {
        const imoveis = await Imovel.findAll();
        res.json(imoveis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoints para Proprietario
router.get('/proprietarios', async (req, res) => {
    try {
        const proprietarios = await Proprietario.findAll();
        res.json(proprietarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoints para Lembrete
router.get('/lembretes', async (req, res) => {
    try {
        const lembretes = await Lembrete.findAll();
        res.json(lembretes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoints para Corretor
// Endpoints para Corretor
router.get('/corretores', async (req, res) => {
    try {
        const corretores = await Corretor.findAll();
        res.json(corretores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
