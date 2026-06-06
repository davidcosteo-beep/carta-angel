const express = require('express');

const router = express.Router();

const {
  listarCitas,
  crearCita,
  actualizarCita,
  cancelarCita,
  finalizarCita
} = require('../controllers/citasController');

router.get('/', listarCitas);

router.post('/', crearCita);

router.put("/:id", actualizarCita);

router.put("/:id/cancelar", cancelarCita);

router.put("/:id/finalizar",finalizarCita);

module.exports = router;