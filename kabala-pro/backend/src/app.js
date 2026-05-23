const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {

  res.json({
    ok: true,
    message: 'Kabala Pro API funcionando'
  });

});

app.use('/api/auth', authRoutes);

module.exports = app;