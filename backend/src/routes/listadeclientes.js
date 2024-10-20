const express = require('express');
const router = express.Router();
const { Cliente, Corretor, Nota } = require('../models'); // Ajuste o caminho conforme necessário
const { authenticateToken } = require('./authRoutes'); // Ajuste o caminho conforme necessário
const { Op } = require('sequelize');

// Função auxiliar para validar datas
const validateDates = (dataInicio, dataFim) => {
  const startDate = new Date(dataInicio);
  const endDate = new Date(dataFim);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Datas inválidas fornecidas.');
  }

  if (startDate > endDate) {
    throw new Error('A data de início deve ser anterior à data de fim.');
  }

  return [startDate, endDate];
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, dataInicio, dataFim } = req.query;

    console.log('Solicitação recebida com parâmetros:', req.query);

    // Verifica o tipo de usuário
    const userRole = req.user.role; // Assumindo que o papel do usuário esteja em req.user
    let whereConditions = {};

    // Se o usuário for um corretor, busca pelo seu email
    if (userRole === 'corretor') {
      const corretor = await Corretor.findOne({ where: { email: req.user.email } });

      if (!corretor) {
        return res.status(404).json({ error: 'Corretor não encontrado.' });
      }

      whereConditions.corretorId = corretor.id;

    } else if (userRole === 'Correspondente' || userRole === 'Administrador') {
      // Se for correspondente ou administrador, não filtra pelo corretorId
      if (status && status !== 'Todos') {
        whereConditions.status = status;
      }

      if (dataInicio && dataFim) {
        try {
          const [startDate, endDate] = validateDates(dataInicio, dataFim);
          whereConditions.data_admissao = {
            [Op.between]: [startDate.toISOString(), endDate.toISOString()],
          };
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }
    } else {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    console.log('Condições de busca:', whereConditions);

    const clientes = await Cliente.findAll({
      where: whereConditions,
      include: [
        {
          model: Corretor,
          as: 'corretor',
          attributes: ['first_name', 'last_name'],
          required: true,
        },
        {
          model: Nota,
          as: 'notas',
          attributes: ['id', 'texto'],
        },
      ],
    });

    res.status(200).json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
});

module.exports = router;
