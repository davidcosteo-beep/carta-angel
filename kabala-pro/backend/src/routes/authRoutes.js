const express = require('express');

const router = express.Router();

const verifyToken = require('../middleware/verifyToken');

const {
  login,
  profile
} = require('../controllers/authController');

router.post('/login', login);

router.get(
  '/profile',
  verifyToken,
  profile
);

module.exports = router;