import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import "./agenda.css";
import CitaModal
  from "../components/CitaModal";
import ConfirmModal
  from "../components/ConfirmModal";  
import { useLocation } from "react-router-dom";  
import DetalleCitaModal
  from "../components/DetalleCitaModal";
import OjoDetalle
  from "../assets/icons/kp-icon-detalle.svg";
import CancelarIcon
  from "../assets/icons/kp-icon-cancelar.svg";
import FinalizarIcon
  from "../assets/icons/kp-icon-finalizar.svg";
import CambiarIcon
  from "../assets/icons/kp-icon-cambiar.svg"; 
import ConfirmarIcon from "../assets/icons/kp-icon-confirmar.svg";     
import { getUserRole } from "../utils/auth";
import { isAuxiliar } from "../utils/roles";
import {
  INTERNAL_ACTION_PERMISSIONS,
  canAccessRole
} from "../utils/permissions";



function Agenda() {

  const userRole = getUserRole();

  const esAuxiliar = isAuxiliar(userRole);

  const puedeGestionarSeguimiento =
    !esAuxiliar &&
    canAccessRole(
      userRole,
      INTERNAL_ACTION_PERMISSIONS.SEGUIMIENTO
    );

  const puedeFinalizarCita =
    !esAuxiliar &&
    canAccessRole(
      userRole,
      INTERNAL_ACTION_PERMISSIONS.FINALIZAR_CITA
    );

  function fechaLocal(fecha) {

  return (
    fecha.getFullYear() +
    "-" +
    String(fecha.getMonth() + 1)
      .padStart(2, "0") +
    "-" +
    String(fecha.getDate())
      .padStart(2, "0")
  );

}

function fechaDesdeTexto(texto) {

  const [anio, mes, dia] =
    texto.split("-").map(Number);

  return new Date(
    anio,
    mes - 1,
    dia
  );

}

  const [detalleAbierto,
    setDetalleAbierto] =
    useState(false);

  const [citaDetalle,
    setCitaDetalle] =
    useState(null); 

  const location = useLocation();

  const [citas, setCitas] = useState([]);

  const [modalAbierto, setModalAbierto] =
  useState(false);

  const [citaEditar, setCitaEditar] =
  useState(null);

  const esDesktop = window.innerWidth > 768;

  const [vistaAgenda, setVistaAgenda] =
  useState("LISTA");

  const [fechaSeleccionada, setFechaSeleccionada] =
  useState(
    fechaLocal(new Date())
  );

  const paisFestivos = "CO";

const festivos = {

  CO: {

    "2026-01-01":"Año Nuevo",

    "2026-01-12":"Reyes Magos",

    "2026-03-23":"San José",

    "2026-04-02":"Jueves Santo",

    "2026-04-03":"Viernes Santo",

    "2026-05-01":"Día del Trabajo",

    "2026-05-18":"Ascensión",

    "2026-06-08":"Corpus Christi",

    "2026-06-15":"Sagrado Corazón",

    "2026-06-29":"San Pedro y San Pablo",

    "2026-07-20":"Independencia",

    "2026-08-07":"Batalla de Boyacá",

    "2026-08-17":"Asunción",

    "2026-10-12":"Día de la Raza",

    "2026-11-02":"Todos los Santos",

    "2026-11-16":"Independencia Cartagena",

    "2026-12-08":"Inmaculada Concepción",

    "2026-12-25":"Navidad"

  }

};

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

  const finalizarCita = async (
  idCita
) => {

  if (!puedeFinalizarCita) {

    return;

  }

  try {

    const response = await fetch(

      `${API_URL}/api/citas/${idCita}/finalizar`,

      {
        method: "PUT"
      }

    );

    const data =
      await response.json();

    if (data.ok) {

      await cargarCitas();

    }

  } catch (error) {

    console.error(error);

  }

};

const confirmarCita = async (
  idCita
) => {

  try {

    const response = await fetch(

      `${API_URL}/api/citas/${idCita}/confirmar`,

      {
        method: "PUT"
      }

    );

    const data =
      await response.json();

    if (data.ok) {

      await cargarCitas();

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

  const citasFiltradas = citas
  .filter((cita) => {

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

  })
  .sort((a, b) => {

  const prioridad = {
    SEGUIMIENTO: 1,
    PROGRAMADA: 2,
    CONFIRMADA: 3,
    FINALIZADA: 4,
    CANCELADA: 5
  };

  const diferenciaEstado =
  (prioridad[a.Estado?.trim().toUpperCase()] || 99) -
  (prioridad[b.Estado?.trim().toUpperCase()] || 99);

  if (diferenciaEstado !== 0) {
    return diferenciaEstado;
  }

  return new Date(a.Fecha) - new Date(b.Fecha);

});

const citasDelDia =
  citas
    .filter(
      (cita) =>
        cita.Fecha?.substring(0, 10) ===
        fechaSeleccionada &&
        [
          "PROGRAMADA",
          "CONFIRMADA"
        ].includes(cita.Estado)
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

const primerDiaMes =
  new Date(anio, mes, 1);

const diaSemanaInicio =
  primerDiaMes.getDay();

/* espacios vacíos */

for (
  let i = 0;
  i < diaSemanaInicio;
  i++
) {

  diasMes.push(null);

}

/* días reales */

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

    {(
  vistaAgenda === "LISTA" ||
  vistaAgenda === "DIA"
) && (

  <input
    className="kp-buscar-header"
    type="text"
    placeholder="✳ Buscar paciente..."
    value={busqueda}
    onChange={(e) =>
      setBusqueda(e.target.value)
    }
  />

)}

    {(
  vistaAgenda === "LISTA" ||
  vistaAgenda === "DIA"
  ) && (
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
  )}

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


        </div>

  {(
  vistaAgenda === "LISTA" ||
  vistaAgenda === "DIA"
  ) && (      
  <input
    type="text"
    className="kp-buscador-normal"
    placeholder="❈ Buscar paciente..."
    value={busqueda}
    onChange={(e) =>
      setBusqueda(e.target.value)
    }
  />
  )}

        {vistaAgenda === "LISTA" && (

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

  )}

   {vistaAgenda === "DIA" && (

  <div className="kp-vista-placeholder">

    <div className="kp-dia-header">

  <button
    onClick={() => {

      const fecha =
  fechaDesdeTexto(fechaSeleccionada);

      fecha.setDate(
        fecha.getDate() - 1
      );

      setFechaSeleccionada(
      fechaLocal(fecha)

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
  fechaLocal(new Date())
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
      fechaDesdeTexto(
        fechaSeleccionada
      );

    fecha.setDate(
      fecha.getDate() + 1
    );

    setFechaSeleccionada(
      fechaLocal(fecha)
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
  onClick={() => {

    setCitaDetalle(cita);

    setDetalleAbierto(true);

  }}
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

       <div className={`kp-estado-badge kp-estado-${cita.Estado?.toLowerCase()}`}>
    {cita.Estado}
  </div>

      <div className="kp-cita-botones">

  <button
    className="
      kp-btn-accion
      kp-btn-editar
    "
    onClick={(e) => {

      e.stopPropagation();

      setCitaEditar(cita);

      setModalAbierto(true);

    }}
  >

    <img
      src={CambiarIcon}
      alt="Cambiar"
      className="kp-btn-icon"
    />

    <span>
      Cambiar
    </span>

  </button>

  {cita.Estado === "PROGRAMADA" && (

  <button
    className="
      kp-btn-accion
      kp-btn-confirmar
    "
    onClick={() =>
      confirmarCita(
        cita.IdCita
      )
    }
  >

    <img
      src={ConfirmarIcon}
      alt="Confirmar"
      className="kp-btn-icon"
    />

    <span>
      Confirmar
    </span>

  </button>

)}

  {puedeFinalizarCita &&
  cita.Estado === "CONFIRMADA" && (

    <button
  className="
    kp-btn-accion
    kp-btn-finalizar
  "
  onClick={() =>
    finalizarCita(
      cita.IdCita
    )
  }
>

  <img
    src={FinalizarIcon}
    alt="Finalizar"
    className="kp-btn-icon"
  />

  <span>
    Finalizar
  </span>

</button>

  )}

<button
    className="
      kp-btn-accion
      kp-btn-cancelar
    "
    onClick={() => {

      setCitaSeleccionada(cita);

      setConfirmAbierto(true);

    }}
  >

    <img
      src={CancelarIcon}
      alt="Cancelar"
      className="kp-btn-icon"
    />

    <span>
      Cancelar
    </span>

  </button>

  <button
    className="
      kp-btn-accion
      kp-btn-detalle
    "
    onClick={() => {

      setCitaDetalle(cita);

      setDetalleAbierto(true);

    }}
  >

    <img
      src={OjoDetalle}
      alt="Detalle"
      className="kp-btn-icon"
    />

    <span>
      Detalle
    </span>

  </button>

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
  fechaLocal(fecha)
)

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
  fechaLocal(new Date())
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

      fecha.getFullYear() +
      "-" +
      String(
        fecha.getMonth() + 1
      ).padStart(2, "0") +
      "-" +
      String(
        fecha.getDate()
      ).padStart(2, "0")

    );

    }}
  >
    ▶
  </button>

</div>

    {diasSemana.map((dia) => {

  const fechaTexto =
  dia.getFullYear() +
  "-" +
  String(dia.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(dia.getDate()).padStart(2, "0");

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

  onClick={() => {

    setFechaSeleccionada(
      fechaTexto
    );

    setVistaAgenda("DIA");

  }}
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

      citasFiltradas.map((cita) => {

  const estado =
  cita.Estado
    ?.trim()
    .toUpperCase();

const cantidadBotones =

  estado === "CANCELADA" ||
  estado === "FINALIZADA"

    ? 1

    : 2 +
      (cita.Estado === "PROGRAMADA" ? 1 : 0) +
      (
        puedeFinalizarCita &&
        (
          cita.Estado === "CONFIRMADA" ||
          cita.Estado === "SEGUIMIENTO"
        )
          ? 1
          : 0
      );      

  return (

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
      : cita.Estado?.trim().toUpperCase() === "SEGUIMIENTO"
      ? "estado-seguimiento"
      : cita.Estado?.trim().toUpperCase() === "FINALIZADA"
      ? "estado-finalizada"
      : cita.Estado?.trim().toUpperCase() === "CONFIRMADA"
      ? "estado-confirmada"
      : "estado-programada"
  }`}
>
  {cita.Estado}
</div>

      <div
  className={`kp-cita-botones kp-botones-${cantidadBotones}`}
>

  {estado !== "CANCELADA" &&
   estado !== "FINALIZADA" && (

    <button
  className="
    kp-btn-accion
    kp-btn-editar
  "
  onClick={() => {

    setCitaEditar(cita);

    setModalAbierto(true);

  }}
>

  <img
    src={CambiarIcon}
    alt="Cambiar"
    className="kp-btn-icon"
  />

  <span>
    Cambiar
  </span>

</button>

  )}

  {cita.Estado === "PROGRAMADA" && (

  <button
    className="
      kp-btn-accion
      kp-btn-confirmar
    "
    onClick={() =>
      confirmarCita(
        cita.IdCita
      )
    }
  >

    <img
      src={ConfirmarIcon}
      alt="Confirmar"
      className="kp-btn-icon"
    />

    <span>
      Confirmar
    </span>

  </button>

)}

  {(
  puedeFinalizarCita &&
  (
  cita.Estado === "CONFIRMADA" ||
  cita.Estado === "SEGUIMIENTO"
  )
) && (

    <button
  className="
    kp-btn-accion
    kp-btn-finalizar
  "
  onClick={() =>
    finalizarCita(
      cita.IdCita
    )
  }
>

  <img
    src={FinalizarIcon}
    alt="Finalizar"
    className="kp-btn-icon"
  />

  <span>
    Finalizar
  </span>

</button>

  )}

 {estado !== "CANCELADA" &&
 estado !== "FINALIZADA" && (

  <button
    className="
      kp-btn-accion
      kp-btn-cancelar
    "
    onClick={() => {

      setCitaSeleccionada(cita);

      setConfirmAbierto(true);

    }}
  >

    <img
      src={CancelarIcon}
      alt="Cancelar"
      className="kp-btn-icon"
    />

    <span>
      Cancelar
    </span>

  </button>

)}

  <button
    className="
      kp-btn-accion
      kp-btn-detalle
    "
    onClick={() => {

      setCitaDetalle(cita);

      setDetalleAbierto(true);

    }}
  >

    <img
      src={OjoDetalle}
      alt="Detalle"
      className="kp-btn-icon"
    />

    <span>
      Detalle
    </span>

  </button>

</div>

    </div>

  );

})

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
  fechaLocal(fecha)
)

        }}
      >
        ◀
      </button>

      <div
  style={{ cursor: "pointer" }}
  onClick={() => {

    setFechaSeleccionada(
  fechaLocal(new Date())
)

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
  fechaLocal(fecha)
)

        }}
      >
        ▶
      </button>

    </div>

     {/* REFERENCIAS */}

    <div className="kp-mes-referencias">

  <span className="kp-ref-item">
    <span className="kp-ref-citas"></span>
    Citas
  </span>

  <span className="kp-ref-item">
    <span className="kp-ref-festivos"></span>
    Festivos
  </span>

  <span className="kp-ref-item">
    <span className="kp-ref-hoy"></span>
    Hoy
  </span>

</div>

    <div className="kp-mes-dias-semana">

  <div>D</div>
  <div>L</div>
  <div>M</div>
  <div>M</div>
  <div>J</div>
  <div>V</div>
  <div>S</div>

</div>

    <div className="kp-mes-grid">

      {diasMes.map((dia, index) => {

  if (!dia) {

    return (
      <div
        key={`vacio-${index}`}
        className="kp-mes-dia-vacio"
      />
    );

  }

  const fechaDia =
  dia.getFullYear() +
  "-" +
  String(dia.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(dia.getDate()).padStart(2, "0");

  const hoy =
  new Date();

const fechaHoy =
  hoy.getFullYear() +
  "-" +
  String(hoy.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(hoy.getDate()).padStart(2, "0");

const tieneCitas = citas.some(
  (cita) =>
    cita.Fecha?.substring(0, 10) === fechaDia &&
    cita.Estado === "PROGRAMADA"
);

const nombreFestivo =
  festivos[paisFestivos]?.[fechaDia];

const esFestivo =
  Boolean(nombreFestivo);

  return (

    <div
      key={dia.toISOString()}
      className={`kp-mes-dia
          ${fechaDia === fechaHoy
            ? "kp-mes-dia-hoy"
            : ""}
          ${tieneCitas
              ? "kp-mes-dia-con-citas"
              : ""}
          ${esFestivo
              ? "kp-mes-dia-festivo"
              : ""}    

        `}

      onClick={() => {

        setFechaSeleccionada(
  fechaLocal(dia)
);

        setVistaAgenda("DIA");

      }}
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

      {esFestivo && esDesktop && (

  <div className="kp-festivo-nombre">

    {nombreFestivo}

  </div>

)}

      {(() => {

        const totalCitas =
          citas.filter((cita) =>

            cita.Fecha?.substring(0, 10)
            ===
            fechaLocal(dia)

            &&

            cita.Estado === "PROGRAMADA"

          ).length;

        return totalCitas > 0 ? (

          <div className="kp-dia-citas">

            ❈ {totalCitas}

          </div>

        ) : null;

      })()}

    </div>

  );

})}

    </div>

  </div>

)}

<CitaModal
  abierto={modalAbierto}
  cita={citaEditar}
  pacientePreseleccionado={
    pacientePreseleccionado
  }
  fechaPreseleccionada={
    fechaSeleccionada
  }
  onCerrar={() => {

    setModalAbierto(false);

    setCitaEditar(null);

  }}
  onCitaGuardada={
    cargarCitas
  }
  puedeGestionarSeguimiento={
    puedeGestionarSeguimiento
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

<DetalleCitaModal
  abierto={detalleAbierto}
  cita={citaDetalle}
  onCerrar={() => {

    setDetalleAbierto(false);

    setCitaDetalle(null);

  }}
  onActualizado={cargarCitas}
  puedeGestionarSeguimiento={
    puedeGestionarSeguimiento
  }
/>

      </div>

    </div>

  );

}

export default Agenda;
