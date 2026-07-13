const crypto = require('crypto');

const { sql } = require('../config/db');

const DEFAULT_MAX_DEVICES = 3;
const DEVICE_LOCK_RESOURCE = 'KabalaPro.DeviceCapacity';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let configuredMaxDevices;

class DeviceError extends Error {
  constructor(code, status, message) {
    super(message);
    this.name = 'DeviceError';
    this.code = code;
    this.status = status;
  }
}

const getMaxDevices = () => {
  if (configuredMaxDevices !== undefined) {
    return configuredMaxDevices;
  }

  const rawValue = process.env.KABALA_MAX_DEVICES;
  const parsedValue = Number(rawValue);

  if (
    rawValue === undefined ||
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    console.warn(
      `KABALA_MAX_DEVICES ausente o invalido. Se utilizara ${DEFAULT_MAX_DEVICES}.`
    );

    configuredMaxDevices = DEFAULT_MAX_DEVICES;
    return configuredMaxDevices;
  }

  configuredMaxDevices = parsedValue;
  return configuredMaxDevices;
};

const normalizeDeviceId = (deviceId) => {
  const normalized = String(deviceId || '').trim().toLowerCase();

  if (!UUID_PATTERN.test(normalized)) {
    throw new DeviceError(
      'DEVICE_IDENTITY_INVALID',
      400,
      'La identidad del dispositivo es invalida.'
    );
  }

  return normalized;
};

const hashDeviceSecret = (deviceSecret) => {
  if (
    typeof deviceSecret !== 'string' ||
    deviceSecret.length === 0
  ) {
    throw new DeviceError(
      'DEVICE_IDENTITY_REQUIRED',
      400,
      'La identidad del dispositivo es obligatoria.'
    );
  }

  return crypto
    .createHash('sha256')
    .update(deviceSecret, 'utf8')
    .digest('hex');
};

const normalizeEsPwa = (value, { allowUndefined = false } = {}) => {
  if (value === undefined && allowUndefined) {
    return undefined;
  }

  if (value === undefined) {
    return false;
  }

  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }

  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }

  throw new DeviceError(
    'DEVICE_IDENTITY_INVALID',
    400,
    'La información del dispositivo no es válida.'
  );
};

const secretMatches = (expectedHash, actualHash) => {
  const expected = Buffer.from(expectedHash || '', 'hex');
  const actual = Buffer.from(actualHash || '', 'hex');

  return expected.length === actual.length &&
    expected.length > 0 &&
    crypto.timingSafeEqual(expected, actual);
};

const throwSecretInvalid = () => {
  throw new DeviceError(
    'DEVICE_SECRET_INVALID',
    403,
    'El secreto del dispositivo es invalido.'
  );
};

const throwRevoked = () => {
  throw new DeviceError(
    'DEVICE_REVOKED',
    403,
    'El dispositivo fue revocado.'
  );
};

const acquireCapacityLock = async (transaction) => {
  const result = await new sql.Request(transaction)
    .input('resource', sql.NVarChar(255), DEVICE_LOCK_RESOURCE)
    .query(`
      DECLARE @lockResult INT;
      EXEC @lockResult = sys.sp_getapplock
        @Resource = @resource,
        @LockMode = 'Exclusive',
        @LockOwner = 'Transaction',
        @LockTimeout = 10000;
      SELECT @lockResult AS lockResult;
    `);

  if (result.recordset[0].lockResult < 0) {
    throw new Error(
      'No fue posible adquirir el bloqueo de capacidad de dispositivos.'
    );
  }
};

const updateLastActivity = async ({
  request,
  deviceId,
  usuarioId,
  usuarioCorreo,
  nombre,
  plataforma,
  navegador,
  esPwa,
  esPwaProvided = false,
  updateMetadata = false
}) => {
  await request
    .input('activityDeviceId', sql.UniqueIdentifier, deviceId)
    .input('usuarioId', sql.Int, usuarioId || null)
    .input('usuarioCorreo', sql.NVarChar(255), usuarioCorreo || null)
    .input('nombre', sql.NVarChar(150), nombre || null)
    .input('plataforma', sql.NVarChar(100), plataforma || null)
    .input('navegador', sql.NVarChar(100), navegador || null)
    .input('esPwa', sql.Bit, esPwa ?? false)
    .input('esPwaProvided', sql.Bit, esPwaProvided)
    .input('updateMetadata', sql.Bit, updateMetadata)
    .query(`
      UPDATE dbo.tblDispositivos
      SET fechaUltimoAcceso = CASE
            WHEN fechaUltimoAcceso IS NULL OR
              fechaUltimoAcceso <= DATEADD(MINUTE, -10, GETDATE())
            THEN GETDATE()
            ELSE fechaUltimoAcceso
          END,
          ultimoUsuarioId = @usuarioId,
          ultimoUsuarioCorreo = @usuarioCorreo,
          nombre = CASE WHEN @updateMetadata = 1
            THEN COALESCE(@nombre, nombre) ELSE nombre END,
          plataforma = CASE WHEN @updateMetadata = 1
            THEN COALESCE(@plataforma, plataforma) ELSE plataforma END,
          navegador = CASE WHEN @updateMetadata = 1
            THEN COALESCE(@navegador, navegador) ELSE navegador END,
          esPwa = CASE WHEN @updateMetadata = 1 AND @esPwaProvided = 1
            THEN @esPwa ELSE esPwa END
      WHERE deviceId = @activityDeviceId;
    `);
};

