const express = require('express');

const router = express.Router();

const {
  listarCitas,
  crearCita,
  actualizarCita,
  guardarSeguimiento,
  cancelarCita,
  finalizarCita,
  confirmarCita,
  obtenerSeguimientos
} = require('../controllers/citasController');

router.get('/', listarCitas);

router.post('/', crearCita);

router.put("/:id", actualizarCita);

router.put("/:id/seguimiento",guardarSeguimiento);

router.put("/:id/cancelar", cancelarCita);

router.put("/:id/finalizar",finalizarCita);

router.put("/:id/confirmar", confirmarCita);

router.get("/:id/seguimientos",obtenerSeguimientos);

module.exports = router;