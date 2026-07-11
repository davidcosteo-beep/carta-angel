const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');
const sql = require('mssql');

dotenv.config({
  path: path.resolve(__dirname, '..', '.env')
});

const args = new Set(process.argv.slice(2));
const masterEmail =
  process.env.KABALA_MASTER_EMAIL ||
  'maestro@kabala.local';
const databaseName =
  process.env.DB_DATABASE ||
  'kabalaPro';

const assertSafeDatabaseName = (name) => {
  if (!/^[A-Za-z0-9_-]+$/.test(name)) {
    throw new Error(
      'DB_DATABASE solo puede contener letras, numeros, guion y guion bajo.'
    );
  }
};

const bracketName = (name) =>
  `[${name.replace(/]/g, ']]')}]`;

const getBaseConfig = (database) => ({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database,
  port: Number(process.env.DB_PORT || 1433),
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
});

const requiredEnv = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_SERVER'
];

const ensureRequiredEnv = () => {
  const missing = requiredEnv.filter(
    (key) => !process.env[key]
  );

  if (missing.length) {
    throw new Error(
      `Faltan variables en backend/.env: ${missing.join(', ')}`
    );
  }
};

const promptHidden = (question) =>
  new Promise((resolve) => {
    const input = process.stdin;
    const output = process.stdout;
    let value = '';

    readline.emitKeypressEvents(input);

    if (input.isTTY) {
      input.setRawMode(true);
    }

    output.write(question);

    const onKeypress = (char, key) => {
      if (key?.name === 'return') {
        output.write('\n');
        cleanup();
        resolve(value);
        return;
      }

      if (key?.name === 'backspace') {
        value = value.slice(0, -1);
        return;
      }

      if (key?.ctrl && key?.name === 'c') {
        cleanup();
        process.exit(130);
      }

      if (char) {
        value += char;
      }
    };

    const cleanup = () => {
      input.off('keypress', onKeypress);

      if (input.isTTY) {
        input.setRawMode(false);
      }
    };

    input.on('keypress', onKeypress);
  });

const getMasterPasswordHash = async () => {
  if (process.env.KABALA_MASTER_PASSWORD_HASH) {
    return process.env.KABALA_MASTER_PASSWORD_HASH;
  }

  if (process.env.KABALA_MASTER_PASSWORD) {
    return bcrypt.hash(
      process.env.KABALA_MASTER_PASSWORD,
      12
    );
  }

  if (
    args.has('--prompt-master-password') &&
    process.stdin.isTTY
  ) {
    const password = await promptHidden(
      'Contrasena inicial para maestro@kabala.local: '
    );

    if (!password || password.length < 8) {
      throw new Error(
        'La contrasena inicial debe tener al menos 8 caracteres.'
      );
    }

    return bcrypt.hash(password, 12);
  }

  return '';
};

const runBatches = async (pool, batches) => {
  for (const batch of batches) {
    await pool.request().batch(batch);
  }
};

const createDatabaseIfMissing = async () => {
  const masterPool = await sql.connect(
    getBaseConfig('master')
  );

  try {
    const dbName = bracketName(databaseName);

    await masterPool.request()
      .input('databaseName', sql.NVarChar, databaseName)
      .query(`
        IF DB_ID(@databaseName) IS NULL
        BEGIN
          EXEC('CREATE DATABASE ${dbName}');
        END
      `);
  } finally {
    await masterPool.close();
  }
};

