const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { sql } = require('../config/db');

const login = async (req, res) => {

  try {

    const { correo, password } = req.body;

    const result = await sql.query`
      SELECT TOP 1 *
      FROM tblUsuarios
      WHERE correo = ${correo}
      AND activo = 1
    `;

    if (result.recordset.length === 0) {

      return res.status(401).json({
        ok: false,
        message: 'Usuario no encontrado'
      });

    }

    const usuario = result.recordset[0];

    const passwordValido = await bcrypt.compare(
      password,
      usuario.passwordHash
    );

    if (!passwordValido) {

      return res.status(401).json({
        ok: false,
        message: 'Contraseña incorrecta'
      });

    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        premium: usuario.premium
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d'
      }
    );

    res.json({

      ok: true,

      token,

      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        premium: usuario.premium
      }

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error servidor'
    });

  }

};

module.exports = {
  login
};