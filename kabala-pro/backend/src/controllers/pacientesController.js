const { sql } = require('../config/db');

const listarPacientes = async (req, res) => {

  try {

    const result = await sql.query`
      SELECT *
      FROM Pacientes
      WHERE activo = 1
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

const listarPacientesArchivados = async (req, res) => {

  try {

    const result = await sql.query`
      SELECT *
      FROM Pacientes
      WHERE activo = 0
      ORDER BY fecha_archivado DESC
    `;

    res.json({
      ok: true,
      pacientes: result.recordset
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al listar pacientes archivados'
    });

  }

};

const crearPaciente = async (req, res) => {

  try {

    const {
      nombres,
      apellidos,
      telefono,
      fechaNacimiento,
      horaNacimiento,
      observaciones
    } = req.body;

  await sql.query`
  INSERT INTO Pacientes
  (
    IdUsuario,
    Nombres,
    Apellidos,
    Telefono,
    FechaNacimiento,
    HoraNacimiento,
    Observaciones
  )
  VALUES
  (
    1,
    ${nombres},
    ${apellidos},
    ${telefono},
    ${fechaNacimiento},
    ${horaNacimiento},
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
  fechaNacimiento,
  horaNacimiento,
  observaciones
} = req.body;

    await sql.query`
  UPDATE Pacientes
  SET
    Nombres = ${nombres},
    Apellidos = ${apellidos},
    Telefono = ${telefono},
    FechaNacimiento = ${fechaNacimiento},
    HoraNacimiento = ${horaNacimiento},
    Observaciones = ${observaciones},
    fecha_modificacion = GETDATE()
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

const archivarPaciente = async (req, res) => {

  try {

    const { id } = req.params;

    await sql.query`
      UPDATE Pacientes
      SET
        activo = 0,
        fecha_archivado = GETDATE()
      WHERE IdPaciente = ${id}
    `;

    res.json({
      ok: true,
      message: 'Paciente archivado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al archivar paciente'
    });

  }

};

const reactivarPaciente = async (req, res) => {

  try {

    const { id } = req.params;

    await sql.query`
      UPDATE Pacientes
      SET
        activo = 1,
        fecha_archivado = NULL
      WHERE IdPaciente = ${id}
    `;

    res.json({
      ok: true,
      message: 'Paciente reactivado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      ok: false,
      message: 'Error al reactivar paciente'
    });

  }

};

module.exports = {
  listarPacientes,
  listarPacientesArchivados,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  archivarPaciente,
  reactivarPaciente
};