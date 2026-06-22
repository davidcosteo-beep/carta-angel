import { useState, useEffect } from "react";
import "./DetalleCitaModal.css";
import { API_URL } from "../config/api";
import ConfirmModal from "./ConfirmModal";
import OjoDetalle
  from "../assets/icons/kp-icon-detalle.svg";
import IconSeguimiento
from "../assets/icons/kp-icon-seguimiento.svg";  

function DetalleCitaModal({
  abierto,
  cita,
  onCerrar,
  onActualizado
}) {

const [mensaje, setMensaje] =
  useState("");

const [
  seguimientoDetalle,
  setSeguimientoDetalle
] = useState(null);

const [
  detalleAbierto,
  setDetalleAbierto
] = useState(false);  

const [mensajeAbierto,
setMensajeAbierto] =
  useState(false);  

const [
  escuchando,
  setEscuchando
] = useState(false);  

const [
  seguimientos,
  setSeguimientos
] = useState([]);  

  const [notaSeguimiento,
  setNotaSeguimiento] =
  useState("");

  const [
  nuevaFechaSeguimiento,
  setNuevaFechaSeguimiento
] = useState(
  cita?.FechaSeguimiento
    ?.substring(0, 10) || ""
);

  const guardarSeguimiento = async () => {

  try {

    const response = await fetch(

      `${API_URL}/api/citas/${cita.IdCita}/seguimiento`,

      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          nota: notaSeguimiento,

          fechaSeguimiento:
            nuevaFechaSeguimiento

        })

      }

    );

    const data =
      await response.json();

   if (data.ok) {

  setNotaSeguimiento("");

  if (onActualizado) {

    await onActualizado();

  }

  setMensaje(
    "Seguimiento guardado correctamente."
  );

  setMensajeAbierto(true);

}

  } catch (error) {

    console.error(error);

  }

};



const cargarSeguimientos = async () => {

    try {

      const response =
        await fetch(

          `${API_URL}/api/citas/${cita.IdCita}/seguimientos`

        );

      const data =
        await response.json();

      if (data.ok) {

        setSeguimientos(
          data.seguimientos
        );

      }

    } catch (error) {

      console.error(error);

    }

};

useEffect(() => {

  if (
    abierto &&
    cita?.IdCita
  ) {

    cargarSeguimientos();

  }

}, [
  abierto,
  cita?.IdCita,
  cargarSeguimientos
]);

const finalizarSeguimiento = async () => {

  try {

    const response = await fetch(

      `${API_URL}/api/citas/${cita.IdCita}/finalizar`,

      {
        method: "PUT"
      }

    );

    const data =
      await response.json();

      console.log(data);

    if (data.ok) {

      if (onActualizado) {

        await onActualizado();

      }

      onCerrar();

    }

  } catch (error) {

    console.error(error);

  }

};

