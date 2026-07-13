const bcrypt = require('bcrypt');

const { sql } = require('../config/db');
const {
  DeviceError,
  listDevices,
  reactivateDevice,
  revokeDevice
} = require('../services/deviceService');
const {
  ROLES,
  normalizeRole
} = require('../utils/roles');

const sendError = (res, error) => {
  if (error instanceof DeviceError) {
    return res.status(error.status).json({
      ok: false,
      code: error.code,
      message: error.message
    });
  }

  console.error(error);

  return res.status(500).json({
    ok: false,
    code: 'SERVER_UNAVAILABLE',
    message: 'Error de servidor.'
  });
};

const parseDeviceRecordId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new DeviceError(
      'DEVICE_IDENTITY_INVALID',
      400,
      'El identificador del dispositivo es invalido.'
    );
  }

  return id;
};

const verifyTherapistPassword = async (req) => {
  const password = req.body?.password;

  if (typeof password !== 'string' || password.length === 0) {
    throw new DeviceError(
      'PASSWORD_REQUIRED',
      400,
      'Debe confirmar su contraseña.'
    );
  }

  const result = await sql.query`
    SELECT TOP 1 passwordHash, activo
    FROM dbo.tblUsuarios
    WHERE id = ${req.usuario.id};
  `;
  const user = result.recordset[0];

  if (!user || !user.activo) {
    throw new DeviceError(
      'DEVICE_SESSION_REQUIRED',
      401,
      'Debe iniciar sesión nuevamente.'
    );
  }

  if (!await bcrypt.compare(password, user.passwordHash)) {
    throw new DeviceError(
      'PASSWORD_INVALID',
      403,
      'La contraseña es incorrecta.'
    );
  }
};

const listar = async (req, res) => {
  try {
    const role = normalizeRole(req.usuario?.rol, '');
    const data = await listDevices({
      includeTechnicalAudit: role === ROLES.TECNICO
    });

    return res.json({
      ok: true,
      ...data
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const revocar = async (req, res) => {
  try {
    const role = normalizeRole(req.usuario?.rol, '');

    if (role === ROLES.TERAPEUTA) {
      await verifyTherapistPassword(req);
    }

    const revokedDeviceId = await revokeDevice({
      deviceRecordId: parseDeviceRecordId(req.params.id),
      actorUserId: req.usuario?.id
    });
    const currentDeviceRevoked = Boolean(
      req.usuario?.deviceId &&
      String(req.usuario.deviceId).toLowerCase() ===
        String(revokedDeviceId).toLowerCase()
    );

    return res.json({
      ok: true,
      message: 'Dispositivo revocado correctamente.',
      currentDeviceRevoked
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const reactivar = async (req, res) => {
  try {
    await reactivateDevice({
      deviceRecordId: parseDeviceRecordId(req.params.id),
      actorUserId: req.usuario?.id
    });

    return res.json({
      ok: true,
      message: 'Dispositivo reactivado correctamente.'
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  listar,
  reactivar,
  revocar
};