const registerOrValidateDevice = async ({
  deviceId,
  deviceSecret,
  nombre,
  plataforma,
  navegador,
  esPwa,
  usuarioId,
  usuarioCorreo
}) => {
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const secretHash = hashDeviceSecret(deviceSecret);
  const normalizedEsPwa = normalizeEsPwa(
    esPwa,
    { allowUndefined: true }
  );
  const transaction = new sql.Transaction();

  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

  try {
    await acquireCapacityLock(transaction);

    const request = new sql.Request(transaction);
    const existingResult = await request
      .input('deviceId', sql.UniqueIdentifier, normalizedDeviceId)
      .query(`
        SELECT TOP 1 id, secretHash, activo
        FROM dbo.tblDispositivos WITH (UPDLOCK, HOLDLOCK)
        WHERE deviceId = @deviceId;
      `);
    const existing = existingResult.recordset[0];

    if (existing) {
      if (!existing.activo) {
        throwRevoked();
      }

      if (!secretMatches(existing.secretHash, secretHash)) {
        throwSecretInvalid();
      }

      await updateLastActivity({
        request: new sql.Request(transaction),
        deviceId: normalizedDeviceId,
        usuarioId,
        usuarioCorreo,
        nombre,
        plataforma,
        navegador,
        esPwa: normalizedEsPwa,
        esPwaProvided: normalizedEsPwa !== undefined,
        updateMetadata: true
      });
    } else {
      const countResult = await new sql.Request(transaction)
        .query(`
          SELECT COUNT(*) AS activeDevices
          FROM dbo.tblDispositivos WITH (UPDLOCK, HOLDLOCK)
          WHERE activo = 1;
        `);

      if (countResult.recordset[0].activeDevices >= getMaxDevices()) {
        throw new DeviceError(
          'DEVICE_LIMIT_REACHED',
          409,
          'No hay cupos disponibles para registrar otro dispositivo.'
        );
      }

      await new sql.Request(transaction)
        .input('newDeviceId', sql.UniqueIdentifier, normalizedDeviceId)
        .input('secretHash', sql.VarChar(64), secretHash)
        .input('nombre', sql.NVarChar(150), nombre || null)
        .input('plataforma', sql.NVarChar(100), plataforma || null)
        .input('navegador', sql.NVarChar(100), navegador || null)
        .input('esPwa', sql.Bit, normalizedEsPwa ?? false)
        .input('usuarioId', sql.Int, usuarioId || null)
        .input('usuarioCorreo', sql.NVarChar(255), usuarioCorreo || null)
        .query(`
          INSERT INTO dbo.tblDispositivos
          (
            deviceId,
            secretHash,
            nombre,
            plataforma,
            navegador,
            esPwa,
            fechaUltimoAcceso,
            ultimoUsuarioId,
            ultimoUsuarioCorreo
          )
          VALUES
          (
            @newDeviceId,
            @secretHash,
            @nombre,
            @plataforma,
            @navegador,
            @esPwa,
            GETDATE(),
            @usuarioId,
            @usuarioCorreo
          );
        `);
    }

    await transaction.commit();

    return normalizedDeviceId;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // La transaccion puede haber sido anulada por SQL Server.
    }

    throw error;
  }
};

const validateAuthenticatedDevice = async ({
  deviceId,
  deviceSecret,
  usuarioId,
  usuarioCorreo
}) => {
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const secretHash = hashDeviceSecret(deviceSecret);
  const result = await sql.query`
    SELECT TOP 1 secretHash, activo
    FROM dbo.tblDispositivos
    WHERE deviceId = ${normalizedDeviceId};
  `;
  const device = result.recordset[0];

  if (!device) {
    throw new DeviceError(
      'DEVICE_SESSION_REQUIRED',
      401,
      'Debes iniciar sesion nuevamente en este dispositivo.'
    );
  }

  if (!device.activo) {
    throwRevoked();
  }

  if (!secretMatches(device.secretHash, secretHash)) {
    throwSecretInvalid();
  }

  await updateLastActivity({
    request: new sql.Request(),
    deviceId: normalizedDeviceId,
    usuarioId,
    usuarioCorreo
  });
};

