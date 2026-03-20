import { useState } from "react";
import "./configuracion.css";

function Configuracion() {

  const [nombre, setNombre] = useState(() => 
    localStorage.getItem("nombreAngeologo") || ""
  );

  const [titulo, setTitulo] = useState(() => 
    localStorage.getItem("tituloAngeologo") || ""
  );

  const guardarConfiguracion = () => {

    localStorage.setItem("nombreAngeologo", nombre);
    localStorage.setItem("tituloAngeologo", titulo);

    alert("Configuración guardada");
  };

  return (

   <div className="config-wrapper">

  <h1>Configuración</h1>

  <div className="config-card">

    <h2>Datos del Angeólogo</h2>

    <label>Nombre del Angeólogo</label>
    <input
      type="text"
      value={nombre}
      onChange={(e)=>setNombre(e.target.value)}
    />

    <label>Título</label>
    <input
      type="text"
      value={titulo}
      onChange={(e)=>setTitulo(e.target.value)}
    />

    <button onClick={guardarConfiguracion}>
      Guardar
    </button>

  </div>

</div>

  );

}

export default Configuracion;