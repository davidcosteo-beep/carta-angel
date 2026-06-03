import { useState } from "react";
import "./configuracion.css";

function Configuracion() {

  const [nombre, setNombre] = useState(() =>
    localStorage.getItem("nombreAngeologo") || ""
  );

  const [titulo, setTitulo] = useState(() =>
    localStorage.getItem("tituloAngeologo") || ""
  );

  const [mensaje, setMensaje] = useState("");

  const guardarConfiguracion = () => {

    localStorage.setItem(
      "nombreAngeologo",
      nombre
    );

    localStorage.setItem(
      "tituloAngeologo",
      titulo
    );

    setMensaje(
      "Configuración guardada correctamente."
    );

    setTimeout(() => {

      setMensaje("");

    }, 3000);

  };

  return (

    <div className="page-transition">

      <div className="config-page">

        <div className="config-wrapper">

          <h1 className="config-title">
            Configuración
          </h1>

          <div className="config-card">

            <h2 className="config-subtitle">
              Datos del Angeólogo
            </h2>

            <label>
              Nombre del Angeólogo
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
            />

            <label>
              Título
            </label>

            <input
              type="text"
              value={titulo}
              onChange={(e) =>
                setTitulo(e.target.value)
              }
            />

            <button onClick={guardarConfiguracion}>
  Guardar
</button>

{mensaje && (

  <div className="login-message success">
    {mensaje}
  </div>

)}

          </div>

        </div>

      </div>

    </div>

  );

}

export default Configuracion;