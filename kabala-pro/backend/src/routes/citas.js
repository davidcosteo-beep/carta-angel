const express = require('express');

const router = express.Router();

const {
  listarCitas,
  crearCita,
  actualizarCita
} = require('../controllers/citasController');

router.get('/', listarCitas);

router.post('/', crearCita);

router.put("/:id", actualizarCita);

module.exports = router;