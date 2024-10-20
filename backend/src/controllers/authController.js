const jwt = require('jsonwebtoken');
const { Token, Corretor, Correspondente, Administrador, Acesso } = require('../models');
const requestIp = require('request-ip'); // Import the request-ip package

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error('Environment variables ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set');
}

// Helper function to calculate expiration date
const getExpirationDate = (minutes) => new Date(Date.now() + minutes * 60000);

// Função para criar e armazenar o token
const createAndStoreToken = async (user, userType) => {
    const payload = { id: user.id, role: user.role || 'user', userType };
    const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    await Token.upsert({
        token,
        refreshToken,
        userId: user.id,
        userType,
        expiresAt: getExpirationDate(60), // Expira em 60 minutos
        email: user.email || null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return { token, refreshToken };
};

// Função para validar entrada
const validateInput = (email, password) => {
    if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
    }
};

// Função auxiliar para encontrar o usuário
const findUserByEmail = async (email) => {
    const userTypes = [Corretor, Correspondente, Administrador];
    for (const UserType of userTypes) {
        const user = await UserType.findOne({ where: { email } });
        if (user) return { user, userType: UserType.name.toLowerCase() }; // 'corretor', 'correspondente', or 'administrador'
    }
    return null;
};

// Função para autenticar o usuário
const authenticateUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        validateInput(email, password);

        const userInfo = await findUserByEmail(email);
        if (!userInfo) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        const { user, userType } = userInfo;

        // Compare the Base64 encoded password
        const isPasswordValid = Buffer.from(password).toString('base64') === user.password;
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Use request-ip to get the client's IPv4 address
        const ip = requestIp.getClientIp(req);
        
        // Registra o acesso
        await Acesso.create({
            ip,
            referer: req.get('Referrer') || 'N/A',
            userAgent: req.get('User-Agent') || 'N/A',
            [userType + 'Id']: user.id
        });

        // Cria e armazena o token
        const { token, refreshToken } = await createAndStoreToken(user, userType);

        // Retorna o token e informações do usuário
        res.json({
            token,
            refreshToken,
            role: user.role || 'user',
            userType,
        });
    } catch (error) {
        console.error('Erro ao autenticar o usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
};

// Middleware para autenticação do token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
        const tokenRecord = await Token.findOne({ where: { token } });
        if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
            return res.sendStatus(401);
        }

        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        res.sendStatus(500);
    }
};

module.exports = { authenticateUser, authenticateToken };
