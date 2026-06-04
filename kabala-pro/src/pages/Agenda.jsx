import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import "./agenda.css";
import CitaModal
  from "../components/CitaModal";


function Agenda() {

  const [citas, setCitas] = useState([]);

  const [modalAbierto, setModalAbierto] =
  useState(false);

  const [citaEditar, setCitaEditar] =
  useState(null);

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

  useEffect(() => {

    cargarCitas();

  }, []);

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

        {citas.length === 0 ? (

  <p
    style={{
      marginTop: "25px"
    }}
  >
    No hay citas programadas.
  </p>

) : (

  citas.map((cita) => (

    <div
      key={cita.IdCita}
      className="kp-cita-card"
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
            ? cita.Hora.substring(11, 16)
            : ""
        }
      </p>

      <p>
        ✧ {cita.Motivo}
      </p>

      <p>
        {cita.Estado}
      </p>

      <button
        className="kp-btn-editar"
        onClick={() => {

          setCitaEditar(cita);

          setModalAbierto(true);

        }}
      >
        ✎ Editar
      </button>

    </div>

  ))

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

      </div>

    </div>

  );

}

export default Agenda;