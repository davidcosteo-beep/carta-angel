:setvar DatabaseName "kabalaPro"
:setvar MasterEmail "maestro@kabala.local"
:setvar MasterPasswordHash ""

IF DB_ID(N'$(DatabaseName)') IS NULL
BEGIN
  DECLARE @CreateDatabaseSql nvarchar(max);
  SET @CreateDatabaseSql =
    N'CREATE DATABASE ' + QUOTENAME(N'$(DatabaseName)');
  EXEC(@CreateDatabaseSql);
END
GO

USE [$(DatabaseName)];
GO

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
GO

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
GO

IF COL_LENGTH('dbo.tblUsuarios', 'rol') IS NULL
BEGIN
  ALTER TABLE dbo.tblUsuarios
  ADD rol VARCHAR(30) NOT NULL
    CONSTRAINT DF_tblUsuarios_rol DEFAULT ('TERAPEUTA');
END
GO

UPDATE dbo.tblUsuarios
SET rol = 'TERAPEUTA'
WHERE UPPER(LTRIM(RTRIM(ISNULL(rol, '')))) IN ('ANGEOLOGO', 'MAESTRO')
OR UPPER(LTRIM(RTRIM(ISNULL(rol, '')))) NOT IN ('TECNICO', 'TERAPEUTA', 'AUXILIAR');
GO

IF OBJECT_ID('dbo.CK_tblUsuarios_rol_valido', 'C') IS NULL
BEGIN
  ALTER TABLE dbo.tblUsuarios
  ADD CONSTRAINT CK_tblUsuarios_rol_valido
  CHECK (rol IN ('TECNICO', 'TERAPEUTA', 'AUXILIAR'));
END
GO

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
GO

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
GO

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
GO

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
GO

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
GO

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
GO

IF N'$(MasterPasswordHash)' <> N''
AND NOT EXISTS (
  SELECT 1
  FROM dbo.tblUsuarios
  WHERE correo = N'$(MasterEmail)'
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
    N'$(MasterEmail)',
    N'$(MasterPasswordHash)',
    1,
    1,
    'TERAPEUTA',
    1,
    GETDATE()
  );
END
GO
