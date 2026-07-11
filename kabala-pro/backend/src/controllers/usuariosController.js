const bcrypt = require('bcrypt');

const { sql } = require('../config/db');
const {
  ROLES,
  normalizeRole
} = require('../utils/roles');
const {
  sendEmailConfirmationCode
} = require('../services/mailService');
const {
  USER_CODE_ORIGINS,
  createEmailConfirmationCode,
  invalidateActiveUserCodes,
  normalizeEmail
} = require('../services/userCodeService');

const isValidEmail = (correo) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

const getUserPasswordMinLength = () => {
  const configuredLength = Number(
    process.env.USER_PASSWORD_MIN_LENGTH || 4
  );

  return Number.isFinite(configuredLength) &&
    configuredLength > 0
    ? Math.floor(configuredLength)
    : 4;
};

const canManagePendingUser = ({
  actorRole,
  targetRole
}) => {
  if (actorRole === ROLES.TECNICO) {
    return true;
  }

  if (actorRole === ROLES.TERAPEUTA) {
    return (
      targetRole === ROLES.TERAPEUTA ||
      targetRole === ROLES.AUXILIAR
    );
  }

  return false;
};

const sendConfirmationForUser = async ({
  usuarioId,
  correo,
  origen,
  creadoPorUsuarioId
}) => {
  const {
    code,
    expiresInMinutes
  } = await createEmailConfirmationCode({
    usuarioId,
    correo,
    origen,
    creadoPorUsuarioId
  });

  await sendEmailConfirmationCode({
    to: correo,
    code,
    expiresInMinutes
  });

  return {
    code,
    expiresInMinutes
  };
};

const existeTerapeutaActivo = async () => {
  const result = await sql.query`
    SELECT TOP 1 id
    FROM dbo.tblUsuarios
    WHERE UPPER(LTRIM(RTRIM(ISNULL(rol, '')))) = ${ROLES.TERAPEUTA}
    AND ISNULL(activo, 0) = 1
  `;

  return result.recordset.length > 0;
};

const existsTerapeuta = async (req, res) => {
  try {
    const existeTerapeuta =
      await existeTerapeutaActivo();

    return res.json({
      ok: true,
      existeTerapeuta
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'Error verificando terapeutas.'
    });
  }
};

const crearPrimerTerapeuta = async (req, res) => {
  try {
    const {
      correo,
      password,
      confirmPassword
    } = req.body;

    const correoNormalizado = normalizeEmail(correo);

    if (!correoNormalizado) {
      return res.status(400).json({
        ok: false,
        message: 'El correo es obligatorio.'
      });
    }

    if (!isValidEmail(correoNormalizado)) {
      return res.status(400).json({
        ok: false,
        message: 'Ingresa un correo válido.'
      });
    }

    const passwordMinLength = getUserPasswordMinLength();

    if (!password || password.length < passwordMinLength) {
      return res.status(400).json({
        ok: false,
        message: `La contraseña debe tener al menos ${passwordMinLength} caracteres.`
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Las contraseñas no coinciden.'
      });
    }

    const terapeutaExistente =
      await existeTerapeutaActivo();

    if (terapeutaExistente) {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un terapeuta activo. No se puede crear otro terapeuta inicial.'
      });
    }

    const usuarioExistente = await sql.query`
      SELECT TOP 1 id
      FROM dbo.tblUsuarios
      WHERE LOWER(LTRIM(RTRIM(ISNULL(correo, '')))) = ${correoNormalizado}
    `;

    if (usuarioExistente.recordset.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un usuario con ese correo.'
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const insertResult = await sql.query`
      INSERT INTO dbo.tblUsuarios
      (
        nombre,
        correo,
        passwordHash,
        premium,
        activo,
        rol,
        correoVerificado,
        fechaVerificacionCorreo
      )
      OUTPUT INSERTED.id
      VALUES
      (
        'Terapeuta Principal',
        ${correoNormalizado},
        ${passwordHash},
        1,
        1,
        ${ROLES.TERAPEUTA},
        0,
        NULL
      );
    `;

    const usuarioId = insertResult.recordset[0].id;
    let correoEnviado = true;

    try {
      await sendConfirmationForUser({
        usuarioId,
        correo: correoNormalizado,
        origen: USER_CODE_ORIGINS.AUTO_EMAIL,
        creadoPorUsuarioId: req.usuario?.id || null
      });
    } catch (error) {
      correoEnviado = false;
      console.error(
        'Error enviando confirmación de correo:',
        error.message
      );
    }

    return res.status(201).json({
      ok: true,
      correoPendienteVerificacion: true,
      correoEnviado,
      message: correoEnviado
        ? 'Terapeuta principal creado correctamente. Código enviado al correo.'
        : 'Terapeuta principal creado correctamente, pero no se pudo enviar el correo de confirmación.'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'Error creando el terapeuta principal.'
    });
  }
};

