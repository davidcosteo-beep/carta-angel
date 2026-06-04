const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const pdfRoutes =
  require('./routes/pdfRoutes');

const pacientesRoutes =
  require('./routes/pacientesRoutes');

const citasRoutes =
  require('./routes/citas');

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

app.use('/api/pacientes', pacientesRoutes);

app.use('/api/citas', citasRoutes);

module.exports = app;