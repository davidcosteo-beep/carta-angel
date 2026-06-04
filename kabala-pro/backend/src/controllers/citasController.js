const { sql } = require('../config/db');

const listarCitas = async (req, res) => {

  try {

    const result = await sql.query`
      SELECT
        c.IdCita,
        c.Fecha,
        c.Hora,
        c.Motivo,
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
      motivo
    } = req.body;

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
        Estado
      )
      VALUES
      (
        ${idPaciente},
        ${fecha},
        ${hora},
        ${motivo},
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
      motivo
    } = req.body;

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

module.exports = {
  listarCitas,
  crearCita,
  actualizarCita,
  cancelarCita
};