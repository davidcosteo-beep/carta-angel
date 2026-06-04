import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import "./agenda.css";
import CitaModal
  from "../components/CitaModal";
import ConfirmModal
  from "../components/ConfirmModal";  


function Agenda() {

  const [citas, setCitas] = useState([]);

  const [modalAbierto, setModalAbierto] =
  useState(false);

  const [citaEditar, setCitaEditar] =
  useState(null);

  const [vistaAgenda, setVistaAgenda] =
  useState("LISTA");

  const [busqueda, setBusqueda] =
  useState("");


  const cargarCitas = async () => {

  try {

    const response = await fetch(
      `${API_URL}/api/citas`
    );

    const data = await response.json();

    if (data.ok) {

      setCitas(data.citas);

    }

  } catch (error) {

    console.error(error);

  }

};

  const cancelarCita = async () => {

    try {

      const response = await fetch(
        `${API_URL}/api/citas/${citaSeleccionada.IdCita}/cancelar`,
        {
          method: "PUT"
        }
      );

      const data = await response.json();

      if (data.ok) {

        setConfirmAbierto(false);

        setCitaSeleccionada(null);

        cargarCitas();

      }

    } catch (error) {

      console.error(error);

    }

  };

  const [confirmAbierto, setConfirmAbierto] =
    useState(false);

  const [citaSeleccionada, setCitaSeleccionada] =
    useState(null);

  const [filtroEstado, setFiltroEstado] =
  useState("TODAS"); 
   

  useEffect(() => {

    cargarCitas();

  }, []);

  const citasFiltradas = citas.filter((cita) => {

  const coincideEstado =
    filtroEstado === "TODAS"
      ? true
      : cita.Estado === filtroEstado;

  const nombreCompleto =
    `${cita.Nombres} ${cita.Apellidos}`
      .toLowerCase();

  const coincideBusqueda =
    nombreCompleto.includes(
      busqueda.toLowerCase()
    );

  return (
    coincideEstado &&
    coincideBusqueda
  );

});
  return (

    <div className="page-transition">

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "30px 20px"
        }}
      >

        <h1>Agenda</h1>

        <button
          className="kp-btn-nuevo"
          onClick={() => {

            setCitaEditar(null);

            setModalAbierto(true);

          }}
        >
          ➕ Nueva Cita
        </button>

        <input
          type="text"
          className="kp-buscador-agenda"
          placeholder="❈ Buscar paciente..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        <div className="kp-agenda-vistas">

  <button
    className={
      vistaAgenda === "LISTA"
        ? "kp-tab-activa"
        : ""
    }
    onClick={() =>
      setVistaAgenda("LISTA")
    }
  >
    Lista
  </button>

  <button
    className={
      vistaAgenda === "DIA"
        ? "kp-tab-activa"
        : ""
    }
    onClick={() =>
      setVistaAgenda("DIA")
    }
  >
    Día
  </button>

  <button
    className={
      vistaAgenda === "SEMANA"
        ? "kp-tab-activa"
        : ""
    }
    onClick={() =>
      setVistaAgenda("SEMANA")
    }
  >
    Semana
  </button>

</div>

        <div className="kp-pacientes-tabs">

  <button
    className={
      filtroEstado === "TODAS"
        ? "kp-tab-activa"
        : ""
    }
    onClick={() => setFiltroEstado("TODAS")}
  >
    Todas
  </button>

  <button
    className={
      filtroEstado === "PROGRAMADA"
        ? "kp-tab-activa"
        : ""
    }
    onClick={() => setFiltroEstado("PROGRAMADA")}
  >
    Programadas
  </button>

  <button
    className={
      filtroEstado === "CANCELADA"
        ? "kp-tab-activa"
        : ""
    }
    onClick={() => setFiltroEstado("CANCELADA")}
  >
    Canceladas
  </button>

</div>

    {vistaAgenda === "DIA" && (

  <div className="kp-vista-placeholder">

    Vista Día en desarrollo

  </div>

)}

{vistaAgenda === "SEMANA" && (

  <div className="kp-vista-placeholder">

    Vista Semana en desarrollo

  </div>

)}

{vistaAgenda === "LISTA" && (

  <>

    {citasFiltradas.length === 0 ? (

      <p
        style={{
          marginTop: "25px"
        }}
      >
        No hay citas programadas.
      </p>

    ) : (

      citasFiltradas.map((cita) => (

        <div
          key={cita.IdCita}
          className={`kp-cita-card ${
            cita.Estado?.trim().toUpperCase() === "CANCELADA"
              ? "kp-cita-cancelada"
              : ""
          }`}
        >

          <h3>
            {cita.Nombres} {cita.Apellidos}
          </h3>

          <p>
            📅 {
              cita.Fecha
                ? cita.Fecha.substring(0, 10)
                    .split("-")
                    .reverse()
                    .join("/")
                : ""
            }
          </p>

          <p>
            🕒 {
              cita.Hora
                ? new Date(cita.Hora)
                    .toLocaleTimeString(
                      "es-CO",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                      }
                    )
                : ""
            }
          </p>

          <p>
            ✧ {cita.Motivo}
          </p>

          <div
            className={`kp-estado-badge ${
              cita.Estado?.trim().toUpperCase() === "CANCELADA"
                ? "estado-cancelada"
                : "estado-programada"
            }`}
          >
            {cita.Estado}
          </div>

          <div className="kp-cita-botones">

            <button
              className="kp-btn-editar"
              onClick={() => {

                setCitaEditar(cita);

                setModalAbierto(true);

              }}
            >
              ✎ Editar
            </button>

            {cita.Estado?.trim().toUpperCase() !== "CANCELADA" && (

              <button
                className="kp-btn-cancelar"
                onClick={() => {

                  setCitaSeleccionada(cita);

                  setConfirmAbierto(true);

                }}
              >
                ⊘ Cancelar
              </button>

            )}

          </div>

        </div>

      ))

    )}

  </>

)}

<CitaModal
  abierto={modalAbierto}
  cita={citaEditar}
  onCerrar={() => {

    setModalAbierto(false);

    setCitaEditar(null);

  }}
  onCitaGuardada={
    cargarCitas
  }
/>

<ConfirmModal
  abierto={confirmAbierto}
  titulo="Cancelar cita"
  mensaje={`¿Deseas cancelar la cita de ${citaSeleccionada?.Nombres} ${citaSeleccionada?.Apellidos}?`}
  onConfirmar={cancelarCita}
  onCerrar={() => {

    setConfirmAbierto(false);

    setCitaSeleccionada(null);

  }}
/>

      </div>

    </div>

  );

}

export default Agenda;