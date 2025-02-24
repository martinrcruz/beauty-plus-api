// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    // roles es un array, ejemplo ['admin', 'receptionist', 'client']
    if (typeof roles === 'string') {
      roles = [roles];
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'No se proporcionó un token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token no válido' });
      }

      // Verificar rol si se especificó
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'No tienes permisos' });
      }

      req.user = user; // { id, role, ... }
      next();
    });
  };
};

module.exports = authMiddleware;