const ensureSchema = async () => {
  const pool = await sql.connect(
    getBaseConfig(databaseName)
  );

  try {
    await runBatches(pool, [
      `
      IF OBJECT_ID('dbo.tblUsuarios', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.tblUsuarios (
          id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          nombre VARCHAR(150) NULL,
          correo VARCHAR(150) NULL,
          passwordHash VARCHAR(255) NULL,
          premium BIT NULL CONSTRAINT DF_tblUsuarios_premium DEFAULT ((0)),
          activo BIT NULL CONSTRAINT DF_tblUsuarios_activo DEFAULT ((1)),
          fechaCreacion DATETIME NULL CONSTRAINT DF_tblUsuarios_fechaCreacion DEFAULT (GETDATE()),
          rol VARCHAR(30) NOT NULL CONSTRAINT DF_tblUsuarios_rol DEFAULT ('TERAPEUTA'),
          correoVerificado BIT NOT NULL CONSTRAINT DF_tblUsuarios_correoVerificado DEFAULT ((0)),
          fechaVerificacionCorreo DATETIME NULL
        );
      END
      `,
      `
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
      `,
      `
      IF COL_LENGTH('dbo.tblUsuarios', 'rol') IS NULL
      BEGIN
        ALTER TABLE dbo.tblUsuarios
        ADD rol VARCHAR(30) NOT NULL
          CONSTRAINT DF_tblUsuarios_rol DEFAULT ('TERAPEUTA');
      END
      `,
      `
      UPDATE dbo.tblUsuarios
      SET rol = 'TERAPEUTA'
      WHERE UPPER(LTRIM(RTRIM(ISNULL(rol, '')))) IN ('ANGEOLOGO', 'MAESTRO')
      OR UPPER(LTRIM(RTRIM(ISNULL(rol, '')))) NOT IN ('TECNICO', 'TERAPEUTA', 'AUXILIAR');
      `,
      `
      IF OBJECT_ID('dbo.CK_tblUsuarios_rol_valido', 'C') IS NULL
      BEGIN
        ALTER TABLE dbo.tblUsuarios
        ADD CONSTRAINT CK_tblUsuarios_rol_valido
        CHECK (rol IN ('TECNICO', 'TERAPEUTA', 'AUXILIAR'));
      END
      `,
      `
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
      `,
      `
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
      `,
      `
      IF OBJECT_ID('dbo.Pacientes', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.Pacientes (
          IdPaciente INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          IdUsuario INT NOT NULL,
          Nombres VARCHAR(150) NOT NULL,
          Apellidos VARCHAR(150) NULL,
          Telefono VARCHAR(50) NULL,
          FechaNacimiento DATE NULL,
          Observaciones VARCHAR(MAX) NULL,
          FechaCreacion DATETIME NULL CONSTRAINT DF_Pacientes_FechaCreacion DEFAULT (GETDATE()),
          HoraNacimiento VARCHAR(10) NULL,
          activo BIT NOT NULL CONSTRAINT DF_Pacientes_activo DEFAULT ((1)),
          fecha_archivado DATETIME NULL,
          fecha_creacion DATETIME NOT NULL CONSTRAINT DF_Pacientes_fecha_creacion DEFAULT (GETDATE()),
          fecha_modificacion DATETIME NULL
        );
      END
      `,
      `
      IF OBJECT_ID('dbo.Citas', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.Citas (
          IdCita INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          IdPaciente INT NOT NULL,
          Fecha DATE NOT NULL,
          Hora TIME NOT NULL,
          Motivo NVARCHAR(250) NULL,
          Estado VARCHAR(20) NOT NULL CONSTRAINT DF_Citas_Estado DEFAULT ('PROGRAMADA'),
          FechaCreacion DATETIME NOT NULL CONSTRAINT DF_Citas_FechaCreacion DEFAULT (GETDATE()),
          FechaModificacion DATETIME NULL,
          Observaciones NVARCHAR(MAX) NULL,
          FechaSeguimiento DATE NULL
        );
      END
      `,
      `
      IF OBJECT_ID('dbo.Seguimientos', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.Seguimientos (
          IdSeguimiento INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          IdCita INT NOT NULL,
          Fecha DATETIME NOT NULL CONSTRAINT DF_Seguimientos_Fecha DEFAULT (GETDATE()),
          Nota NVARCHAR(MAX) NOT NULL,
          fechaCreacion DATETIME NULL CONSTRAINT DF_Seguimientos_fechaCreacion DEFAULT (GETDATE())
        );
      END
      `,
      `
      IF OBJECT_ID('dbo.bitacora', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.bitacora (
          id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
          fecha DATETIME NOT NULL CONSTRAINT DF_bitacora_fecha DEFAULT (GETDATE()),
          id_usuario INT NULL,
          modulo VARCHAR(50) NOT NULL,
          accion VARCHAR(50) NOT NULL,
          id_registro INT NULL,
          detalle NVARCHAR(500) NULL
        );
      END
      `
    ]);
  } finally {
    await pool.close();
  }
};

const ensureMasterUser = async (passwordHash) => {
  if (!passwordHash) {
    console.log(
      'Master user omitido: no se recibio KABALA_MASTER_PASSWORD_HASH, KABALA_MASTER_PASSWORD ni --prompt-master-password.'
    );
    return;
  }

  const pool = await sql.connect(
    getBaseConfig(databaseName)
  );

  try {
    await pool.request()
      .input('correo', sql.VarChar(150), masterEmail)
      .input('passwordHash', sql.VarChar(255), passwordHash)
      .query(`
        IF NOT EXISTS (
          SELECT 1
          FROM dbo.tblUsuarios
          WHERE correo = @correo
        )
        BEGIN
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
            'Terapeuta Principal',
            @correo,
            @passwordHash,
            1,
            1,
            'TERAPEUTA',
            1,
            GETDATE()
          );
        END
      `);
  } finally {
    await pool.close();
  }
};

const main = async () => {
  ensureRequiredEnv();
  assertSafeDatabaseName(databaseName);

  const passwordHash = await getMasterPasswordHash();

  await createDatabaseIfMissing();
  await ensureSchema();
  await ensureMasterUser(passwordHash);

  console.log(
    `Inicializacion completada para base de datos ${databaseName}.`
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
