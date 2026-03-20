import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./menu.css";

function Menu({ onLogout }){

  const location = useLocation();
  const menuRef = useRef(null);
  const [style, setStyle] = useState({ left: 0, width: 0 });

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

        <div className="menu-title">Kabala Pro</div>

        <NavLink to="/" end
          className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
          Generar Carta
        </NavLink>

        <NavLink to="/historial"
          className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
          Historial
        </NavLink>

        <NavLink to="/configuracion"
          className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
          Configuración
        </NavLink>

        {/* 🔥 barra deslizante */}
        <span
          className="menu-indicator"
          style={{
            left: style.left,
            width: style.width
          }}
        />

      </div>

      <div className="menu-right">
        <button className="menu-btn" onClick={onLogout}>
          Salir
        </button>
      </div>

    </div>

  );
}

export default Menu;