USE [kabalaPro];
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
