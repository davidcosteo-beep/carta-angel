const express = require('express');

const router = express.Router();

const verifyToken = require('../middleware/verifyToken');

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

router.get('/archivados', listarPacientesArchivados);

router.get('/:id', obtenerPaciente);

router.post('/', crearPaciente);

router.put('/:id', actualizarPaciente);

router.put('/:id/archivar', archivarPaciente);

router.put('/:id/reactivar', reactivarPaciente);

module.exports = router;