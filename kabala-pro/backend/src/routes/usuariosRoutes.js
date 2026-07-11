const express = require('express');

const router = express.Router();

const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const {
  ROLES
} = require('../utils/roles');
const {
  existsTerapeuta,
  crearPrimerTerapeuta,
  crearUsuarioFuncional,
  corregirCorreoPendiente,
  generarCodigoConfirmacionManual,
  listarPendientesVerificacion,
  reenviarConfirmacionUsuario
} = require('../controllers/usuariosController');

router.get(
  '/exists-terapeuta',
  verifyToken,
  requireRole(ROLES.TECNICO),
  existsTerapeuta
);

router.post(
  '/crear-primer-terapeuta',
  verifyToken,
  requireRole(ROLES.TECNICO),
  crearPrimerTerapeuta
);

router.get(
  '/pendientes-verificacion',
  verifyToken,
  requireRole(ROLES.TECNICO, ROLES.TERAPEUTA),
  listarPendientesVerificacion
);

router.post(
  '/:id/reenviar-confirmacion',
  verifyToken,
  requireRole(ROLES.TECNICO, ROLES.TERAPEUTA),
  reenviarConfirmacionUsuario
);

router.patch(
  '/:id/correo-pendiente',
  verifyToken,
  requireRole(ROLES.TECNICO, ROLES.TERAPEUTA),
  corregirCorreoPendiente
);

router.post(
  '/:id/generar-codigo-confirmacion-manual',
  verifyToken,
  requireRole(ROLES.TECNICO, ROLES.TERAPEUTA),
  generarCodigoConfirmacionManual
);

router.post(
  '/',
  verifyToken,
  requireRole(ROLES.TECNICO, ROLES.TERAPEUTA),
  crearUsuarioFuncional
);

module.exports = router;
