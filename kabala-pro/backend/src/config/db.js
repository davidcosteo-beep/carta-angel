const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,

  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

const connectDB = async () => {

  try {

    if (process.env.NODE_ENV !== 'production') {

      console.log({
        server: config.server,
        database: config.database
      });

    }

    await sql.connect(config);

    console.log('SQL Server conectado');

  } catch (error) {

    console.error('Error SQL Server:', error);

  }

};

module.exports = {
  sql,
  connectDB
};

