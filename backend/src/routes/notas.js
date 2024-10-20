const express = require('express');
const router = express.Router();
const { Nota, Cliente } = require('../models'); 

// Rota para criar uma nova nota
router.post('/notas', async (req, res) => {
    const { cliente_id, processo_id, nova, destinatario, texto, data_criacao, criado_por_id } = req.body;

    console.log('Dados recebidos:', { cliente_id, processo_id, nova, destinatario, texto, data_criacao, criado_por_id });

    try {
        const novaNota = await Nota.create({
            cliente_id,
            processo_id,
            nova,
            destinatario,
            texto,
            data_criacao,
            criado_por_id
        });
       
        res.status(201).json(novaNota);
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({ error: error.message });
    }
});


// Rota para buscar notas por cliente
router.get('/clientes/:id/notas', async (req, res) => {
    const { id } = req.params; // Extrai o ID do cliente da requisição
    try {
        // Busca todas as notas onde o cliente_id corresponde ao ID fornecido
        const notas = await Nota.findAll({ where: { cliente_id: id } });

        // Verifica se foram encontradas notas
        if (notas.length === 0) {
            return res.status(404).json({ message: 'Notas não encontradas para este cliente.' });
        }

        // Transforma as notas para adicionar o campo criado_por_id
        const notasComCriador = notas.map(nota => ({
            ...nota.toJSON(), // Converte a nota para JSON
            criado_por_id: nota.criado_por_id || "Desconhecido" // Garante um valor padrão caso não exista
        }));

        // Retorna as notas com status 200
        res.status(200).json(notasComCriador);
    } catch (error) {
        // Registra o erro no console
        console.error('Erro ao buscar notas:', error);
        // Retorna erro 500 se houver um problema ao buscar as notas
        res.status(500).json({ error: 'Erro ao buscar notas.' });
    }
});


// Rota para buscar uma nota específica por ID
router.get('/notas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const nota = await Nota.findByPk(id);
        if (!nota) {
            return res.status(404).json({ message: 'Nota não encontrada.' });
        }
        res.status(200).json(nota);
    } catch (error) {
        console.error('Erro ao buscar nota:', error);
        res.status(500).json({ error: 'Erro ao buscar nota.' });
    }
});

// Rota para concluir uma nota
router.put('/notas/:id/concluir', async (req, res) => {
    const { id } = req.params;

    try {
        const nota = await Nota.findByPk(id);
        if (!nota) {
            return res.status(404).json({ error: 'Nota não encontrada' });
        }

        // Atualiza a nota como concluída
        nota.nova = false; // Supondo que 'nova' indica se a nota é nova
        await nota.save();

        
        res.status(200).json(nota);
    } catch (error) {
        console.error('Erro ao concluir nota:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para deletar uma nota
router.delete('/notas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const nota = await Nota.findByPk(id);
        if (!nota) {
            return res.status(404).json({ error: 'Nota não encontrada' });
        }

        await nota.destroy();
        
        res.status(204).send(); // Retorna um status 204 No Content
    } catch (error) {
        console.error('Erro ao deletar nota:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
