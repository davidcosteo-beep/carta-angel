const { sql } = require('../config/db');

const listarCitas = async (req, res) => {

  try {

    const result = await sql.query`
      SELECT
        c.IdCita,
        c.Fecha,
        c.Hora,
        c.Motivo,
        c.Observaciones,
        c.FechaSeguimiento,
        c.Estado,
        p.IdPaciente,
        p.Nombres,
        p.Apellidos
      FROM Citas c
      INNER JOIN Pacientes p
        ON c.IdPaciente = p.IdPaciente
      ORDER BY c.Fecha ASC, c.Hora ASC
    `;

    res.json({
      ok: true,
      citas: result.recordset
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al listar citas"
    });

  }

};

const crearCita = async (req, res) => {

  try {

    const {
      idPaciente,
      fecha,
      hora,
      motivo,
      observaciones,
      fechaSeguimiento
    } = req.body;

  const fechaSeguimientoDB =
  fechaSeguimiento &&
  fechaSeguimiento.trim() !== ""
    ? fechaSeguimiento
    : null;

    const citaExistente = await sql.query`

        SELECT TOP 1 IdCita

        FROM Citas

        WHERE Fecha = ${fecha}

        AND Hora = ${hora}

        AND Estado = 'PROGRAMADA'

      `;

      if (citaExistente.recordset.length > 0) {

        return res.status(400).json({

          ok: false,

          message:
            "Ya existe una cita programada para esa fecha y hora"

        });

      }

    await sql.query`
      INSERT INTO Citas
      (
        IdPaciente,
        Fecha,
        Hora,
        Motivo,
        Observaciones,
        FechaSeguimiento,
        Estado
      )
      VALUES
      (
        ${idPaciente},
        ${fecha},
        ${hora},
        ${motivo},
        ${observaciones},
        ${fechaSeguimientoDB},
        'PROGRAMADA'
      )
    `;

    res.json({
      ok: true,
      message: 'Cita creada'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al crear cita'
    });

  }

};

const actualizarCita = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const {
      idPaciente,
      fecha,
      hora,
      motivo,
      observaciones,
      fechaSeguimiento
    } = req.body;

    const fechaSeguimientoDB =
  fechaSeguimiento &&
  fechaSeguimiento.trim() !== ""
    ? fechaSeguimiento
    : null;


    let estado = null;

    const citaExistente = await sql.query`

    SELECT TOP 1 IdCita

    FROM Citas

    WHERE Fecha = ${fecha}

    AND Hora = ${hora}

    AND Estado = 'PROGRAMADA'

    AND IdCita <> ${id}

  `;

  if (citaExistente.recordset.length > 0) {

    return res.status(400).json({

      ok: false,

      message:
        "Ya existe una cita programada para esa fecha y hora"

    });

  }

    await sql.query`
      UPDATE Citas
      SET
      IdPaciente = ${idPaciente},
      Fecha = ${fecha},
      Hora = ${hora},
      Motivo = ${motivo},
      Observaciones = ${observaciones},
      FechaSeguimiento = ${fechaSeguimientoDB},

      Estado =
        CASE
          WHEN ${estado} IS NOT NULL
          THEN ${estado}
          ELSE Estado
        END,

      fechaModificacion = GETDATE()
      WHERE IdCita = ${id}
    `;

    res.json({
      ok: true,
      message: "Cita actualizada"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al actualizar cita"
    });

  }

};

const guardarSeguimiento = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const {
      nota,
      fechaSeguimiento
    } = req.body;

    await sql.query`

      INSERT INTO Seguimientos
      (
        IdCita,
        Nota
      )
      VALUES
      (
        ${id},
        ${nota}
      )

    `;

    await sql.query`

      UPDATE Citas

      SET
        FechaSeguimiento =
          ${fechaSeguimiento || null},

        fechaModificacion =
          GETDATE()

      WHERE IdCita = ${id}

    `;

    res.json({

      ok: true

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      ok: false

    });

  }

};

const cancelarCita = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    await sql.query`
      UPDATE Citas
      SET Estado = 'CANCELADA',
      fechaModificacion = GETDATE()
      WHERE IdCita = ${id}
    `;

    res.json({
      ok: true,
      message: "Cita cancelada"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message:
        "Error al cancelar cita"
    });

  }

};

const finalizarCita = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const resultado = await sql.query`
      SELECT FechaSeguimiento, Estado
      FROM Citas
      WHERE IdCita = ${id}
    `;

    const fechaSeguimiento =
  resultado.recordset[0]
    ?.FechaSeguimiento;

    const estadoActual =
  resultado.recordset[0]
    ?.Estado;

    const estado =

  estadoActual === "SEGUIMIENTO"

    ? "FINALIZADA"

    : fechaSeguimiento

      ? "SEGUIMIENTO"

      : "FINALIZADA";

    await sql.query`
      UPDATE Citas
      SET
        Estado = ${estado},
        fechaModificacion = GETDATE()
      WHERE IdCita = ${id}
    `;

    res.json({
      ok: true,
      message: "Cita finalizada"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message:
        "Error al finalizar cita"
    });

  }

};

const confirmarCita = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    await sql.query`
      UPDATE Citas
      SET
        Estado = 'CONFIRMADA',
        fechaModificacion = GETDATE()
      WHERE IdCita = ${id}
    `;

    res.json({
      ok: true,
      message: "Cita confirmada"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message:
        "Error al confirmar cita"
    });

  }

};

const obtenerSeguimientos = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const result = await sql.query`

      SELECT
        IdSeguimiento,
        Fecha,
        Nota
      FROM Seguimientos
      WHERE IdCita = ${id}
      ORDER BY Fecha DESC

    `;

    res.json({

      ok: true,

      seguimientos:
        result.recordset

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      ok: false

    });

  }

};

module.exports = {
  listarCitas,
  crearCita,
  actualizarCita,
  guardarSeguimiento,
  cancelarCita,
  confirmarCita,
  finalizarCita,
  obtenerSeguimientos
};