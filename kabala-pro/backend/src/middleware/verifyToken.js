const jwt = require('jsonwebtoken');
const {
  DeviceError,
  validateAuthenticatedDevice
} = require('../services/deviceService');
const {
  ROLES,
  normalizeRole
} = require('../utils/roles');

const verifyToken = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

      return res.status(401).json({
        ok: false,
        code: 'TOKEN_INVALID',
        message: 'Token requerido'
      });

    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const role = normalizeRole(decoded.rol, '');

    if (
      role === ROLES.TERAPEUTA ||
      role === ROLES.AUXILIAR
    ) {
      if (!decoded.deviceId) {
        return res.status(401).json({
          ok: false,
          code: 'DEVICE_SESSION_REQUIRED',
          message: 'Debes iniciar sesion nuevamente en este dispositivo.'
        });
      }

      const headerDeviceId =
        req.get('X-Kabala-Device-Id');
      const headerDeviceSecret =
        req.get('X-Kabala-Device-Secret');

      if (!headerDeviceId || !headerDeviceSecret) {
        return res.status(400).json({
          ok: false,
          code: 'DEVICE_IDENTITY_REQUIRED',
          message: 'La identidad del dispositivo es obligatoria.'
        });
      }

      if (
        String(headerDeviceId).trim().toLowerCase() !==
        String(decoded.deviceId).trim().toLowerCase()
      ) {
        return res.status(400).json({
          ok: false,
          code: 'DEVICE_IDENTITY_INVALID',
          message: 'La identidad del dispositivo no coincide con la sesion.'
        });
      }

      await validateAuthenticatedDevice({
        deviceId: headerDeviceId,
        deviceSecret: headerDeviceSecret,
        usuarioId: decoded.id,
        usuarioCorreo: decoded.correo
      });
    }

    req.usuario = decoded;

    next();

  } catch (error) {
    if (error instanceof DeviceError) {
      return res.status(error.status).json({
        ok: false,
        code: error.code,
        message: error.message
      });
    }

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return res.status(401).json({
        ok: false,
        code: 'TOKEN_INVALID',
        message: 'Token inválido.'
      });
    }

    console.error('Error interno validando la sesión:', error);

    return res.status(500).json({
      ok: false,
      code: 'SERVER_UNAVAILABLE',
      message: 'Error de servidor.'
    });

  }

};

module.exports = verifyToken;
