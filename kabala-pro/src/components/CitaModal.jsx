import { useEffect, useState } from "react";
import "./CitaModal.css";
import { API_URL } from "../config/api";

function CitaModal({
  abierto,
  cita,
  onCerrar,
  onCitaGuardada
}) {

  const [pacientes, setPacientes] =
  useState([]);

  const [idPaciente, setIdPaciente] =
  useState("");

  const [fecha, setFecha] =
    useState("");

  const [hora, setHora] =
    useState("");

  const [motivo, setMotivo] =
    useState("");

  const cargarPacientes = async () => {

  try {

    const response = await fetch(
      `${API_URL}/api/pacientes`
    );

    const data = await response.json();

    if (data.ok) {

      setPacientes(
        data.pacientes
      );

    }

  } catch (error) {

    console.error(error);

  }

};

const guardarCita = async () => {

  try {

    const response = await fetch(

      cita
        ? `${API_URL}/api/citas/${cita.IdCita}`
        : `${API_URL}/api/citas`,

      {

        method: cita
          ? "PUT"
          : "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          idPaciente,
          fecha,
          hora,
          motivo

        })

      }

    );

    const data = await response.json();

    if (data.ok) {

  if (onCitaGuardada) {

    await onCitaGuardada();

  }

  onCerrar();

}

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {

  if (abierto) {

    cargarPacientes();

  }

  if (cita) {

    setIdPaciente(
      cita.IdPaciente
    );

    setFecha(
      cita.Fecha
        ? cita.Fecha.substring(0, 10)
        : ""
    );

    setHora(
      cita.Hora
        ? cita.Hora.substring(11, 16)
        : ""
    );

    setMotivo(
      cita.Motivo || ""
    );

  }

}, [abierto, cita]);

if (!abierto) return null;

  return (

    <div className="kp-modal-overlay">

      <div className="kp-modal">

        <h2>Nueva Cita</h2>

        <div className="kp-form-group">

          <label>Paciente</label>

          <select
            value={idPaciente}
            onChange={(e) => setIdPaciente(e.target.value)}
          >

  <option value="">
    Seleccionar paciente
  </option>

  {pacientes.map((paciente) => (

    <option
      key={paciente.IdPaciente}
      value={paciente.IdPaciente}
    >
      {paciente.Nombres} {paciente.Apellidos}
    </option>

  ))}

</select>

        </div>

        <div className="kp-form-group">

          <label>Fecha</label>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(
                e.target.value
              )
            }
          />

        </div>

        <div className="kp-form-group">

          <label>Hora</label>

          <input
            type="time"
            value={hora}
            onChange={(e) =>
              setHora(
                e.target.value
              )
            }
          />

        </div>

        <div className="kp-form-group">

          <label>Motivo</label>

          <textarea
            rows="3"
            value={motivo}
            onChange={(e) =>
              setMotivo(
                e.target.value
              )
            }
          />

        </div>

        <div className="kp-modal-actions">

          <button
            className="kp-btn-cancelar"
            onClick={onCerrar}
          >
            Cancelar
          </button>

          <button
            className="kp-btn-guardar"
            onClick={guardarCita}
          >
            Guardar
          </button>

        </div>

      </div>

    </div>

  );

}

export default CitaModal;