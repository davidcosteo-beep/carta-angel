require('dotenv').config();

const app = require('./src/app');

const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 4000;

connectDB();

app.listen(

  PORT,

  '0.0.0.0',

  () => {

    console.log(
      `Servidor corriendo en puerto ${PORT}`
    );

  }

);