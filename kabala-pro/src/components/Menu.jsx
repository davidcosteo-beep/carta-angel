import { useEffect, useRef, useState } from "react";
import "./menu.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import {
  PRIVATE_ROUTE_PERMISSIONS,
  canAccessRole
} from "../utils/permissions";

function Menu({ onLogout }){

  const location = useLocation();
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuLinksRef = useRef(null);
  const [style, setStyle] = useState({ left: 0, width: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userRole = getUserRole();
  const menuItems = [
    {
      key: "generar-carta",
      label: "Generar Carta",
      path: "/",
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
  <div className="menu-title">✦ Kabala Pro ✦</div>
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
  onClick={() => {

    setMenuOpen(false);

    onLogout();

  }}
  style={{ cursor: "pointer" }}
>
  Salir
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

    </div>

  );
}

export default Menu;
