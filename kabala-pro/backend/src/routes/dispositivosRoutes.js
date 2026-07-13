const express = require('express');

const router = express.Router();

const {
  listar,
  reactivar,
  revocar
} = require('../controllers/dispositivosController');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { ROLES } = require('../utils/roles');

router.get(
  '/',
  verifyToken,
  requireRole(ROLES.TECNICO, ROLES.TERAPEUTA),
  listar
);

router.patch(
  '/:id/revocar',
  verifyToken,
  requireRole(ROLES.TECNICO, ROLES.TERAPEUTA),
  revocar
);

router.patch(
  '/:id/reactivar',
  verifyToken,
  requireRole(ROLES.TECNICO),
  reactivar
);

module.exports = router;
