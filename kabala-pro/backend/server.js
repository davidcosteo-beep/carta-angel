require('dotenv').config();

const app = require('./src/app');

const { connectDB } = require('./src/config/db');
const {
  ensureTechnicalUser
} = require('./src/services/bootstrapService');

const PORT = process.env.PORT || 4000;

const startServer = async () => {

  await connectDB();
  await ensureTechnicalUser();

  app.listen(

    PORT,

    '0.0.0.0',

    () => {

      console.log(
        `Servidor corriendo en puerto ${PORT}`
      );

    }

  );

};

startServer().catch((error) => {
  console.error('No se pudo iniciar Kabala Pro Backend:', error);
  process.exit(1);
});
