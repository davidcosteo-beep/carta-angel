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
    rol VARCHAR(30) NOT NULL CONSTRAINT DF_tblUsuarios_rol DEFAULT ('TERAPEUTA')
  );
END
GO

IF COL_LENGTH('dbo.tblUsuarios', 'rol') IS NULL
BEGIN
  ALTER TABLE dbo.tblUsuarios
  ADD rol VARCHAR(30) NOT NULL
    CONSTRAINT DF_tblUsuarios_rol DEFAULT ('TERAPEUTA');
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
    rol
  )
  VALUES
  (
    'Usuario Maestro',
    N'$(MasterEmail)',
    N'$(MasterPasswordHash)',
    1,
    1,
    'MAESTRO'
  );
END
GO