const listDevices = async ({
  includeTechnicalAudit = false
} = {}) => {
  const devicesResult = await sql.query`
    SELECT
      id,
      CONVERT(VARCHAR(36), deviceId) AS deviceId,
      nombre,
      plataforma,
      navegador,
      esPwa,
      activo,
      fechaRegistro,
      fechaUltimoAcceso,
      ultimoUsuarioId,
      ultimoUsuarioCorreo,
      fechaRevocacion,
      revocadoPorUsuarioId,
      fechaReactivacion,
      reactivadoPorUsuarioId
    FROM dbo.tblDispositivos
    ORDER BY activo DESC, fechaUltimoAcceso DESC, id DESC;
  `;
  const maxDevices = getMaxDevices();
  const activeDevices = devicesResult.recordset.filter(
    (device) => Boolean(device.activo)
  ).length;

  return {
    maxDevices,
    activeDevices,
    availableSlots: Math.max(maxDevices - activeDevices, 0),
    devices: devicesResult.recordset.map((device) => {
      const normalized = {
        ...device,
        esPwa: Boolean(device.esPwa),
        activo: Boolean(device.activo)
      };

      if (includeTechnicalAudit) {
        return normalized;
      }

      return {
        id: normalized.id,
        deviceId: normalized.deviceId,
        nombre: normalized.nombre,
        plataforma: normalized.plataforma,
        navegador: normalized.navegador,
        esPwa: normalized.esPwa,
        activo: normalized.activo,
        fechaRegistro: normalized.fechaRegistro,
        fechaUltimoAcceso: normalized.fechaUltimoAcceso,
        ultimoUsuarioCorreo: normalized.ultimoUsuarioCorreo,
      };
    })
  };
};

const revokeDevice = async ({ deviceRecordId, actorUserId }) => {
  const updateResult = await sql.query`
    UPDATE dbo.tblDispositivos
    SET activo = 0,
        fechaRevocacion = GETDATE(),
        revocadoPorUsuarioId = ${actorUserId || null}
    OUTPUT CONVERT(VARCHAR(36), INSERTED.deviceId) AS deviceId
    WHERE id = ${deviceRecordId}
    AND activo = 1;
  `;

  if (updateResult.recordset.length > 0) {
    return updateResult.recordset[0].deviceId;
  }

  const existingResult = await sql.query`
    SELECT TOP 1 CONVERT(VARCHAR(36), deviceId) AS deviceId
    FROM dbo.tblDispositivos
    WHERE id = ${deviceRecordId};
  `;

  if (existingResult.recordset.length === 0) {
    throw new DeviceError(
      'DEVICE_NOT_FOUND',
      404,
      'Dispositivo no encontrado.'
    );
  }

  return existingResult.recordset[0].deviceId;
};

const reactivateDevice = async ({ deviceRecordId, actorUserId }) => {
  const transaction = new sql.Transaction();

  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

  try {
    await acquireCapacityLock(transaction);

    const deviceResult = await new sql.Request(transaction)
      .input('deviceRecordId', sql.Int, deviceRecordId)
      .query(`
        SELECT TOP 1 id, activo
        FROM dbo.tblDispositivos WITH (UPDLOCK, HOLDLOCK)
        WHERE id = @deviceRecordId;
      `);
    const device = deviceResult.recordset[0];

    if (!device) {
      throw new DeviceError(
        'DEVICE_NOT_FOUND',
        404,
        'Dispositivo no encontrado.'
      );
    }

    if (!device.activo) {
      const countResult = await new sql.Request(transaction)
        .query(`
          SELECT COUNT(*) AS activeDevices
          FROM dbo.tblDispositivos WITH (UPDLOCK, HOLDLOCK)
          WHERE activo = 1;
        `);

      if (countResult.recordset[0].activeDevices >= getMaxDevices()) {
        throw new DeviceError(
          'DEVICE_LIMIT_REACHED',
          409,
          'No hay cupos disponibles para reactivar el dispositivo.'
        );
      }

      await new sql.Request(transaction)
        .input('reactivateId', sql.Int, deviceRecordId)
        .input('actorUserId', sql.Int, actorUserId || null)
        .query(`
          UPDATE dbo.tblDispositivos
          SET activo = 1,
              fechaReactivacion = GETDATE(),
              reactivadoPorUsuarioId = @actorUserId
          WHERE id = @reactivateId;
        `);
    }

    await transaction.commit();
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // La transaccion puede haber sido anulada por SQL Server.
    }

    throw error;
  }
};

module.exports = {
  DeviceError,
  getMaxDevices,
  listDevices,
  normalizeEsPwa,
  reactivateDevice,
  registerOrValidateDevice,
  revokeDevice,
  validateAuthenticatedDevice
};
