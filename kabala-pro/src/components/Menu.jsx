import { useEffect, useRef, useState } from "react";
import "./menu.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

function Menu({ onLogout }){

  const location = useLocation();
  const menuRef = useRef(null);
  const [style, setStyle] = useState({ left: 0, width: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
 

  useEffect(() => {
    const active = menuRef.current.querySelector(".active");

    if(active){
      setStyle({
        left: active.offsetLeft,
        width: active.offsetWidth
      });
    }
  }, [location]);

  return(

    <div className="menu">

     <div className="menu-left" ref={menuRef}>

  <button
    className="menu-mobile-btn"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    ☰
  </button>

  <div className="menu-brand">
  <div className="menu-title">✦ Kabala Pro ✦</div>
  <div className="menu-subtitle">Sistema Angelical</div>
</div>

  <div className={`menu-links ${menuOpen ? "open" : ""}`}>

 <div
  onClick={() => {

  window.dispatchEvent(
    new Event("reset-generar-carta")
  );

  navigate("/");

  setMenuOpen(false);

}}

  className={
    location.pathname === "/"
      ? "menu-link active"
      : "menu-link"
  }

  style={{
    cursor:"pointer"
  }}
>
  Generar Carta
</div>

    <NavLink
      to="/pacientes"
      onClick={() => setMenuOpen(false)}  
      className={({ isActive }) =>
        isActive ? "menu-link active" : "menu-link"}>
      Pacientes
    </NavLink>

    <NavLink
      to="/agenda"
      onClick={() => setMenuOpen(false)} 
      className={({ isActive }) =>
        isActive ? "menu-link active" : "menu-link"}>
      Agenda
    </NavLink>

    <NavLink to="/historial"
      onClick={() => setMenuOpen(false)}
      className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
      Historial
    </NavLink>

    <NavLink to="/configuracion"
      onClick={() => setMenuOpen(false)}
      className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
      Configuración
    </NavLink>

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