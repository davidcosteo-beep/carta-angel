const express = require('express');

const router = express.Router();

const verifyToken = require('../middleware/verifyToken');

const {
  confirmarCorreo,
  login,
  profile,
  reenviarConfirmacionCorreo
} = require('../controllers/authController');

router.post('/login', login);

router.post('/confirmar-correo', confirmarCorreo);

router.post(
  '/reenviar-confirmacion-correo',
  reenviarConfirmacionCorreo
);

router.get(
  '/profile',
  verifyToken,
  profile
);

module.exports = router;
