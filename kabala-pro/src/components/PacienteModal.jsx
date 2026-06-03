import { useState, useEffect } from "react";
import "./PacienteModal.css";
import { API_URL } from "../config/api";

function PacienteModal({

  abierto,
  onCerrar,
  onPacienteGuardado,
  paciente

}) {

  const [formulario, setFormulario] = useState({

  nombres: "",
  apellidos: "",
  telefono: "",
  fechaNacimiento: "",
  horaNacimiento: "",
  observaciones: ""

});

  const [fechaPartes, setFechaPartes] = useState({

  dia: "",
  mes: "",
  anio: ""

});

const dias = (() => {

  const mes =
    parseInt(fechaPartes.mes || "1");

  const anio =
    parseInt(fechaPartes.anio || "2024");

  const cantidadDias =
    new Date(anio, mes, 0).getDate();

  return Array.from(

    { length: cantidadDias },

    (_, i) =>
      String(i + 1).padStart(2, "0")

  );

})();

const meses = Array.from(
  { length: 12 },
  (_, i) => String(i + 1).padStart(2, "0")
);

const anios = Array.from(
  { length: 100 },
  (_, i) => String(
    new Date().getFullYear() - i
  )
);

const [horaPartes, setHoraPartes] = useState({
  hora: "",
  minuto: "",
  periodo: ""
});

const [mensaje, setMensaje] = useState("");
const [tipoMensaje, setTipoMensaje] = useState("");

const horas = Array.from(
  { length: 12 },
  (_, i) => String(i + 1).padStart(2, "0")
);

const minutos = Array.from(
  { length: 60 },
  (_, i) => String(i).padStart(2, "0")
);


  const limpiarFormulario = () => {

  setFormulario({

    nombres: "",
    apellidos: "",
    telefono: "",
    fechaNacimiento: "",
    horaNacimiento: "",
    observaciones: ""

  });

};

useEffect(() => {

  if (!paciente) return;

  setFormulario({

    nombres:
      paciente.Nombres || "",

    apellidos:
      paciente.Apellidos || "",

    telefono:
      paciente.Telefono || "",

    fechaNacimiento: "",

    horaNacimiento: "",

    observaciones:
      paciente.Observaciones || ""

  });

  if (paciente.FechaNacimiento) {

    const fecha =
      new Date(
        paciente.FechaNacimiento
      );

    setFechaPartes({

      dia: String(
        fecha.getDate()
      ).padStart(2, "0"),

      mes: String(
        fecha.getMonth() + 1
      ).padStart(2, "0"),

      anio: String(
        fecha.getFullYear()
      )

    });

  }

}, [paciente]);

  if (!abierto) return null;

  const handleChange = (e) => {

    setFormulario({

      ...formulario,

      [e.target.name]: e.target.value

    });

  };

  const guardarPaciente = async () => {

    if (!formulario.nombres.trim()) {

  setMensaje(
    "Debe ingresar los nombres."
  );

  setTipoMensaje("error");

  return;

}

if (!formulario.apellidos.trim()) {

  setMensaje(
    "Debe ingresar los apellidos."
  );

  setTipoMensaje("error");

  return;

}

if (!formulario.telefono.trim()) {

  setMensaje(
    "Debe ingresar el teléfono."
  );

  setTipoMensaje("error");

  return;

}

if (
  !fechaPartes.dia ||
  !fechaPartes.mes ||
  !fechaPartes.anio
) {

  setMensaje(
    "Debe ingresar la fecha de nacimiento."
  );

  setTipoMensaje("error");

  return;

}

  try {

    const fechaNacimiento =
      `${fechaPartes.anio}-${fechaPartes.mes}-${fechaPartes.dia}`;

    let horaNacimiento = null;

    if (
      horaPartes.hora &&
      horaPartes.minuto &&
      horaPartes.periodo
    ) {

      horaNacimiento =
        `${horaPartes.hora}:${horaPartes.minuto} ${horaPartes.periodo}`;

    }

    const url = paciente

  ? `${API_URL}/api/pacientes/${paciente.IdPaciente}`

  : `${API_URL}/api/pacientes`;

const metodo = paciente

  ? "PUT"

  : "POST";

const response = await fetch(
  url,
  {
    method: metodo,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          nombres:
            formulario.nombres,

          apellidos:
            formulario.apellidos,

          telefono:
            formulario.telefono,

          fechaNacimiento,

          horaNacimiento,

          observaciones:
            formulario.observaciones

        })
      }
    );

    const data =
      await response.json();

    if (data.ok) {

      setMensaje("");
      setTipoMensaje("");
      limpiarFormulario();

      onCerrar();

      if (onPacienteGuardado) {

        await onPacienteGuardado();

      }

    }

  } catch (error) {

    console.error(
      "Error guardando paciente:",
      error
    );

  }

};



  return (

    <div className="pm-overlay">

      <div className="pm-modal">

        <h2>

  {paciente
    ? "❈ Editar Paciente ❈"
    : "❈ Registrar Paciente ❈"}

</h2>

        <div className="pm-divider">

        <div className="pm-divider-line"></div>

        <div className="pm-divider-ornament">
          ❈
        </div>

        <div className="pm-divider-line"></div>

      </div>

        <label className="pm-label">
          Nombres
        </label>
        <input
          type="text"
          name="nombres"
          value={formulario.nombres}
          onChange={handleChange}
        />

        <label className="pm-label">
          Apellidos
        </label>
        <input
          type="text"
          name="apellidos"
          value={formulario.apellidos}
          onChange={handleChange}
        />

        <label className="pm-label">
          Teléfono
        </label>
        <input
          type="text"
          name="telefono"
          value={formulario.telefono}
          onChange={handleChange}
        />

        <label className="pm-label">
        Fecha de Nacimiento
        </label>

        <div className="pm-fecha-row">

        <select
            value={fechaPartes.dia}
            onChange={(e) => {

            const dia = e.target.value;

            setFechaPartes(prev => ({
                ...prev,
                dia
            }));

            }}
        >
            <option value="">Día</option>

            {dias.map((d) => (

            <option key={d} value={d}>
                {d}
            </option>

            ))}

        </select>

        <select
            value={fechaPartes.mes}
            onChange={(e) => {

            const mes = e.target.value;

            setFechaPartes(prev => ({
                ...prev,
                mes
            }));

            }}
        >
            <option value="">Mes</option>

            {meses.map((m) => (

            <option key={m} value={m}>
                {m}
            </option>

            ))}

        </select>

        <select
            value={fechaPartes.anio}
            onChange={(e) => {

            const anio = e.target.value;

            setFechaPartes(prev => ({
                ...prev,
                anio
            }));

            }}
        >
            <option value="">Año</option>

            {anios.map((a) => (

            <option key={a} value={a}>
                {a}
            </option>

            ))}

        </select>

        </div>

        
<div className="pm-label">
Hora de Nacimiento
<span
className="pm-opcional">
(Opcional)
</span>
</div>

<div className="pm-fecha-row">

  <select
    value={horaPartes.hora}
    onChange={(e) =>
      setHoraPartes({
        ...horaPartes,
        hora: e.target.value
      })
    }
  >

    <option value="">Hora</option>

    {horas.map((h) => (

      <option key={h} value={h}>
        {h}
      </option>

    ))}

  </select>

  <select
    value={horaPartes.minuto}
    onChange={(e) =>
      setHoraPartes({
        ...horaPartes,
        minuto: e.target.value
      })
    }
  >

    <option value="">Min</option>

    {minutos.map((m) => (

      <option key={m} value={m}>
        {m}
      </option>

    ))}

  </select>

  <select
    value={horaPartes.periodo}
    onChange={(e) =>
      setHoraPartes({
        ...horaPartes,
        periodo: e.target.value
      })
    }
  >

    <option value="">A.M / P.M</option>

    <option value="AM">
      AM
    </option>

    <option value="PM">
      PM
    </option>

  </select>

</div>

        <label className="pm-label">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          placeholder="Observaciones opcionales"
          value={formulario.observaciones}
          onChange={handleChange}
        />

        {mensaje && (

  <div
    className={`login-message ${tipoMensaje}`}
  >
    {mensaje}
  </div>

)}

        <div className="pm-botones">

          <button
            className="pm-cancelar"
            onClick={() => {

                limpiarFormulario();

                onCerrar();

            }}
            >
            Cancelar
            </button>

          <button
  className="pm-guardar"
  onClick={guardarPaciente}
>
  {paciente
    ? "Actualizar"
    : "Guardar"}
</button>

        </div>

      </div>

    </div>

  );

}

export default PacienteModal;