const crearUsuarioFuncional = async (req, res) => {
  try {
    const {
      nombre,
      correo,
      password,
      confirmPassword,
      rol,
      activo
    } = req.body;

    const correoNormalizado = normalizeEmail(correo);

    const rolNormalizado = normalizeRole(rol, '');
    const rolAutenticado = normalizeRole(
      req.usuario?.rol,
      ''
    );
    const nombreNormalizado =
      String(nombre || '')
        .trim();

    if (
      rolAutenticado !== ROLES.TECNICO &&
      rolAutenticado !== ROLES.TERAPEUTA
    ) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para crear este usuario.'
      });
    }

    if (
      rolAutenticado === ROLES.TERAPEUTA &&
      !nombreNormalizado
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre es obligatorio.'
      });
    }

    if (!correoNormalizado) {
      return res.status(400).json({
        ok: false,
        message: 'El correo es obligatorio.'
      });
    }

    if (!isValidEmail(correoNormalizado)) {
      return res.status(400).json({
        ok: false,
        message: 'Ingresa un correo válido.'
      });
    }

    const passwordMinLength = getUserPasswordMinLength();

    if (!password || password.length < passwordMinLength) {
      return res.status(400).json({
        ok: false,
        message: `La contraseña debe tener al menos ${passwordMinLength} caracteres.`
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Las contraseñas no coinciden.'
      });
    }

    if (!Object.values(ROLES).includes(rolNormalizado)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para crear este usuario.'
      });
    }

    if (rolNormalizado === ROLES.TECNICO) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para crear usuarios técnicos.'
      });
    }

    if (
      rolAutenticado === ROLES.TERAPEUTA &&
      (
        rolNormalizado !== ROLES.TERAPEUTA &&
        rolNormalizado !== ROLES.AUXILIAR
      )
    ) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para crear este usuario.'
      });
    }

    const usuarioExistente = await sql.query`
      SELECT TOP 1 id
      FROM dbo.tblUsuarios
      WHERE LOWER(LTRIM(RTRIM(ISNULL(correo, '')))) = ${correoNormalizado}
    `;

    if (usuarioExistente.recordset.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'El correo ya existe.'
      });
    }

    const nombreFinal =
      nombreNormalizado ||
      (
        rolNormalizado === ROLES.TERAPEUTA
          ? 'Terapeuta Principal'
          : 'Usuario Auxiliar'
      );

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const insertResult = await sql.query`
      INSERT INTO dbo.tblUsuarios
      (
        nombre,
        correo,
        passwordHash,
        premium,
        activo,
        rol,
        correoVerificado,
        fechaVerificacionCorreo
      )
      OUTPUT INSERTED.id
      VALUES
      (
        ${nombreFinal},
        ${correoNormalizado},
        ${passwordHash},
        ${rolNormalizado === ROLES.TERAPEUTA ? 1 : 0},
        ${activo === false ? 0 : 1},
        ${rolNormalizado},
        0,
        NULL
      );
    `;

    const usuarioId = insertResult.recordset[0].id;
    let correoEnviado = true;

    try {
      await sendConfirmationForUser({
        usuarioId,
        correo: correoNormalizado,
        origen: USER_CODE_ORIGINS.AUTO_EMAIL,
        creadoPorUsuarioId: req.usuario?.id || null
      });
    } catch (error) {
      correoEnviado = false;
      console.error(
        'Error enviando confirmación de correo:',
        error.message
      );
    }

    return res.status(201).json({
      ok: true,
      correoPendienteVerificacion: true,
      correoEnviado,
      message: correoEnviado
        ? 'Usuario creado correctamente. Código enviado al correo.'
        : 'Usuario creado correctamente, pero no se pudo enviar el correo de confirmación.'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'Error creando el usuario.'
    });
  }
};

const listarPendientesVerificacion = async (req, res) => {
  try {
    const rolAutenticado = normalizeRole(
      req.usuario?.rol,
      ''
    );

    if (
      rolAutenticado !== ROLES.TECNICO &&
      rolAutenticado !== ROLES.TERAPEUTA
    ) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para ver usuarios pendientes.'
      });
    }

    const result = await sql.query`
      SELECT
        u.id,
        u.nombre,
        u.correo,
        u.rol,
        u.activo,
        u.fechaCreacion,
        (
          SELECT MAX(c.fechaCreacion)
          FROM dbo.tblUsuarioCodigos c
          WHERE c.usuarioId = u.id
          AND c.proposito = 'EMAIL_CONFIRMATION'
        ) AS ultimoEnvioCodigo
      FROM dbo.tblUsuarios u
      WHERE ISNULL(u.correoVerificado, 0) = 0
      AND (
        ${rolAutenticado} = ${ROLES.TECNICO}
        OR UPPER(LTRIM(RTRIM(ISNULL(u.rol, '')))) IN (${ROLES.TERAPEUTA}, ${ROLES.AUXILIAR})
      )
      ORDER BY u.fechaCreacion DESC, u.id DESC
    `;

    return res.json({
      ok: true,
      usuarios: result.recordset.map((usuario) => ({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: normalizeRole(usuario.rol, ''),
        activo: Boolean(usuario.activo),
        fechaCreacion: usuario.fechaCreacion,
        ultimoEnvioCodigo: usuario.ultimoEnvioCodigo || null
      }))
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible listar usuarios pendientes.'
    });
  }
};

