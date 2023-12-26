const jsonwebtoken = require('jsonwebtoken');
const asyncHandler = require("express-async-handler");
const { handleHttpError } = require("../helpers/handleErrors");

const verifyTokenAdmin = (req, res, next) => {
    const token = req.cookies['accessToken']; // Asegúrate de que el nombre de la cookie es 'jwt'
    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    try {
        const verified = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // Puedes diferenciar entre errores de token expirado y token inválido si es necesario
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({ error: 'Invalid token' });
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}


module.exports = { verifyTokenAdmin };