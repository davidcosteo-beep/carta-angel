const express = require('express');

const router = express.Router();
const requireRole = require('../middleware/requireRole');
const {
  ROLES
} = require('../utils/roles');

const {
  listarPacientes,
  listarPacientesArchivados,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  archivarPaciente,
  reactivarPaciente
} = require('../controllers/pacientesController');

router.get('/',  listarPacientes);

router.get(
  '/archivados',
  requireRole(ROLES.TERAPEUTA),
  listarPacientesArchivados
);

router.get('/:id', obtenerPaciente);

router.post('/', crearPaciente);

router.put('/:id', actualizarPaciente);

router.put(
  '/:id/archivar',
  requireRole(ROLES.TERAPEUTA),
  archivarPaciente
);

router.put(
  '/:id/reactivar',
  requireRole(ROLES.TERAPEUTA),
  reactivarPaciente
);

module.exports = router;
