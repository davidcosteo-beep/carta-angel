import { useEffect, useRef, useState } from "react";
import "./menu.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import {
  PRIVATE_ROUTE_PERMISSIONS,
  canAccessRole
} from "../utils/permissions";
import { checkServerAvailable } from "../services/connectionService";
import { APP_VERSION } from "../config/appVersion";

const buildInfoModules = import.meta.glob(
  "../config/buildInfo.js",
  {
    eager: true
  }
);

const BUILD_DATE_TIME =
  buildInfoModules["../config/buildInfo.js"]
    ?.BUILD_DATE_TIME || "desarrollo";

function Menu({ onLogout }){

  const location = useLocation();
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuLinksRef = useRef(null);
  const [style, setStyle] = useState({ left: 0, width: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [
    mostrarAdvertenciaLogoutOffline,
    setMostrarAdvertenciaLogoutOffline
  ] = useState(false);
  const [verificandoLogout, setVerificandoLogout] =
    useState(false);
  const navigate = useNavigate();
  const userRole = getUserRole();
  const menuItems = [
    {
      key: "tecnico",
      label: "Panel Técnico",
      path: "/tecnico",
      allowedRoles: PRIVATE_ROUTE_PERMISSIONS.TECNICO
    },
    {
      key: "generar-carta",
      label: "Carta",
      path: "/generar-carta",
      allowedRoles: PRIVATE_ROUTE_PERMISSIONS.GENERAR_CARTA,
      resetGenerarCarta: true
    },
    {
      key: "pacientes",
      label: "Pacientes",
      path: "/pacientes",
      allowedRoles: PRIVATE_ROUTE_PERMISSIONS.PACIENTES
    },
    {
      key: "agenda",
      label: "Agenda",
      path: "/agenda",
      allowedRoles: PRIVATE_ROUTE_PERMISSIONS.AGENDA
    },
    {
      key: "historial",
      label: "Historial",
      path: "/historial",
      allowedRoles: PRIVATE_ROUTE_PERMISSIONS.HISTORIAL
    },
    {
      key: "configuracion",
      label: "Configuración",
      path: "/configuracion",
      allowedRoles: PRIVATE_ROUTE_PERMISSIONS.CONFIGURACION
    },
    {
      key: "usuarios",
      label: "Usuarios",
      path: "/usuarios",
      allowedRoles: PRIVATE_ROUTE_PERMISSIONS.USUARIOS
    }
  ];

  useEffect(() => {
    const animationFrameId = requestAnimationFrame(() => {
      const active = menuRef.current?.querySelector(".active");

      if(active){
        setStyle({
          left: active.offsetLeft,
          width: active.offsetWidth
        });
      } else {
        setStyle({
          left: 0,
          width: 0
        });
      }
    });

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [location, userRole]);

  useEffect(() => {
    if(!menuOpen){
      return;
    }

    const cerrarSiTocaFuera = (event) => {
      const target = event.target;

      if(
        menuLinksRef.current?.contains(target) ||
        menuButtonRef.current?.contains(target)
      ){
        return;
      }

      setMenuOpen(false);
    };

    document.addEventListener(
      "pointerdown",
      cerrarSiTocaFuera
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        cerrarSiTocaFuera
      );
    };
  }, [menuOpen]);

  const ejecutarLogout = () => {

    setMostrarAdvertenciaLogoutOffline(false);

    onLogout();

  };

  const handleLogoutClick = async () => {

    setMenuOpen(false);

    if (
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {

      setMostrarAdvertenciaLogoutOffline(true);

      return;

    }

    setVerificandoLogout(true);

    const serverAvailable =
      await checkServerAvailable();

    setVerificandoLogout(false);

    if (!serverAvailable) {

      setMostrarAdvertenciaLogoutOffline(true);

      return;

    }

    ejecutarLogout();

  };

  return(

    <div className="menu">

     <div className="menu-left" ref={menuRef}>

  <button
    ref={menuButtonRef}
    className="menu-mobile-btn"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    ☰
  </button>

  <div className="menu-brand">
  <div className="menu-title-row">
    <div className="menu-title">✦ Kabala Pro ✦</div>
    <span className="menu-version">v{APP_VERSION}</span>
  </div>
  <div className="menu-subtitle">Sistema Angelical</div>
</div>

  <div
    ref={menuLinksRef}
    className={`menu-links ${menuOpen ? "open" : ""}`}
  >

 {
  menuItems
    .filter((item) =>
      canAccessRole(
        userRole,
        item.allowedRoles
      )
    )
    .map((item) => (
      item.resetGenerarCarta ? (
        <div
          key={item.key}
          onClick={() => {

            window.dispatchEvent(
              new Event("reset-generar-carta")
            );

            navigate(item.path);

            setMenuOpen(false);

          }}
          className={
            location.pathname === item.path
              ? "menu-link active"
              : "menu-link"
          }
          style={{
            cursor:"pointer"
          }}
        >
          {item.label}
        </div>
      ) : (
        <NavLink
          key={item.key}
          to={item.path}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"}
        >
          {item.label}
        </NavLink>
      )
    ))
 }

    <div
  className="menu-link"
  onClick={handleLogoutClick}
  style={{
    cursor: verificandoLogout
      ? "wait"
      : "pointer",
    opacity: verificandoLogout ? 0.72 : 1
  }}
>
  {verificandoLogout ? "Verificando..." : "Cerrar sesión"}
</div>

  </div>

  <span
    className="menu-indicator"
    style={{
      left: style.left,
      width: style.width
    }}
  />

</div>

<div className="menu-build-info">
  Versión {APP_VERSION} · Compilado: {BUILD_DATE_TIME}
</div>

{mostrarAdvertenciaLogoutOffline && (
  <div
    className="kp-offline-modal-overlay"
    role="presentation"
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "rgba(26, 15, 8, 0.48)",
      boxSizing: "border-box"
    }}
  >
    <div
      className="kp-offline-modal-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-offline-title"
      style={{
        width: "100%",
        maxWidth: "430px",
        padding: "28px",
        borderRadius: "18px",
        border: "1px solid rgba(126, 81, 32, 0.26)",
        background: "rgba(255, 248, 230, 0.96)",
        boxShadow: "0 18px 52px rgba(20, 10, 4, 0.30)",
        textAlign: "center",
        color: "#3a1f12"
      }}
    >
      <h2
        id="logout-offline-title"
        style={{
          margin: "0 0 12px",
          fontFamily: "Cinzel, serif",
          fontSize: "24px",
          fontWeight: "700"
        }}
      >
        Advertencia offline
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
        Estas usando Kabala Pro sin conexion al servidor. Si cierras sesion ahora, no podras usar el modo offline hasta volver a iniciar sesion conectado al servidor.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <button
          type="button"
          onClick={() =>
            setMostrarAdvertenciaLogoutOffline(false)
          }
          style={{
            width: "100%",
            padding: "13px 18px",
            border: "1px solid rgba(126, 81, 32, 0.28)",
            borderRadius: "12px",
            background: "transparent",
            color: "#5c3b23",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={ejecutarLogout}
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
            boxShadow: "0 8px 18px rgba(90,50,20,0.20)"
          }}
        >
          Cerrar sesion de todos modos
        </button>
      </div>
    </div>
  </div>
)}

    </div>

  );
}

export default Menu;
