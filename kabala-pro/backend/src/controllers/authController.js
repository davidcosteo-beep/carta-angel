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

    const rolNormalizado =
      String(usuario.rol || "")
        .trim()
        .toUpperCase();

    const rolesPermitidos = [
      "TECNICO",
      "TERAPEUTA",
      "AUXILIAR"
    ];

    const rolUsuario =
      rolesPermitidos.includes(rolNormalizado)
        ? rolNormalizado
        : "TERAPEUTA";

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        premium: usuario.premium,
        rol: rolUsuario
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
        premium: usuario.premium,
        rol: rolUsuario
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

const profile = async (req, res) => {

  res.json({

    ok: true,

    usuario: req.usuario

  });

};

module.exports = {
  login, 
  profile
};

