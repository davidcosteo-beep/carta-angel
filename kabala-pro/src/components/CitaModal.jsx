import { useEffect, useState } from "react";
import "./CitaModal.css";
import { API_URL } from "../config/api";
import ConfirmModal
  from "./ConfirmModal";
  

function CitaModal({
  abierto,
  cita,
  pacientePreseleccionado,
  onCerrar,
  onCitaGuardada
}) {

  const [pacientes, setPacientes] =
  useState([]);

  const [idPaciente, setIdPaciente] =
  useState("");

  const [busquedaPaciente, setBusquedaPaciente] =
  useState("");

  const [fecha, setFecha] =
    useState("");

  const [hora, setHora] =
    useState("");

  const [motivo, setMotivo] =
    useState("");

  const [observaciones, setObservaciones] =
  useState("");

  const [fechaSeguimiento, setFechaSeguimiento] =
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

const limpiarFormulario = () => {

  setIdPaciente("");

  setBusquedaPaciente("");

  setFecha("");

  setHora("");

  setMotivo("");

  setObservaciones("");

  setFechaSeguimiento("");

};

const pacientesFiltrados =
  pacientes.filter((paciente) => {

    const nombreCompleto =
      `${paciente.Nombres} ${paciente.Apellidos}`
        .toLowerCase();

    return nombreCompleto.includes(
      busquedaPaciente.toLowerCase()
    );

  });

const [mensajeError, setMensajeError] =
  useState("");

const [errorAbierto, setErrorAbierto] =
  useState(false);

const guardarCita = async () => {

  try {

    const fechaHoraCita =
      new Date(`${fecha}T${hora}`);

    const ahora =
      new Date();

    if (
      !cita &&
      fechaHoraCita < ahora
    ) {

      setMensajeError(
        "No se pueden agendar citas en una fecha u hora pasada."
      );

      setErrorAbierto(true);

      return;

    }

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
          motivo,
          observaciones,
          fechaSeguimiento

        })

      }

    );

    const data = await response.json();

if (!data.ok) {

  setMensajeError(data.message);

  setErrorAbierto(true);

  return;

}

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

  if (
    abierto &&
    pacientePreseleccionado &&
    !cita
  ) {

    setIdPaciente(pacientePreseleccionado);

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

    setObservaciones(
      cita.Observaciones || ""
    );

    setFechaSeguimiento(
      cita.FechaSeguimiento
        ? cita.FechaSeguimiento
            .substring(0, 10)
        : ""
    );

  }

}, [
  abierto,
  cita,
  pacientePreseleccionado
]);

if (!abierto) return null;

return (

  <>

    <div className="kp-modal-overlay">

      <div className="kp-modal">

        <h2>Nueva Cita</h2>

        <div className="kp-form-group">

          <label>Paciente</label>

          <input
            type="text"
            placeholder="❈ Buscar paciente..."
            value={busquedaPaciente}
            onChange={(e) =>
              setBusquedaPaciente(
                e.target.value
              )
            }
            className="kp-buscador-paciente-cita"
          />


          {pacientesFiltrados.length > 0 && (

            <select
              value={idPaciente}
              onChange={(e) =>
                setIdPaciente(e.target.value)
              }
            >

              <option value="">
                Seleccionar paciente
              </option>

              {pacientesFiltrados.map((paciente) => (

                <option
                  key={paciente.IdPaciente}
                  value={paciente.IdPaciente}
                >
                  {paciente.Nombres} {paciente.Apellidos}
                </option>

              ))}

            </select>

)}

            {pacientesFiltrados.length === 0 &&
            busquedaPaciente.trim() !== "" && (

              <div className="kp-paciente-no-encontrado">

                <p>Paciente no encontrado</p>

                <button
                  className="kp-btn-crear-paciente"
                  onClick={() => {
                    // aquí irá la lógica
                  }}
                >
                  ➕ Crear paciente
                </button>

              </div>

            )}

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

        <div className="kp-form-group">

  <label>Observaciones</label>

  <textarea
    rows="4"
    value={observaciones}
    onChange={(e) =>
      setObservaciones(
        e.target.value
      )
    }
  />

</div>

<div className="kp-form-group">

  <label>
    Fecha Seguimiento
  </label>

  <input
    type="date"
    value={fechaSeguimiento}
    onChange={(e) =>
      setFechaSeguimiento(
        e.target.value
      )
    }
  />

</div>

        <div className="kp-modal-actions">

          <button
  className="kp-btn-cancelar"
  onClick={() => {

    limpiarFormulario();

    onCerrar();

  }}
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

    <ConfirmModal
      abierto={errorAbierto}
      titulo="Conflicto de agenda"
      mensaje={mensajeError}
      textoConfirmar="Aceptar"
      textoCancelar=""
      onConfirmar={() =>
        setErrorAbierto(false)
      }
      onCancelar={() =>
        setErrorAbierto(false)
      }
    />

  </>

  );

}

export default CitaModal;