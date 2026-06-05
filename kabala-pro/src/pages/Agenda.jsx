import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import "./agenda.css";
import CitaModal
  from "../components/CitaModal";
import ConfirmModal
  from "../components/ConfirmModal";  
import { useLocation } from "react-router-dom";  


function Agenda() {

  const location = useLocation();

  const [citas, setCitas] = useState([]);

  const [modalAbierto, setModalAbierto] =
  useState(false);

  const [citaEditar, setCitaEditar] =
  useState(null);

  const esDesktop = window.innerWidth >= 1024;

  const [vistaAgenda, setVistaAgenda] =
  useState("LISTA");

  const [fechaSeleccionada, setFechaSeleccionada] =
  useState(
    new Date()
      .toISOString()
      .substring(0, 10)
  );

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

const [pacientePreseleccionado,
  setPacientePreseleccionado] =
  useState(null);

useEffect(() => {

  if (location.state?.pacienteId) {

    setPacientePreseleccionado(
      location.state.pacienteId
    );

    setModalAbierto(true);

  }

}, [location.state]);

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

  const formatearHora = (hora) => {

  const hora24 = hora.substring(11, 16);

  let [h, m] = hora24.split(":");

  h = parseInt(h);

  const ampm =
    h >= 12 ? "PM" : "AM";

  h = h % 12;

  if (h === 0) h = 12;

  return `${h}:${m} ${ampm}`;

};

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

const citasDelDia =
  citas
    .filter(
      (cita) =>
        cita.Fecha?.substring(0, 10) ===
        fechaSeleccionada &&
        cita.Estado === "PROGRAMADA"
    )
    .sort((a, b) =>
      a.Hora.localeCompare(b.Hora)
    );

  const obtenerInicioSemana = (fecha) => {

  const d = new Date(fecha);

  const dia = d.getDay();

  const diferencia =
    dia === 0 ? -6 : 1 - dia;

  d.setDate(
    d.getDate() + diferencia
  );

  return d;

};

const inicioSemana =
  obtenerInicioSemana(
    fechaSeleccionada
  );

const finSemana =
  new Date(inicioSemana);

finSemana.setDate(
  inicioSemana.getDate() + 6
);

const citasSemana =
  citas.filter((cita) => {

    if (
      cita.Estado !== "PROGRAMADA"
    ) {
      return false;
    }

    const fechaCita =
      new Date(
        cita.Fecha.substring(0, 10)
      );

    return (
      fechaCita >= inicioSemana &&
      fechaCita <= finSemana
    );

  });  

  const diasSemana = [];

for (let i = 0; i < 7; i++) {

  const fecha = new Date(inicioSemana);

  fecha.setDate(
    inicioSemana.getDate() + i
  );

  diasSemana.push(fecha);

}

const fechaMes =
  new Date(fechaSeleccionada);

const anio =
  fechaMes.getFullYear();

const mes =
  fechaMes.getMonth();

//const primerDiaMes =
  //new Date(anio, mes, 1);

const ultimoDiaMes =
  new Date(anio, mes + 1, 0);

const diasMes = [];

for (
  let i = 1;
  i <= ultimoDiaMes.getDate();
  i++
) {

  diasMes.push(
    new Date(anio, mes, i)
  );

}
    
  return (

    <div className="page-transition">

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "30px 20px"
        }}
      >

       <div className="kp-agenda-header">

  <h1>Agenda</h1>

  <input
    type="text"
    className="kp-buscador-pacientes"
    placeholder="❈ Buscar paciente..."
    value={busqueda}
    onChange={(e) =>
      setBusqueda(e.target.value)
    }
  />

</div>

<div className="kp-agenda-toolbar">

  <button
  className="kp-btn-nuevo"
  onClick={() => {

    setCitaEditar(null);

    setPacientePreseleccionado(null);

    setModalAbierto(true);

  }}
>
  ➕ Nueva Cita
</button>

</div>

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

  {esDesktop && (
  <button
    className={
      vistaAgenda === "MES"
        ? "kp-tab-activa"
        : ""
    }
    onClick={() =>
      setVistaAgenda("MES")
    }
  >
    Mes
  </button>
)}

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

    <div className="kp-dia-header">

  <button
    onClick={() => {

      const fecha =
        new Date(fechaSeleccionada);

      fecha.setDate(
        fecha.getDate() - 1
      );

      setFechaSeleccionada(
        fecha
          .toISOString()
          .substring(0, 10)
      );

    }}
  >
    ◀
  </button>

  <div>

    <h3
  style={{
    cursor: "pointer"
  }}
  onClick={() =>
    setFechaSeleccionada(
      new Date()
        .toISOString()
        .substring(0, 10)
    )
  }
>
  Día
</h3>

    <p>

      {
        fechaSeleccionada
          .split("-")
          .reverse()
          .join("/")
      }

    </p>

  </div>

  <button
    onClick={() => {

      const fecha =
        new Date(fechaSeleccionada);

      fecha.setDate(
        fecha.getDate() + 1
      );

      setFechaSeleccionada(
        fecha
          .toISOString()
          .substring(0, 10)
      );

    }}
  >
    ▶
  </button>

