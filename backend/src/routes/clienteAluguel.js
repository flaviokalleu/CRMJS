const express = require('express');
const { ClienteAluguel } = require('../models'); // Certifique-se de que o caminho esteja correto

const router = express.Router();

// Rota para adicionar um cliente de aluguel
router.post('/clientealuguel', async (req, res) => {
  const { nome, cpf, email, telefone, valor_aluguel, dia_vencimento } = req.body;

  try {
    const clienteAluguel = await ClienteAluguel.create({
      nome,
      cpf,
      email,
      telefone,
      valor_aluguel,
      dia_vencimento,
    });
    res.status(201).json(clienteAluguel);
  } catch (error) {
    console.error("Erro ao adicionar aluguel:", error);
    res.status(500).json({ error: "Erro ao adicionar aluguel." });
  }
});

// Rota para listar alugueis
router.get('/clientealuguel', async (req, res) => {
  try {
    const clienteAlugueis = await ClienteAluguel.findAll();
    res.status(200).json(clienteAlugueis);
  } catch (error) {
    console.error("Erro ao listar alugueis:", error);
    res.status(500).json({ error: "Erro ao listar alugueis." });
  }
});

// Rota para deletar um cliente de aluguel
router.delete('/clientealuguel/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await ClienteAluguel.destroy({
      where: {
        id: id,
      },
    });

    if (!result) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.status(204).send(); // Retorna 204 No Content
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente.' });
  }
});

// Rota para atualizar um cliente de aluguel
router.put('/clientealuguel/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, email, telefone, valor_aluguel, dia_vencimento, pago, historico_pagamentos } = req.body;

  try {
    const [updated] = await ClienteAluguel.update(
      { nome, cpf, email, telefone, valor_aluguel, dia_vencimento, pago, historico_pagamentos },
      { where: { id: id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    const updatedClienteAluguel = await ClienteAluguel.findOne({ where: { id: id } });
    res.status(200).json(updatedClienteAluguel);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
});

router.post('/clientealuguel/:id/pagamento', async (req, res) => {
  try {
    const cliente = await ClienteAluguel.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const { data, valor, status } = req.body;
    const novoPagamento = { data, valor, status };

    cliente.historico_pagamentos.push(novoPagamento);
    await cliente.save();

    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar pagamento' });
  }
});

module.exports = router;
