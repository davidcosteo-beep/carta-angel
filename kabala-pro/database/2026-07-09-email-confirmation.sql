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
