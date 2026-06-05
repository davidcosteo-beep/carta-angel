import { useEffect, useState, useCallback } from "react";
import "./pacientes.css";
import { API_URL } from "../config/api";
import PacienteModal
  from "../components/PacienteModal";
import ConfirmModal
  from "../components/ConfirmModal";  
import { useNavigate } from "react-router-dom";  


function Pacientes() {

  const navigate = useNavigate();

  const [modalAbierto, setModalAbierto] =
  useState(false);

  const [pacientes, setPacientes] = useState([]);

  const [verArchivados, setVerArchivados] = useState(false);

  const [confirmAbierto, setConfirmAbierto] =
  useState(false);

  const [pacienteSeleccionado, setPacienteSeleccionado] =
  useState(null);

  const [busqueda, setBusqueda] = useState("");

  const pacientesFiltrados = pacientes.filter(
  (paciente) =>
    `${paciente.Nombres} ${paciente.Apellidos}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
);

  const [pacienteEditar, setPacienteEditar] =
  useState(null);

  const cargarPacientes = useCallback(async () => {

    try {

      const url = verArchivados
      ? `${API_URL}/api/pacientes/archivados`
      : `${API_URL}/api/pacientes`;

      const response = await fetch(url);

      const data = await response.json();

      if (data.ok) {

        setPacientes(data.pacientes);

      }

    } catch (error) {

      console.error(
        "Error cargando pacientes:",
        error
      );

    }

  }, [verArchivados]);

 const archivarPaciente = async (idPaciente) => {

  try {

    const response = await fetch(
      `${API_URL}/api/pacientes/${idPaciente}/archivar`,
      {
        method: "PUT"
      }
    );

    const data = await response.json();

    if (data.ok) {

      await cargarPacientes();

    }

  } catch (error) {

    console.error(error);

  }

};

const reactivarPaciente = async (idPaciente) => {


  try {

    const response = await fetch(
      `${API_URL}/api/pacientes/${idPaciente}/reactivar`,
      {
        method: "PUT"
      }
    );

    const data = await response.json();

    if (data.ok) {

      await cargarPacientes();

    }

  } catch (error) {

    console.error(error);

  }

};

 useEffect(() => {

  cargarPacientes();

}, [cargarPacientes]);

  return (

    <div className="page-transition">

    <div className="kp-pacientes-container">

      <div className="kp-pacientes-header">

        <h1>Pacientes</h1>

       <div className="kp-pacientes-controles">

  <button
    className="kp-btn-nuevo"
    onClick={() =>
      setModalAbierto(true)
    }
  >
    ➕ Nuevo Paciente
  </button>

  <div className="kp-pacientes-tabs">

    <button
      className={!verArchivados ? "kp-tab-activa" : ""}
      onClick={() => setVerArchivados(false)}
    >
      Activos
    </button>

    <button
      className={verArchivados ? "kp-tab-activa" : ""}
      onClick={() => setVerArchivados(true)}
    >
      Archivados
    </button>

  </div>

</div>

<input
  type="text"
  placeholder="❈ Buscar paciente..."
  value={busqueda}
  onChange={(e) =>
    setBusqueda(e.target.value)
  }
  className="kp-buscador-pacientes"
/>

      </div>

      {pacientes.length === 0 ? (

        <div className="kp-sin-pacientes">
          No hay pacientes registrados
        </div>

      ) : (

        pacientesFiltrados.map((paciente) => (

          <div
            key={paciente.IdPaciente}
            className="kp-paciente-card"
          >

            <div className="kp-paciente-nombre">

              {paciente.Nombres} {paciente.Apellidos}

            </div>

            <div className="kp-paciente-info">
              ☏ {paciente.Telefono}
            </div>

            <div className="kp-paciente-info">
              ✧ {
                paciente.FechaNacimiento
                  ? new Date(
                      paciente.FechaNacimiento
                    ).toLocaleDateString()
                  : "Sin fecha"
              }
            </div>            

            <div className="kp-paciente-botones">

  {!verArchivados ? (

    <>

       <button
        className="kp-btn-agendar"
        onClick={() => {

          navigate("/agenda", {

            state: {

              pacienteId:
                paciente.IdPaciente,

              pacienteNombre:
                `${paciente.Nombres} ${paciente.Apellidos}`

            }

          });

        }}
      >
        📅 Agendar
      </button>

      <button
        className="kp-btn-editar"
        onClick={() => {

          setPacienteEditar(
            paciente
          );

          setModalAbierto(true);

        }}
      >
        ✎ Editar
      </button>

      <button
        className="kp-btn-eliminar"
        onClick={() => {

          setPacienteSeleccionado(
            paciente
          );

          setConfirmAbierto(true);

        }}
      >
        📦 Archivar
      </button>
    </>

  ) : (

    <>
  

  <button
    style={{ visibility: "hidden" }}
    className="kp-btn-editar"
  >
    ✎ Editar
  </button>

  <button
    className="kp-btn-reactivar"
    onClick={() =>
      reactivarPaciente(
        paciente.IdPaciente
      )
    }
  >
    ♻ Reactivar
  </button>
</>

  )}

</div>

          </div>
          

        ))

      )}

      <PacienteModal
        abierto={modalAbierto}
        paciente={pacienteEditar}
        onCerrar={() => {

          setModalAbierto(false);

          setPacienteEditar(null);

        }}
        onPacienteGuardado={
          cargarPacientes
        }
      />

<ConfirmModal
  abierto={confirmAbierto}
  titulo="Archivar paciente"
  mensaje={
    pacienteSeleccionado
      ? `¿Deseas archivar a ${pacienteSeleccionado.Nombres} ${pacienteSeleccionado.Apellidos}?`
      : ""
  }
  textoConfirmar="Archivar"
  textoCancelar="Cancelar"
  onCancelar={() => {

    setConfirmAbierto(false);

    setPacienteSeleccionado(null);

  }}
  onConfirmar={() => {

    setConfirmAbierto(false);

    archivarPaciente(
      pacienteSeleccionado.IdPaciente
    );

  }}
/>

    </div>

    </div>

    

  );

}

export default Pacientes;