const express = require('express');

const router = express.Router();

const {
  generarPDF
} = require('../controllers/pdfController');

router.post(
  '/generar',
  generarPDF
);

module.exports = router;