const { sql } = require('../config/db');

const listarPacientes = async (req, res) => {

  try {

    const result = await sql.query`
      SELECT *
      FROM Pacientes
      ORDER BY Nombres
    `;

    res.json({
      ok: true,
      pacientes: result.recordset
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al listar pacientes'
    });

  }

};

const obtenerPaciente = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await sql.query`
      SELECT *
      FROM Pacientes
      WHERE IdPaciente = ${id}
    `;

    if (result.recordset.length === 0) {

      return res.status(404).json({
        ok: false,
        message: 'Paciente no encontrado'
      });

    }

    res.json({
      ok: true,
      paciente: result.recordset[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al obtener paciente'
    });

  }

};

const crearPaciente = async (req, res) => {

  try {

    const {
      nombres,
      apellidos,
      telefono,
      correo,
      fechaNacimiento,
      observaciones
    } = req.body;

  await sql.query`
  INSERT INTO Pacientes
  (
    IdUsuario,
    Nombres,
    Apellidos,
    Telefono,
    Correo,
    FechaNacimiento,
    Observaciones
  )
  VALUES
  (
    1,
    ${nombres},
    ${apellidos},
    ${telefono},
    ${correo},
    ${fechaNacimiento},
    ${observaciones}
  )
`;

    res.json({
      ok: true,
      message: 'Paciente creado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al crear paciente'
    });

  }

};

const actualizarPaciente = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      nombres,
      apellidos,
      telefono,
      correo,
      fechaNacimiento,
      observaciones
    } = req.body;

    await sql.query`
      UPDATE Pacientes
      SET
        Nombres = ${nombres},
        Apellidos = ${apellidos},
        Telefono = ${telefono},
        Correo = ${correo},
        FechaNacimiento = ${fechaNacimiento},
        Observaciones = ${observaciones}
      WHERE IdPaciente = ${id}
    `;

    res.json({
      ok: true,
      message: 'Paciente actualizado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al actualizar paciente'
    });

  }

};

const eliminarPaciente = async (req, res) => {

  try {

    const { id } = req.params;

    await sql.query`
      DELETE FROM Pacientes
      WHERE IdPaciente = ${id}
    `;

    res.json({
      ok: true,
      message: 'Paciente eliminado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al eliminar paciente'
    });

  }

};

module.exports = {
  listarPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
};