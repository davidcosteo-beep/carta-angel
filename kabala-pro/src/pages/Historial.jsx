import { useState } from "react";
import "./historial.css";
import { useNavigate } from "react-router-dom";

function Historial() {

   const ordenarHistorial = (datos) => {

    return datos.sort((a, b) => {

      if(a.favorito && !b.favorito)
        return -1;

      if(!a.favorito && b.favorito)
        return 1;

      return (
        new Date(b.fechaGeneracion || 0)
        - new Date(a.fechaGeneracion || 0)
      );

    });

  };

  const navigate = useNavigate();
  
  const [busqueda, setBusqueda] = useState("");

  const [filtro, setFiltro] =  useState("todas");

  const [cargandoCarta, setCargandoCarta] =
  useState(null);  

  const [seleccionadas, setSeleccionadas] =
  useState([]);

  const [historial, setHistorial] = useState(() => {

  const datos =
    localStorage.getItem("historialCartas");

  if(!datos) return [];

  const historialParseado =
    JSON.parse(datos);

return ordenarHistorial(
  historialParseado
);

});

const reabrirCarta = (item) => {

  setCargandoCarta(item.id);

  requestAnimationFrame(() => {

    setTimeout(() => {

      localStorage.setItem(
        "cartaTemporal",
        JSON.stringify(item)
      );

      navigate("/");

    }, 700);

  });

};

const toggleFavorito = (id) => {

  const historialActualizado =
    historial.map((item) => {

      if(item.id === id){

        return {

          ...item,

          favorito: !item.favorito
        };
      }

      return item;

    });

  localStorage.setItem(
    "historialCartas",
    JSON.stringify(historialActualizado)
  );

  setHistorial(
  ordenarHistorial(
    historialActualizado
  )
);
};

const eliminarCarta = (id) => {

  const confirmar = window.confirm(
    "¿Deseas eliminar esta carta del historial?"
  );

  if (!confirmar) return;

  const historialActualizado =
    historial.filter(
      (item) => item.id !== id
    );

  localStorage.setItem(
    "historialCartas",
    JSON.stringify(historialActualizado)
  );

  setHistorial(
    ordenarHistorial(historialActualizado)
  );

};

const toggleSeleccion = (id) => {

  if (seleccionadas.includes(id)) {

    setSeleccionadas(
      seleccionadas.filter(
        itemId => itemId !== id
      )
    );

  } else {

    setSeleccionadas([
      ...seleccionadas,
      id
    ]);

  }

};

const eliminarSeleccionadas = () => {

  if (seleccionadas.length === 0) {

    alert(
      "No hay cartas seleccionadas."
    );

    return;
  }

  const confirmar = window.confirm(
    `¿Eliminar ${seleccionadas.length} carta(s)?`
  );

  if (!confirmar) return;

  const historialActualizado =
    historial.filter(
      item =>
        !seleccionadas.includes(item.id)
    );

  localStorage.setItem(
    "historialCartas",
    JSON.stringify(historialActualizado)
  );

  setHistorial(
    ordenarHistorial(
      historialActualizado
    )
  );

  setSeleccionadas([]);

};

const eliminarTodoHistorial = () => {

  const confirmar = window.confirm(
    "¿Deseas eliminar TODO el historial?\n\nEsta acción no se puede deshacer."
  );

  if (!confirmar) return;

  localStorage.removeItem(
    "historialCartas"
  );

  setHistorial([]);

  setSeleccionadas([]);

};

const historialFiltrado =
  historial.filter((item) => {

    const texto = `
      ${item.nombre}
      ${item.angel}
      ${item.planeta}
    `.toLowerCase();

    const coincideBusqueda =
      texto.includes(
        busqueda.toLowerCase()
      );

    const coincideFavorito =

      filtro === "favoritas"
      ? item.favorito
      : true;

    return (
      coincideBusqueda &&
      coincideFavorito
    );

  });

const planetasVisuales = {

  Saturno: {
    simbolo: "♄",
    gradiente:
      "linear-gradient(180deg, #5c4b7a, #2d1f42)"
  },

  Luna: {
    simbolo: "☾",
    gradiente:
      "linear-gradient(180deg, #9bb7d4, #506d8a)"
  },

  Sol: {
    simbolo: "☉",
    gradiente:
      "linear-gradient(180deg, #f4c95d, #c88a12)"
  },

  Venus: {
    simbolo: "♀",
    gradiente:
      "linear-gradient(180deg, #d8a7b1, #9a5c67)"
  },

  Marte: {
    simbolo: "♂",
    gradiente:
      "linear-gradient(180deg, #c96b5c, #7a2d1f)"
  },

  Mercurio: {
    simbolo: "☿",
    gradiente:
      "linear-gradient(180deg, #8fd3c1, #3d7d6d)"
  },

  Júpiter: {
    simbolo: "♃",
    gradiente:
      "linear-gradient(180deg, #d7a86e, #8b5a2b)"
  },

  Neptuno: {
    simbolo: "♆",
    gradiente:
      "linear-gradient(180deg, #5da9e9, #1d4f7a)"
  },

  Urano: {
    simbolo: "♅",
    gradiente:
      "linear-gradient(180deg, #7ad7d0, #2b7a74)"
  }

};

  return (

<div className="page-transition">    

<div className="historial-page">

<div className="historial-container">

  <div className="kp-historial-header">

  <h1 className="historial-title">
    Historial
  </h1>

  <input
    type="text"
    placeholder="❈ Buscar carta..."
    value={busqueda}
    onChange={(e) =>
      setBusqueda(e.target.value)
    }
    className="kp-buscador-pacientes"
  />

</div>

<div className="historial-filtros">

  <button

    className={`filtro-btn ${
      filtro === "todas"
      ? "activo"
      : ""
    }`}

    onClick={() =>
      setFiltro("todas")
    }
  >
    Todas
  </button>

  <button

    className={`filtro-btn ${
      filtro === "favoritas"
      ? "activo"
      : ""
    }`}

    onClick={() =>
      setFiltro("favoritas")
    }
  >
    Favoritas
  </button>

  <button
  className="filtro-btn"

  onClick={eliminarSeleccionadas}
>
  Borrar Selec.
</button>

<button
  className="filtro-btn eliminar-todo-btn"

  onClick={eliminarTodoHistorial}
>
  Eliminar todo
</button>

</div>

  {historial.length === 0 && (

    <p className="historial-empty">
      No hay cartas generadas aún.
    </p>

  )}

  {historialFiltrado.map((item, index) => (

<div
  key={index}
  className={`historial-card ${
  cargandoCarta === item.id
    ? "historial-card-loading"
    : ""
}`}

  onClick={() => reabrirCarta(item)}
>

  <input
  type="checkbox"
  className="seleccion-checkbox"

  checked={seleccionadas.includes(item.id)}

  onClick={(e) => {
    e.stopPropagation();
  }}

  onChange={(e) => {
    e.stopPropagation();
    toggleSeleccion(item.id);
  }}
/>

  {(() => {

    const visual =
      planetasVisuales[item.planeta] || {

        simbolo: "✶",

        gradiente:
          "linear-gradient(180deg, #d8b07a, #8b5a2b)"
      };

    return (

      <div className="historial-header">

        <div
          className="historial-sello"

          style={{
            background: visual.gradiente
          }}
        >
          {visual.simbolo}
        </div>

        <div className="historial-info">

          <strong className="historial-name">
            {item.nombre}
          </strong>

          <p className="historial-angel">
            {item.angel}
          </p>

        </div>

         <button

    className={`favorito-btn ${
      item.favorito ? "activo" : ""
    }`}

    onClick={(e) => {

      e.stopPropagation();

      toggleFavorito(item.id);
    }}
  >
    ★
  </button>

  <button
  className="eliminar-btn"

  onClick={(e) => {

    e.stopPropagation();

    eliminarCarta(item.id);

  }}
>
  🗑
</button>

      </div>

    );

  })()}

      <p>
        Fecha nacimiento: {item.fecha}
      </p>

      <p>
        Hora: {item.hora}
      </p>

      <p>
        Planeta: {item.planeta}
      </p>

      <p>
      Generada:
      {" "}
      {new Date(item.fechaGeneracion)
        .toLocaleString()}
      </p>

    </div>

  ))}

</div>
</div>  
</div>
);
}

export default Historial;