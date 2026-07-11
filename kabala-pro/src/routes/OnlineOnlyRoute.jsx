import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { checkServerAvailable } from "../services/connectionService";

export default function OnlineOnlyRoute({
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const [status, setStatus] =
    useState("checking");

  useEffect(() => {
    let active = true;

    if (!isOnline) {
      setStatus("blocked");

      return () => {
        active = false;
      };
    }

    setStatus("checking");

    const check = async () => {
      const available =
        await checkServerAvailable();

      if (!active) {
        return;
      }

      setStatus(
        available ? "allowed" : "blocked"
      );
    };

    check();

    return () => {
      active = false;
    };
  }, [isOnline, location.pathname]);

  if (status === "allowed") {
    return children;
  }

  if (status === "blocked") {
    return (
      <div
        className="online-only-modal-overlay"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background:
            "linear-gradient(180deg, #f4ead7 0%, #ead8bb 50%, #e2c79f 100%)",
          boxSizing: "border-box"
        }}
      >
        <div
          className="online-only-modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="online-only-title"
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "28px",
            borderRadius: "18px",
            border:
              "1px solid rgba(126, 81, 32, 0.24)",
            background:
              "rgba(255, 248, 230, 0.92)",
            boxShadow:
              "0 16px 42px rgba(90, 50, 20, 0.18)",
            textAlign: "center",
            color: "#3a1f12"
          }}
        >
          <h2
            id="online-only-title"
            style={{
              margin: "0 0 12px",
              fontFamily: "Cinzel, serif",
              fontSize: "24px",
              fontWeight: "700"
            }}
          >
            Disponible solo online
          </h2>

          <p
            style={{
              margin: "0 0 24px",
              fontFamily: "IM Fell English, serif",
              fontSize: "16px",
              lineHeight: "1.45",
              color: "#5c3b23"
            }}
          >
            Esta utilidad requiere conexion con el servidor. Puedes usar Generar Carta, Historial y Configuracion en modo offline.
          </p>

          <button
            type="button"
            onClick={() => {
              navigate("/", {
                replace: true
              });
            }}
            style={{
              width: "100%",
              padding: "13px 18px",
              border: "none",
              borderRadius: "12px",
              background:
                "linear-gradient(180deg, #8b5e34 0%, #6f4727 100%)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow:
                "0 8px 18px rgba(90,50,20,0.20)"
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "55vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        color: "#4b2b13",
        fontFamily: "IM Fell English, serif",
        textAlign: "center"
      }}
    >
      Verificando conexion con el servidor...
    </div>
  );
}
