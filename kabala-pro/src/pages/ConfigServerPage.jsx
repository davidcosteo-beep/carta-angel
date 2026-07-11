import { useState } from "react";
import { HEALTH_URL } from "../config/api";
import { testServerConnection } from "../services/connectionService";
import "./Login.css";

export default function ConfigServerPage({
  onVolver
}) {
  const [mensaje, setMensaje] =
    useState("");

  const [tipoMensaje, setTipoMensaje] =
    useState("");

  const [probando, setProbando] =
    useState(false);

  const currentOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "";

  const probarConexion = async () => {
    setProbando(true);
    setMensaje("");

    const resultado =
      await testServerConnection();

    setMensaje(resultado.message);
    setTipoMensaje(
      resultado.ok ? "success" : "error"
    );
    setProbando(false);
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
          Origen actual
        </label>

        <div className="input-group">
          <input
            type="text"
            value={currentOrigin || "No disponible"}
            readOnly
            className="login-input"
            style={{
              paddingLeft: "22px"
            }}
          />
        </div>

        <label className="login-label">
          Ruta de prueba
        </label>

        <div className="input-group">
          <input
            type="text"
            value={HEALTH_URL}
            readOnly
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

        {
          mensaje && (
            <div
              className={`login-message ${tipoMensaje}`}
            >
              {mensaje}
            </div>
          )
        }

        {onVolver && (
          <>
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
                Volver
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
