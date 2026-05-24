
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const pdfRoutes =
  require('./routes/pdfRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/pdfs',
  express.static('storage/pdfs')
);

app.get('/', (req, res) => {

  res.json({
    ok: true,
    message: 'Kabala Pro API funcionando'
  });

});

app.use('/api/auth', authRoutes);

app.use('/api/pdf', pdfRoutes);

module.exports = app;

