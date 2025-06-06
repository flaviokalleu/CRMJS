const express = require('express');
const router = express.Router();
const { Nota, Cliente, User } = require('../models'); // Inclua User para futuras associações

// Rota para criar uma nova nota
router.post('/notas', async (req, res) => {
    const { cliente_id, processo_id, nova, destinatario, texto, data_criacao, criado_por_id } = req.body;

    console.log('Dados recebidos:', { cliente_id, processo_id, nova, destinatario, texto, data_criacao, criado_por_id });

    try {
        if (criado_por_id && isNaN(Number(criado_por_id))) {
            return res.status(400).json({ error: 'O campo criado_por_id deve ser um número.' });
        }
        let user = null;
        if (criado_por_id) {
            user = await User.findByPk(criado_por_id);
            if (!user) {
                return res.status(400).json({ error: 'Usuário criador não encontrado.' });
            }
        }

        // Se quiser garantir que o cliente existe, pode buscar:
        // const cliente = await Cliente.findByPk(cliente_id);
        // if (!cliente) return res.status(400).json({ error: 'Cliente não encontrado.' });

        const novaNota = await Nota.create({
            cliente_id,
            processo_id,
            nova,
            destinatario,
            texto,
            data_criacao,
            criado_por_id: user ? user.id : null,
        });

        res.status(201).json(novaNota);
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({ error: error.message });
    }
});


// Rota para buscar notas por cliente
router.get('/clientes/:id/notas', async (req, res) => {
    const { id } = req.params;
    try {
        const notas = await Nota.findAll({ where: { cliente_id: id } });

        if (notas.length === 0) {
            return res.status(404).json({ message: 'Notas não encontradas para este cliente.' });
        }

        // Adiciona o nome do criador se existir
        const notasComCriador = await Promise.all(notas.map(async nota => {
            let criador = "Desconhecido";
            if (nota.criado_por_id) {
                const user = await User.findByPk(nota.criado_por_id);
                if (user) {
                    criador = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
                }
            }
            return {
                ...nota.toJSON(),
                criado_por_id: nota.criado_por_id || "Desconhecido",
                criador_nome: criador
            };
        }));

        res.status(200).json(notasComCriador);
    } catch (error) {
        console.error('Erro ao buscar notas:', error);
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

        nota.nova = false;
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
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar nota:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