const findPendingUserById = async (usuarioId) => {
  const result = await sql.query`
    SELECT TOP 1
      id,
      nombre,
      correo,
      rol,
      activo,
      correoVerificado
    FROM dbo.tblUsuarios
    WHERE id = ${usuarioId}
  `;

  return result.recordset[0] || null;
};

const reenviarConfirmacionUsuario = async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    const rolAutenticado = normalizeRole(
      req.usuario?.rol,
      ''
    );

    const usuario = await findPendingUserById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    const targetRole = normalizeRole(usuario.rol, '');

    if (
      !canManagePendingUser({
        actorRole: rolAutenticado,
        targetRole
      })
    ) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para administrar este usuario.'
      });
    }

    if (usuario.correoVerificado) {
      return res.status(409).json({
        ok: false,
        message: 'El correo de este usuario ya está verificado.'
      });
    }

    await sendConfirmationForUser({
      usuarioId: usuario.id,
      correo: usuario.correo,
      origen: USER_CODE_ORIGINS.REENVIO,
      creadoPorUsuarioId: req.usuario?.id || null
    });

    return res.json({
      ok: true,
      message: 'Código de confirmación reenviado.'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible reenviar el código.'
    });
  }
};

const corregirCorreoPendiente = async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    const correo = normalizeEmail(req.body?.correo);
    const rolAutenticado = normalizeRole(
      req.usuario?.rol,
      ''
    );

    if (!isValidEmail(correo)) {
      return res.status(400).json({
        ok: false,
        message: 'Ingresa un correo válido.'
      });
    }

    const usuario = await findPendingUserById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    const targetRole = normalizeRole(usuario.rol, '');

    if (
      !canManagePendingUser({
        actorRole: rolAutenticado,
        targetRole
      })
    ) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para administrar este usuario.'
      });
    }

    if (usuario.correoVerificado) {
      return res.status(409).json({
        ok: false,
        message: 'Solo puedes corregir correos pendientes de verificación.'
      });
    }

    const exists = await sql.query`
      SELECT TOP 1 id
      FROM dbo.tblUsuarios
      WHERE LOWER(LTRIM(RTRIM(ISNULL(correo, '')))) = ${correo}
      AND id <> ${usuario.id}
    `;

    if (exists.recordset.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un usuario con ese correo.'
      });
    }

    await sql.query`
      UPDATE dbo.tblUsuarios
      SET correo = ${correo},
          correoVerificado = 0,
          fechaVerificacionCorreo = NULL
      WHERE id = ${usuario.id}
    `;

    await invalidateActiveUserCodes({
      usuarioId: usuario.id,
      proposito: 'EMAIL_CONFIRMATION'
    });

    await sendConfirmationForUser({
      usuarioId: usuario.id,
      correo,
      origen: USER_CODE_ORIGINS.REENVIO,
      creadoPorUsuarioId: req.usuario?.id || null
    });

    return res.json({
      ok: true,
      message: 'Correo actualizado. Código enviado al nuevo correo.'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible corregir el correo.'
    });
  }
};

const generarCodigoConfirmacionManual = async (req, res) => {
  try {
    const usuarioId = Number(req.params.id);
    const rolAutenticado = normalizeRole(
      req.usuario?.rol,
      ''
    );

    const usuario = await findPendingUserById(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    const targetRole = normalizeRole(usuario.rol, '');

    if (
      !canManagePendingUser({
        actorRole: rolAutenticado,
        targetRole
      })
    ) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para administrar este usuario.'
      });
    }

    if (usuario.correoVerificado) {
      return res.status(409).json({
        ok: false,
        message: 'El correo de este usuario ya está verificado.'
      });
    }

    const {
      code,
      expiresInMinutes
    } = await createEmailConfirmationCode({
      usuarioId: usuario.id,
      correo: usuario.correo,
      origen: USER_CODE_ORIGINS.MANUAL_RESPALDO,
      creadoPorUsuarioId: req.usuario?.id || null
    });

    return res.json({
      ok: true,
      codigo: code,
      expiraEnMinutos: expiresInMinutes,
      message: `Código manual generado. Vence en ${expiresInMinutes} minutos.`
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'No fue posible generar el código manual.'
    });
  }
};

module.exports = {
  existsTerapeuta,
  crearPrimerTerapeuta,
  crearUsuarioFuncional,
  listarPendientesVerificacion,
  reenviarConfirmacionUsuario,
  corregirCorreoPendiente,
  generarCodigoConfirmacionManual
};
