const express = require('express');

const router = express.Router();

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