const iniciarDictado = () => {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    setMensaje(
      "El dictado por voz no está disponible en este dispositivo."
    );

    setMensajeAbierto(true);

    return;

  }

  const recognition =
    new SpeechRecognition();

  recognition.lang = "es-CO";

  recognition.continuous = false;

  recognition.interimResults = false;

  setEscuchando(true);

  recognition.start();

  recognition.onresult = (event) => {

    const texto =
      event.results[0][0].transcript;

    setNotaSeguimiento(
      (prev) =>
        prev
          ? `${prev} ${texto}`
          : texto
    );

  };

  recognition.onerror = (
  event
) => {

  if (
    event.error ===
    "not-allowed"
  ) {

    setMensaje(
      "El dictado por voz requiere una conexión segura (HTTPS). Estará disponible en la versión en la nube."
    );

  } else {

    setMensaje(
      `Error dictado: ${event.error}`
    );

  }

  setMensajeAbierto(true);

  setEscuchando(false);

};

};

  if (!abierto || !cita) return null;

  return (
    <>
    <div className="kp-modal-overlay">

      <div className="kp-modal">

        <h2>Detalle de la cita</h2>

        <p>
          <strong>Paciente:</strong>{" "}
          {cita.Nombres} {cita.Apellidos}
        </p>

        <p>
          <strong>Fecha:</strong>{" "}
          {
            cita.Fecha
              ?.substring(0, 10)
              .split("-")
              .reverse()
              .join("/")
          }
        </p>

        <p>
          <strong>Hora:</strong>{" "}
          {
            cita.Hora
              ?.substring(11, 16)
          }
        </p>

        <p>
          <strong>Estado:</strong>{" "}
          {cita.Estado}
        </p>

        <p>
          <strong>Motivo:</strong>
        </p>

        <div className="kp-detalle-box">
          {cita.Motivo || "Sin información"}
        </div>

        <p>
          <strong>Fecha seguimiento:</strong>{" "}
          {
            cita.FechaSeguimiento
              ? cita.FechaSeguimiento
                  .substring(0, 10)
                  .split("-")
                  .reverse()
                  .join("/")
              : "No aplica"
          }
        </p>

       {cita.Estado !== "SEGUIMIENTO" && (

  <>

    <p>
      <strong>Observaciones:</strong>
    </p>

    <div className="kp-detalle-box">
      {
        cita.Observaciones ||
        "Sin observaciones"
      }
    </div>

  </>

)}

<h3>
  📜 Historial de Seguimiento
</h3>

{seguimientos.length === 0 ? (

  <div className="kp-historial-vacio">

    Sin seguimientos registrados

  </div>

) : (

  <div className="kp-historial-lista">

    {seguimientos.map((item) => (

      <div
        key={item.IdSeguimiento}
        className="kp-seguimiento-card"
      >

        <div
          className="kp-seguimiento-fecha"
        >

          {
            new Date(
              item.Fecha
            ).toLocaleString(
              "es-CO"
            )
          }

        </div>

        <div className="kp-seguimiento-nota">

  {item.Nota.length > 80

    ? `${item.Nota.substring(
        0,
        80
      )}...`

    : item.Nota
  }

</div>

{item.Nota.length > 80 && (

  <button
    className="kp-btn-ver-nota"
    onClick={() => {

      setSeguimientoDetalle(
        item
      );

      setDetalleAbierto(true);

    }}
  >

    <img
      src={OjoDetalle}
      alt="Detalle"
      className="kp-btn-icon"
    />

    <span>
      Ver detalle
    </span>

  </button>

)}

      </div>

    ))}

  </div>

)}

<div className="kp-form-group">

  <label>
    Próxima fecha seguimiento
  </label>

  <input
    type="date"
    value={nuevaFechaSeguimiento}
    onChange={(e) =>
      setNuevaFechaSeguimiento(
        e.target.value
      )
    }
  />

</div>        

        

        {cita.Estado === "SEGUIMIENTO" && (

        <>

            <h3>
            Seguimiento
            </h3>

            <textarea className="kp-seguimiento-textarea"
            rows="4"
            value={notaSeguimiento}
            onChange={(e) =>
                setNotaSeguimiento(
                e.target.value
                )
            }
            placeholder="Agregar nota de seguimiento..."
            />

            <button
          className="kp-btn-dictado"
          onClick={iniciarDictado}
        >

          {escuchando
            ? "🎙 Escuchando..."
            : "🎤 Dictar"}

        </button>

        </>

        )}

        {cita.Estado === "SEGUIMIENTO" && (

        <div className="kp-seguimiento-actions">

            <button
  className="kp-btn-seguimiento"
  onClick={guardarSeguimiento}
>

  <img
    src={IconSeguimiento}
    alt="Seguimiento"
    className="kp-btn-icon"
  />

  <span>
    Guardar seguimiento
  </span>

</button>

            <button
              className="kp-btn-finalizar"
              onClick={finalizarSeguimiento}
            >
              ✔ Finalizar seguimiento
            </button>

        </div>

        )}

        <div className="kp-modal-actions">

          <button
            className="kp-btn-cancelar"
            onClick={onCerrar}
          >
            Cerrar
          </button>

        </div>

      </div>

    </div>

    {detalleAbierto &&
  seguimientoDetalle && (

  <div className="kp-modal-overlay">

    <div className="kp-modal">

      <h2>
        📜 Detalle del Seguimiento
      </h2>

      <p>

        <strong>
          Fecha:
        </strong>{" "}

        {
          new Date(
            seguimientoDetalle.Fecha
          ).toLocaleString(
            "es-CO"
          )
        }

      </p>

      <div
        className="kp-detalle-box"
      >

        {
          seguimientoDetalle.Nota
        }

      </div>

      <div className="kp-modal-actions">

        <button
          className="kp-btn-cancelar"
          onClick={() => {

            setDetalleAbierto(
              false
            );

            setSeguimientoDetalle(
              null
            );

          }}
        >

          Cerrar

        </button>

      </div>

    </div>

  </div>

)}

   <ConfirmModal
      abierto={mensajeAbierto}
      titulo="Seguimiento"
      mensaje={mensaje}
      textoConfirmar="Aceptar"
      textoCancelar=""
      onConfirmar={() =>
        setMensajeAbierto(false)
      }
      onCancelar={() =>
        setMensajeAbierto(false)
      }
    />

  </>      

  );

}

export default DetalleCitaModal;