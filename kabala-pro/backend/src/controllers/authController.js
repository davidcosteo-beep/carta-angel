const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { sql } = require('../config/db');
const {
  sendEmailConfirmationCode
} = require('../services/mailService');
const {
  USER_CODE_ORIGINS,
  createEmailConfirmationCode,
  deactivateCode,
  findLatestActiveEmailConfirmationCode,
  getMaxEmailConfirmationAttempts,
  incrementFailedAttempt,
  markCodeUsed,
  normalizeEmail
} = require('../services/userCodeService');
const { normalizeRole } = require('../utils/roles');

const isValidEmail = (correo) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

const login = async (req, res) => {
  try {
    const correoNormalizado = normalizeEmail(req.body?.correo);

    const { password } = req.body;

    if (!correoNormalizado || !password) {
      return res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos.'
      });
    }

    const result = await sql.query`
      SELECT TOP 1 *
      FROM tblUsuarios
      WHERE LOWER(LTRIM(RTRIM(ISNULL(correo, '')))) = ${correoNormalizado}
    `;

    if (result.recordset.length === 0) {
      return res.status(401).json({
        ok: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos.'
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
        code: 'INVALID_CREDENTIALS',
        message: 'Correo o contraseña incorrectos.'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        ok: false,
        code: 'USER_INACTIVE',
        message: 'Usuario inactivo. Comunícate con el administrador.'
      });
    }

    if (!usuario.correoVerificado) {
      return res.status(403).json({
        ok: false,
        code: 'EMAIL_NOT_VERIFIED',
        requiresEmailVerification: true,
        correo: usuario.correo,
        message: 'Debes verificar tu correo antes de ingresar.'
      });
    }

    const rolUsuario = normalizeRole(usuario.rol);

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

    return res.json({
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

    return res.status(500).json({
      ok: false,
      code: 'SERVER_UNAVAILABLE',
      message: 'Error de servidor.'
    });
  }
};

const profile = async (req, res) => {
  res.json({
    ok: true,
    usuario: req.usuario
  });
};

const findUserByEmail = async (correo) => {
  const result = await sql.query`
    SELECT TOP 1
      id,
      correo,
      activo,
      correoVerificado
    FROM dbo.tblUsuarios
    WHERE LOWER(LTRIM(RTRIM(ISNULL(correo, '')))) = ${correo}
  `;

  return result.recordset[0] || null;
};

const confirmarCorreo = async (req, res) => {
  try {
    const correo = normalizeEmail(req.body?.correo);
    const codigo = String(req.body?.codigo || '').trim();

    if (!isValidEmail(correo)) {
      return res.status(400).json({
        ok: false,
        message: 'Ingresa un correo válido.'
      });
    }

    if (!/^\d{6}$/.test(codigo)) {
      return res.status(400).json({
        ok: false,
        message: 'Código incorrecto.'
      });
    }

    const usuario = await findUserByEmail(correo);

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        message: 'Código incorrecto.'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        ok: false,
        message: 'Usuario inactivo. Comunícate con el administrador.'
      });
    }

    if (usuario.correoVerificado) {
      return res.json({
        ok: true,
        message: 'El correo ya estaba verificado. Ya puedes iniciar sesión.'
      });
    }

    const emailCode =
      await findLatestActiveEmailConfirmationCode({
        usuarioId: usuario.id,
        correo
      });

    if (!emailCode) {
      return res.status(400).json({
        ok: false,
        message: 'Código expirado. Solicita uno nuevo.'
      });
    }

    const maxAttempts = getMaxEmailConfirmationAttempts();

    if (emailCode.expirado) {
      await deactivateCode(emailCode.id);

      return res.status(400).json({
        ok: false,
        message: 'Código expirado. Solicita uno nuevo.'
      });
    }

    if (emailCode.intentos >= maxAttempts) {
      await deactivateCode(emailCode.id);

      return res.status(400).json({
        ok: false,
        message: 'Código bloqueado. Solicita uno nuevo.'
      });
    }

    if (emailCode.fechaUso || !emailCode.activo) {
      return res.status(400).json({
        ok: false,
        message: 'Código expirado. Solicita uno nuevo.'
      });
    }

    const validCode = await bcrypt.compare(
      codigo,
      emailCode.codigoHash
    );

    if (!validCode) {
      const shouldInvalidate =
        emailCode.intentos + 1 >= maxAttempts;
      const intentosRestantes = Math.max(
        maxAttempts - (emailCode.intentos + 1),
        0
      );

      await incrementFailedAttempt({
        codeId: emailCode.id,
        shouldInvalidate
      });

      return res.status(400).json({
        ok: false,
        intentosRestantes,
        message: shouldInvalidate
          ? 'Código bloqueado. Solicita uno nuevo.'
          : `Código incorrecto. Te quedan ${intentosRestantes} intentos.`
      });
    }

    await sql.query`
      UPDATE dbo.tblUsuarios
      SET correoVerificado = 1,
          fechaVerificacionCorreo = GETDATE()
      WHERE id = ${usuario.id}
    `;

    await markCodeUsed(emailCode.id);

    return res.json({
      ok: true,
      message: 'Correo verificado correctamente. Ya puedes iniciar sesión.'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible verificar el correo.'
    });
  }
};

const reenviarConfirmacionCorreo = async (req, res) => {
  try {
    const correo = normalizeEmail(req.body?.correo);

    if (!isValidEmail(correo)) {
      return res.status(400).json({
        ok: false,
        message: 'Ingresa un correo válido.'
      });
    }

    const usuario = await findUserByEmail(correo);

    if (!usuario || usuario.correoVerificado || !usuario.activo) {
      return res.json({
        ok: true,
        message: 'Si el correo está pendiente, recibirás un nuevo código.'
      });
    }

    const {
      code,
      expiresInMinutes
    } = await createEmailConfirmationCode({
      usuarioId: usuario.id,
      correo,
      origen: USER_CODE_ORIGINS.REENVIO
    });

    await sendEmailConfirmationCode({
      to: correo,
      code,
      expiresInMinutes
    });

    return res.json({
      ok: true,
      message: 'Código de confirmación enviado.'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible reenviar el código.'
    });
  }
};

module.exports = {
  confirmarCorreo,
  login,
  profile,
  reenviarConfirmacionCorreo
};
