const DEVICE_SCHEMA_SQL = `
IF OBJECT_ID('dbo.tblDispositivos', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.tblDispositivos (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    deviceId UNIQUEIDENTIFIER NOT NULL,
    secretHash VARCHAR(64) NOT NULL,
    nombre NVARCHAR(150) NULL,
    plataforma NVARCHAR(100) NULL,
    navegador NVARCHAR(100) NULL,
    esPwa BIT NOT NULL CONSTRAINT DF_tblDispositivos_esPwa DEFAULT ((0)),
    activo BIT NOT NULL CONSTRAINT DF_tblDispositivos_activo DEFAULT ((1)),
    fechaRegistro DATETIME NOT NULL CONSTRAINT DF_tblDispositivos_fechaRegistro DEFAULT (GETDATE()),
    fechaUltimoAcceso DATETIME NULL,
    ultimoUsuarioId INT NULL,
    ultimoUsuarioCorreo NVARCHAR(255) NULL,
    fechaRevocacion DATETIME NULL,
    revocadoPorUsuarioId INT NULL,
    fechaReactivacion DATETIME NULL,
    reactivadoPorUsuarioId INT NULL
  );
END
ELSE
BEGIN
  IF COL_LENGTH('dbo.tblDispositivos', 'id') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD id INT IDENTITY(1,1) NOT NULL;

  IF COL_LENGTH('dbo.tblDispositivos', 'deviceId') IS NULL
  BEGIN
    IF EXISTS (SELECT 1 FROM dbo.tblDispositivos)
      THROW 51000, 'tblDispositivos contiene registros pero no tiene deviceId. Requiere correccion manual.', 1;
    ALTER TABLE dbo.tblDispositivos ADD deviceId UNIQUEIDENTIFIER NULL;
  END

  IF COL_LENGTH('dbo.tblDispositivos', 'secretHash') IS NULL
  BEGIN
    IF EXISTS (SELECT 1 FROM dbo.tblDispositivos)
      THROW 51000, 'tblDispositivos contiene registros pero no tiene secretHash. Requiere correccion manual.', 1;
    ALTER TABLE dbo.tblDispositivos ADD secretHash VARCHAR(64) NULL;
  END

  IF COL_LENGTH('dbo.tblDispositivos', 'nombre') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD nombre NVARCHAR(150) NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'plataforma') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD plataforma NVARCHAR(100) NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'navegador') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD navegador NVARCHAR(100) NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'fechaUltimoAcceso') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD fechaUltimoAcceso DATETIME NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'ultimoUsuarioId') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD ultimoUsuarioId INT NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'ultimoUsuarioCorreo') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD ultimoUsuarioCorreo NVARCHAR(255) NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'fechaRevocacion') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD fechaRevocacion DATETIME NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'revocadoPorUsuarioId') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD revocadoPorUsuarioId INT NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'fechaReactivacion') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD fechaReactivacion DATETIME NULL;
  IF COL_LENGTH('dbo.tblDispositivos', 'reactivadoPorUsuarioId') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD reactivadoPorUsuarioId INT NULL;

  IF COL_LENGTH('dbo.tblDispositivos', 'esPwa') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD esPwa BIT NOT NULL
      CONSTRAINT DF_tblDispositivos_esPwa DEFAULT ((0)) WITH VALUES;
  ELSE
  BEGIN
    UPDATE dbo.tblDispositivos SET esPwa = 0 WHERE esPwa IS NULL;
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.tblDispositivos') AND name = 'esPwa' AND is_nullable = 1)
      ALTER TABLE dbo.tblDispositivos ALTER COLUMN esPwa BIT NOT NULL;
  END

  IF COL_LENGTH('dbo.tblDispositivos', 'activo') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD activo BIT NOT NULL
      CONSTRAINT DF_tblDispositivos_activo DEFAULT ((1)) WITH VALUES;
  ELSE
  BEGIN
    UPDATE dbo.tblDispositivos SET activo = 1 WHERE activo IS NULL;
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.tblDispositivos') AND name = 'activo' AND is_nullable = 1)
      ALTER TABLE dbo.tblDispositivos ALTER COLUMN activo BIT NOT NULL;
  END

  IF COL_LENGTH('dbo.tblDispositivos', 'fechaRegistro') IS NULL
    ALTER TABLE dbo.tblDispositivos ADD fechaRegistro DATETIME NOT NULL
      CONSTRAINT DF_tblDispositivos_fechaRegistro DEFAULT (GETDATE()) WITH VALUES;
  ELSE
  BEGIN
    UPDATE dbo.tblDispositivos SET fechaRegistro = GETDATE() WHERE fechaRegistro IS NULL;
    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.tblDispositivos') AND name = 'fechaRegistro' AND is_nullable = 1)
      ALTER TABLE dbo.tblDispositivos ALTER COLUMN fechaRegistro DATETIME NOT NULL;
  END
END

IF EXISTS (
  SELECT 1
  FROM sys.columns c
  JOIN sys.types t ON t.user_type_id = c.user_type_id
  WHERE c.object_id = OBJECT_ID('dbo.tblDispositivos')
  AND (
    (c.name = 'id' AND (t.name <> 'int' OR c.is_identity <> 1 OR c.is_nullable <> 0)) OR
    (c.name = 'deviceId' AND t.name <> 'uniqueidentifier') OR
    (c.name = 'secretHash' AND (t.name <> 'varchar' OR c.max_length <> 64)) OR
    (c.name = 'nombre' AND (t.name <> 'nvarchar' OR c.max_length <> 300)) OR
    (c.name IN ('plataforma', 'navegador') AND (t.name <> 'nvarchar' OR c.max_length <> 200)) OR
    (c.name = 'ultimoUsuarioCorreo' AND (t.name <> 'nvarchar' OR c.max_length <> 510)) OR
    (c.name IN ('esPwa', 'activo') AND t.name <> 'bit') OR
    (c.name IN ('fechaRegistro', 'fechaUltimoAcceso', 'fechaRevocacion', 'fechaReactivacion') AND t.name <> 'datetime') OR
    (c.name IN ('ultimoUsuarioId', 'revocadoPorUsuarioId', 'reactivadoPorUsuarioId') AND t.name <> 'int')
  )
)
  THROW 51000, 'tblDispositivos contiene columnas con tipos incompatibles. Requiere correccion manual.', 1;

IF EXISTS (SELECT 1 FROM dbo.tblDispositivos WHERE deviceId IS NULL)
  THROW 51000, 'tblDispositivos contiene deviceId nulo. Requiere correccion manual.', 1;
IF EXISTS (SELECT 1 FROM dbo.tblDispositivos WHERE secretHash IS NULL OR LEN(secretHash) <> 64)
  THROW 51000, 'tblDispositivos contiene secretHash invalido. Requiere correccion manual.', 1;
IF EXISTS (SELECT deviceId FROM dbo.tblDispositivos GROUP BY deviceId HAVING COUNT(*) > 1)
  THROW 51000, 'tblDispositivos contiene deviceId duplicado. Requiere correccion manual.', 1;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.tblDispositivos') AND name = 'deviceId' AND is_nullable = 1)
  ALTER TABLE dbo.tblDispositivos ALTER COLUMN deviceId UNIQUEIDENTIFIER NOT NULL;
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.tblDispositivos') AND name = 'secretHash' AND is_nullable = 1)
  ALTER TABLE dbo.tblDispositivos ALTER COLUMN secretHash VARCHAR(64) NOT NULL;

IF NOT EXISTS (
  SELECT 1 FROM sys.key_constraints kc
  JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
  WHERE kc.parent_object_id = OBJECT_ID('dbo.tblDispositivos')
  AND kc.type = 'PK' AND c.name = 'id'
)
BEGIN
  IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('dbo.tblDispositivos') AND type = 'PK')
    THROW 51000, 'tblDispositivos tiene una clave primaria incompatible. Requiere correccion manual.', 1;
  ALTER TABLE dbo.tblDispositivos ADD CONSTRAINT PK_tblDispositivos PRIMARY KEY (id);
END

IF NOT EXISTS (
  SELECT 1 FROM sys.default_constraints dc
  JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
  WHERE dc.parent_object_id = OBJECT_ID('dbo.tblDispositivos') AND c.name = 'esPwa'
)
  ALTER TABLE dbo.tblDispositivos ADD CONSTRAINT DF_tblDispositivos_esPwa DEFAULT ((0)) FOR esPwa;
IF NOT EXISTS (
  SELECT 1 FROM sys.default_constraints dc
  JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
  WHERE dc.parent_object_id = OBJECT_ID('dbo.tblDispositivos') AND c.name = 'activo'
)
  ALTER TABLE dbo.tblDispositivos ADD CONSTRAINT DF_tblDispositivos_activo DEFAULT ((1)) FOR activo;
IF NOT EXISTS (
  SELECT 1 FROM sys.default_constraints dc
  JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
  WHERE dc.parent_object_id = OBJECT_ID('dbo.tblDispositivos') AND c.name = 'fechaRegistro'
)
  ALTER TABLE dbo.tblDispositivos ADD CONSTRAINT DF_tblDispositivos_fechaRegistro DEFAULT (GETDATE()) FOR fechaRegistro;

IF EXISTS (
  SELECT 1 FROM sys.default_constraints dc
  JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
  WHERE dc.parent_object_id = OBJECT_ID('dbo.tblDispositivos')
  AND c.name = 'esPwa'
  AND REPLACE(REPLACE(REPLACE(LOWER(dc.definition), '(', ''), ')', ''), ' ', '') <> '0'
)
  THROW 51000, 'El default de tblDispositivos.esPwa es incompatible.', 1;
IF EXISTS (
  SELECT 1 FROM sys.default_constraints dc
  JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
  WHERE dc.parent_object_id = OBJECT_ID('dbo.tblDispositivos')
  AND c.name = 'activo'
  AND REPLACE(REPLACE(REPLACE(LOWER(dc.definition), '(', ''), ')', ''), ' ', '') <> '1'
)
  THROW 51000, 'El default de tblDispositivos.activo es incompatible.', 1;
IF EXISTS (
  SELECT 1 FROM sys.default_constraints dc
  JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
  WHERE dc.parent_object_id = OBJECT_ID('dbo.tblDispositivos')
  AND c.name = 'fechaRegistro'
  AND REPLACE(REPLACE(REPLACE(LOWER(dc.definition), '(', ''), ')', ''), ' ', '') <> 'getdate'
)
  THROW 51000, 'El default de tblDispositivos.fechaRegistro es incompatible.', 1;

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'UX_tblDispositivos_deviceId'
  AND object_id = OBJECT_ID('dbo.tblDispositivos')
)
  CREATE UNIQUE INDEX UX_tblDispositivos_deviceId ON dbo.tblDispositivos(deviceId);
ELSE IF NOT EXISTS (
  SELECT 1 FROM sys.indexes i
  JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
  JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
  WHERE i.object_id = OBJECT_ID('dbo.tblDispositivos')
  AND i.name = 'UX_tblDispositivos_deviceId'
  AND i.is_unique = 1 AND c.name = 'deviceId' AND ic.key_ordinal = 1
)
  THROW 51000, 'UX_tblDispositivos_deviceId existe con una definicion incompatible.', 1;
`;

module.exports = {
  DEVICE_SCHEMA_SQL
};
