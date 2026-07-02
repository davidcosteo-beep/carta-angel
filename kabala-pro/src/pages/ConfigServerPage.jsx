import { useState } from "react";
import { getServerConfig, saveServerConfig } from "../utils/serverConfig";
import { testServerConnection } from "../services/connectionService";
import "./Login.css";

export default function ConfigServerPage({
  onVolver,
  onGuardado
}) {

  const config = getServerConfig();

  const [url, setUrl] = useState(
    config.apiUrl
  );

  const [mensaje, setMensaje] =
    useState("");

  const [tipoMensaje, setTipoMensaje] =
    useState("");

  const [probando, setProbando] =
    useState(false);

  const probarConexion = async () => {

    setProbando(true);

    setMensaje("");

    const resultado =
      await testServerConnection(url);

    setMensaje(resultado.message);

    setTipoMensaje(
      resultado.ok ? "success" : "error"
    );

    setProbando(false);

  };

  const guardarConfiguracion = () => {

    try {

      saveServerConfig(url);

      setMensaje(
        "Servidor guardado correctamente."
      );

      setTipoMensaje("success");

      setTimeout(() => {

        if (onGuardado) {

          onGuardado();

        }

      }, 500);

    } catch (error) {

      setMensaje(error.message);

      setTipoMensaje("error");

    }

  };

  return (

    <div className="login-container login-enter">

      <div className="login-card">

        <h1 className="login-title">
          Kabala Pro
        </h1>

        <div className="title-divider">

          <div className="divider-line" />

          <div className="divider-ornament">
            *
          </div>

          <div className="divider-line" />

        </div>

        <p className="login-subtitle">
          SERVIDOR API
        </p>

        <label className="login-label">
          URL del servidor
        </label>

        <div className="input-group">

          <input
            type="url"
            value={url}
            onChange={(e) =>
              setUrl(e.target.value)
            }
            placeholder="http://100.95.42.29:4000"
            className="login-input"
            style={{
              paddingLeft: "22px"
            }}
          />

        </div>

        <button
          type="button"
          className="login-btn"
          onClick={probarConexion}
          disabled={probando}
        >
          {
            probando
              ? "Probando..."
              : "Probar conexion"
          }
        </button>

        <button
          type="button"
          className="faceid-btn"
          onClick={guardarConfiguracion}
        >
          <span>
            Guardar servidor
          </span>
        </button>

        {
          mensaje && (

            <div
              className={`login-message ${tipoMensaje}`}
            >
              {mensaje}
            </div>

          )
        }

        <div className="face-divider">

          <div className="line" />

          <div className="flower">
            *
          </div>

          <div className="line" />

        </div>

        <button
          type="button"
          className="faceid-btn"
          onClick={onVolver}
        >
          <span>
            Volver al login
          </span>
        </button>

      </div>

    </div>

  );

}
