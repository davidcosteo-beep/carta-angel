import { useState } from "react";

function Historial() {

  const [historial] = useState(() => {
    const datos = localStorage.getItem("historialCartas");
    return datos ? JSON.parse(datos) : [];
  });

  return (
    <div style={{ padding: "20px" }}>

      <h1>Historial de Cartas</h1>

      {historial.length === 0 && (
        <p>No hay cartas generadas aún.</p>
      )}

      {historial.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px"
          }}
        >

          <strong>{item.nombre}</strong>

          <p>Fecha nacimiento: {item.fecha}</p>

          <p>Hora: {item.hora}</p>

          <p>Ángel: {item.angel}</p>

          <p>Planeta: {item.planeta}</p>

        </div>
      ))}

    </div>
  );
}

export default Historial;