</div>

    {citasDelDia.length === 0 ? (

  <p
    style={{
      marginTop: "20px"
    }}
  >
    No hay citas para este día.
  </p>

) : (

  citasDelDia.map((cita) => (

    <div
      key={cita.IdCita}
      className="kp-dia-cita"
    >

      <div className="kp-dia-hora">

        {formatearHora(cita.Hora)}

      </div>

      <div className="kp-dia-nombre">

        {cita.Nombres}
        {" "}
        {cita.Apellidos}

      </div>

      <div className="kp-dia-motivo">

        ✧ {cita.Motivo}

      </div>

    </div>

  ))

)}

  </div>

)}

{vistaAgenda === "SEMANA" && (

  <div className="kp-vista-placeholder">

    <div className="kp-semana-header">

  <button
    onClick={() => {

      const fecha =
        new Date(fechaSeleccionada);

      fecha.setDate(
        fecha.getDate() - 7
      );

      setFechaSeleccionada(
        fecha
          .toISOString()
          .substring(0, 10)
      );

    }}
  >
    ◀
  </button>

  <div>

    <h3
  style={{
    cursor: "pointer"
  }}
  onClick={() =>
    setFechaSeleccionada(
      new Date()
        .toISOString()
        .substring(0, 10)
    )
  }
>
  Semana
</h3>

    <p>

      {
        inicioSemana
          .toLocaleDateString("es-CO")
      }

      {" - "}

      {
        finSemana
          .toLocaleDateString("es-CO")
      }

    </p>

  </div>

  <button
    onClick={() => {

      const fecha =
        new Date(fechaSeleccionada);

      fecha.setDate(
        fecha.getDate() + 7
      );

      setFechaSeleccionada(
        fecha
          .toISOString()
          .substring(0, 10)
      );

    }}
  >
    ▶
  </button>

</div>

    {diasSemana.map((dia) => {

  const fechaTexto =
    dia.toISOString()
      .substring(0, 10);

  const citasDia =
    citasSemana.filter(
      (cita) =>
        cita.Fecha?.substring(0, 10) ===
        fechaTexto
    );

    

  return (

    <div
      key={fechaTexto}
      className="kp-semana-dia"
    >

      <h4>

        {
          dia.toLocaleDateString(
            "es-CO",
            {
              weekday: "long",
              day: "2-digit",
              month: "2-digit"
            }
          )
        }

      </h4>

      {citasDia.length === 0 ? (

        <p>
          Sin citas
        </p>

      ) : (

        citasDia.map((cita) => (

          <div
            key={cita.IdCita}
            className="kp-semana-cita"
          >

            <strong>
              {formatearHora(
                cita.Hora
              )}
            </strong>

            <div>

              {cita.Nombres}
              {" "}
              {cita.Apellidos}

            </div>

          </div>

        ))

      )}

    </div>

  );

})}

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
                ? formatearHora(cita.Hora)
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

{vistaAgenda === "MES" && (

  <div className="kp-mes-container">

    <div className="kp-semana-header">

      <button
        onClick={() => {

          const fecha =
            new Date(fechaSeleccionada);

          fecha.setMonth(
            fecha.getMonth() - 1
          );

          setFechaSeleccionada(
            fecha
              .toISOString()
              .substring(0, 10)
          );

        }}
      >
        ◀
      </button>

      <div
  style={{ cursor: "pointer" }}
  onClick={() => {

    setFechaSeleccionada(
      new Date()
        .toISOString()
        .substring(0, 10)
    );

  }}
>

  <h3>Mes</h3>

  <p>
    {new Date(fechaSeleccionada)
      .toLocaleDateString(
        "es-CO",
        {
          month: "long",
          year: "numeric"
        }
      )}
  </p>

</div>

      <button
        onClick={() => {

          const fecha =
            new Date(fechaSeleccionada);

          fecha.setMonth(
            fecha.getMonth() + 1
          );

          setFechaSeleccionada(
            fecha
              .toISOString()
              .substring(0, 10)
          );

        }}
      >
        ▶
      </button>

    </div>

    <div className="kp-mes-dias-semana">

  <div>L</div>
  <div>M</div>
  <div>M</div>
  <div>J</div>
  <div>V</div>
  <div>S</div>
  <div>D</div>

</div>

    <div className="kp-mes-grid">

      {diasMes.map((dia) => (

        <div
      key={dia.toISOString()}
      className={
        dia.toISOString().substring(0, 10) ===
        new Date().toISOString().substring(0, 10)
          ? "kp-mes-dia kp-mes-dia-hoy"
          : "kp-mes-dia"
        }
      >

 <span
  className={
    dia.getDay() === 0
      ? "kp-dia-domingo"
      : ""
  }
>
  {dia.getDate()}
</span>

  {(() => {

  const totalCitas =
    citas.filter((cita) =>

      cita.Fecha?.substring(0, 10)
      ===
      dia.toISOString()
        .substring(0, 10)

    ).length;

  return totalCitas > 0 ? (

    <div className="kp-dia-citas">

      • {totalCitas}
      {" "}
      cita
      {totalCitas > 1
        ? "s"
        : ""
      }

    </div>

  ) : null;

})()}

</div>

      ))}

    </div>

  </div>

)}

<CitaModal
  abierto={modalAbierto}
  cita={citaEditar}
  pacientePreseleccionado={
    pacientePreseleccionado
  }
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