const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { sql } = require('../config/db');

const USER_CODE_PURPOSES = {
  EMAIL_CONFIRMATION: 'EMAIL_CONFIRMATION'
};

const USER_CODE_ORIGINS = {
  AUTO_EMAIL: 'AUTO_EMAIL',
  REENVIO: 'REENVIO',
  MANUAL_RESPALDO: 'MANUAL_RESPALDO'
};

const getEmailConfirmationTtlMinutes = () =>
  Number(process.env.EMAIL_CONFIRMATION_CODE_TTL_MINUTES || 30);

const getMaxEmailConfirmationAttempts = () =>
  Number(process.env.EMAIL_CONFIRMATION_MAX_ATTEMPTS || 5);

const normalizeEmail = (correo) =>
  String(correo || '')
    .trim()
    .toLowerCase();

const generateNumericCode = () =>
  String(crypto.randomInt(0, 1000000)).padStart(6, '0');

const invalidateActiveUserCodes = async ({
  usuarioId,
  proposito
}) => {
  await sql.query`
    UPDATE dbo.tblUsuarioCodigos
    SET activo = 0
    WHERE usuarioId = ${usuarioId}
    AND proposito = ${proposito}
    AND activo = 1
  `;
};

const createUserCode = async ({
  usuarioId,
  correo,
  proposito,
  origen,
  creadoPorUsuarioId = null
}) => {
  const normalizedEmail = normalizeEmail(correo);
  const ttlMinutes = getEmailConfirmationTtlMinutes();
  const code = generateNumericCode();
  const codeHash = await bcrypt.hash(code, 12);

  await invalidateActiveUserCodes({
    usuarioId,
    proposito
  });

  await sql.query`
    INSERT INTO dbo.tblUsuarioCodigos
    (
      usuarioId,
      correo,
      proposito,
      codigoHash,
      fechaCreacion,
      fechaExpiracion,
      fechaUso,
      creadoPorUsuarioId,
      origen,
      intentos,
      activo
    )
    VALUES
    (
      ${usuarioId},
      ${normalizedEmail},
      ${proposito},
      ${codeHash},
      GETDATE(),
      DATEADD(MINUTE, ${ttlMinutes}, GETDATE()),
      NULL,
      ${creadoPorUsuarioId},
      ${origen},
      0,
      1
    )
  `;

  return {
    code,
    expiresInMinutes: ttlMinutes
  };
};

const createEmailConfirmationCode = ({
  usuarioId,
  correo,
  origen = USER_CODE_ORIGINS.AUTO_EMAIL,
  creadoPorUsuarioId = null
}) =>
  createUserCode({
    usuarioId,
    correo,
    proposito: USER_CODE_PURPOSES.EMAIL_CONFIRMATION,
    origen,
    creadoPorUsuarioId
  });

const findLatestActiveEmailConfirmationCode = async ({
  usuarioId,
  correo
}) => {
  const normalizedEmail = normalizeEmail(correo);

  const result = await sql.query`
    SELECT TOP 1
      id,
      usuarioId,
      correo,
      proposito,
      codigoHash,
      fechaExpiracion,
      fechaUso,
      intentos,
      activo,
      CASE
        WHEN fechaExpiracion <= GETDATE() THEN 1
        ELSE 0
      END AS expirado
    FROM dbo.tblUsuarioCodigos
    WHERE usuarioId = ${usuarioId}
    AND LOWER(LTRIM(RTRIM(correo))) = ${normalizedEmail}
    AND proposito = ${USER_CODE_PURPOSES.EMAIL_CONFIRMATION}
    AND activo = 1
    ORDER BY id DESC
  `;

  return result.recordset[0] || null;
};

const deactivateCode = async (codeId) => {
  await sql.query`
    UPDATE dbo.tblUsuarioCodigos
    SET activo = 0
    WHERE id = ${codeId}
  `;
};

const markCodeUsed = async (codeId) => {
  await sql.query`
    UPDATE dbo.tblUsuarioCodigos
    SET fechaUso = GETDATE(),
        activo = 0
    WHERE id = ${codeId}
  `;
};

const incrementFailedAttempt = async ({
  codeId,
  shouldInvalidate
}) => {
  await sql.query`
    UPDATE dbo.tblUsuarioCodigos
    SET intentos = intentos + 1,
        activo = CASE WHEN ${shouldInvalidate ? 1 : 0} = 1 THEN 0 ELSE activo END
    WHERE id = ${codeId}
  `;
};

module.exports = {
  USER_CODE_ORIGINS,
  USER_CODE_PURPOSES,
  createEmailConfirmationCode,
  deactivateCode,
  findLatestActiveEmailConfirmationCode,
  getEmailConfirmationTtlMinutes,
  getMaxEmailConfirmationAttempts,
  incrementFailedAttempt,
  invalidateActiveUserCodes,
  markCodeUsed,
  normalizeEmail
};
