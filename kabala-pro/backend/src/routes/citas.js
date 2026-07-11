const express = require('express');

const router = express.Router();
const requireRole = require('../middleware/requireRole');
const {
  ROLES
} = require('../utils/roles');

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

router.put(
  "/:id/seguimiento",
  requireRole(ROLES.TERAPEUTA),
  guardarSeguimiento
);

router.put("/:id/cancelar", cancelarCita);

router.put(
  "/:id/finalizar",
  requireRole(ROLES.TERAPEUTA),
  finalizarCita
);

router.put("/:id/confirmar", confirmarCita);

router.get(
  "/:id/seguimientos",
  requireRole(ROLES.TERAPEUTA),
  obtenerSeguimientos
);

module.exports = router;
