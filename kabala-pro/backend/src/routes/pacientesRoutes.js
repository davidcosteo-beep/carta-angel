const express = require('express');

const router = express.Router();

const verifyToken = require('../middleware/verifyToken');

const {
  listarPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} = require('../controllers/pacientesController');

router.get('/',  listarPacientes);

router.get('/:id', obtenerPaciente);

router.post('/', crearPaciente);

router.put('/:id', actualizarPaciente);

router.delete('/:id', eliminarPaciente);

module.exports = router;