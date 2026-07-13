const bcrypt = require('bcrypt');

const { sql } = require('../config/db');
const {
  TECH_EMAIL,
  TECH_PASSWORD
} = require('../config/technicalUser');
const { ROLES } = require('../utils/roles');
const { DEVICE_SCHEMA_SQL } = require('./deviceSchema');

const ensureUserSchema = async () => {
  await sql.query`
    DECLARE @AgregoCorreoVerificado BIT = 0;

    IF COL_LENGTH('dbo.tblUsuarios', 'correoVerificado') IS NULL
    BEGIN
      ALTER TABLE dbo.tblUsuarios
      ADD correoVerificado BIT NOT NULL
        CONSTRAINT DF_tblUsuarios_correoVerificado DEFAULT ((0));

      SET @AgregoCorreoVerificado = 1;
    END

    IF COL_LENGTH('dbo.tblUsuarios', 'fechaVerificacionCorreo') IS NULL
    BEGIN
      ALTER TABLE dbo.tblUsuarios
      ADD fechaVerificacionCorreo DATETIME NULL;
    END

    IF @AgregoCorreoVerificado = 1
    BEGIN
      UPDATE dbo.tblUsuarios
      SET correoVerificado = 1,
          fechaVerificacionCorreo = ISNULL(fechaVerificacionCorreo, GETDATE())
      WHERE correoVerificado = 0;
    END

    IF OBJECT_ID('dbo.tblUsuarioCodigos', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.tblUsuarioCodigos (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        usuarioId INT NOT NULL,
        correo NVARCHAR(255) NOT NULL,
        proposito NVARCHAR(50) NOT NULL,
        codigoHash NVARCHAR(255) NOT NULL,
        fechaCreacion DATETIME NOT NULL CONSTRAINT DF_tblUsuarioCodigos_fechaCreacion DEFAULT (GETDATE()),
        fechaExpiracion DATETIME NOT NULL,
        fechaUso DATETIME NULL,
        creadoPorUsuarioId INT NULL,
        origen NVARCHAR(50) NOT NULL,
        intentos INT NOT NULL CONSTRAINT DF_tblUsuarioCodigos_intentos DEFAULT ((0)),
        activo BIT NOT NULL CONSTRAINT DF_tblUsuarioCodigos_activo DEFAULT ((1))
      );
    END

    IF NOT EXISTS (
      SELECT 1
      FROM sys.indexes
      WHERE name = 'IX_tblUsuarioCodigos_usuario_proposito_activo'
      AND object_id = OBJECT_ID('dbo.tblUsuarioCodigos')
    )
    BEGIN
      CREATE INDEX IX_tblUsuarioCodigos_usuario_proposito_activo
      ON dbo.tblUsuarioCodigos(usuarioId, proposito, activo);
    END

  `;

  await sql.query(DEVICE_SCHEMA_SQL);
};

const normalizeLegacyRoles = async () => {
  await sql.query`
    UPDATE dbo.tblUsuarios
    SET rol = 'TERAPEUTA'
    WHERE UPPER(LTRIM(RTRIM(ISNULL(rol, '')))) IN ('ANGEOLOGO', 'MAESTRO');
  `;

  await sql.query`
    UPDATE dbo.tblUsuarios
    SET rol = 'TERAPEUTA'
    WHERE UPPER(LTRIM(RTRIM(ISNULL(rol, '')))) NOT IN ('TECNICO', 'TERAPEUTA', 'AUXILIAR');
  `;
};

const ensureRoleConstraint = async () => {
  await sql.query`
    IF OBJECT_ID('dbo.CK_tblUsuarios_rol_valido', 'C') IS NULL
    BEGIN
      ALTER TABLE dbo.tblUsuarios
      ADD CONSTRAINT CK_tblUsuarios_rol_valido
      CHECK (rol IN ('TECNICO', 'TERAPEUTA', 'AUXILIAR'));
    END
  `;
};

const ensureTechnicalUser = async () => {
  await ensureUserSchema();
  await normalizeLegacyRoles();
  await ensureRoleConstraint();

  const existing = await sql.query`
    SELECT TOP 1 id
    FROM dbo.tblUsuarios
    WHERE UPPER(LTRIM(RTRIM(ISNULL(rol, '')))) = ${ROLES.TECNICO}
    OR LOWER(LTRIM(RTRIM(ISNULL(correo, '')))) = ${TECH_EMAIL.toLowerCase()}
  `;

  if (existing.recordset.length === 0) {
    const passwordHash = await bcrypt.hash(
      TECH_PASSWORD,
      12
    );

    await sql.query`
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
      VALUES
      (
        'Usuario Tecnico',
        ${TECH_EMAIL},
        ${passwordHash},
        0,
        1,
        ${ROLES.TECNICO},
        1,
        GETDATE()
      );
    `;
  }

  console.log('Usuario tecnico inicial verificado.');
};

module.exports = {
  ensureTechnicalUser,
  normalizeLegacyRoles,
  ensureUserSchema,
  ensureRoleConstraint
};
