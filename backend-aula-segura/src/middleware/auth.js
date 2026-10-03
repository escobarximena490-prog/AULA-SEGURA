const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Debe iniciar sesión.' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o vencida.' });
  }
}

function staffOnly(req, res, next) {
  if (req.user?.tipo !== 'usuario') {
    return res.status(403).json({ message: 'Solo personal autorizado.' });
  }
  return next();
}

function adminOnly(req, res, next) {
  if (req.user?.tipo !== 'usuario' || req.user?.rol !== 'Administrador') {
    return res.status(403).json({ message: 'Solo administradores.' });
  }
  return next();
}

module.exports = { authRequired, staffOnly, adminOnly };
