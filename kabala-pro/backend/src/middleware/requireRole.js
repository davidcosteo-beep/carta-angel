const { normalizeRole } = require('../utils/roles');

const requireRole = (...allowedRoles) => (req, res, next) => {
  const userRole = normalizeRole(req.usuario?.rol, '');

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      ok: false,
      message: 'No tiene permisos para realizar esta accion.'
    });
  }

  return next();
};

module.exports = requireRole;
