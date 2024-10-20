const jwt = require('jsonwebtoken');
const { Token } = require('./models'); // Ajuste o caminho para o modelo Token
const { SECRET_KEY } = process.env;

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    try {
      const tokenRecord = await Token.findOne({ where: { token } });
      if (!tokenRecord || new Date() > tokenRecord.expiresAt) return res.sendStatus(401);
  
      jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    } catch (error) {
      console.error('Erro ao verificar o token:', error);
      res.sendStatus(500);
    }
  };
  

module.exports = authenticateToken;
