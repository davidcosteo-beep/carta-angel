import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import GenerarCarta from "./pages/GenerarCarta";
import Configuracion from "./pages/Configuracion";
import Historial from "./pages/Historial";

import Menu from "./components/Menu";

function App(){

  const [logueado, setLogueado] = useState(false);

  // 🌙 CARGAR TEMA GLOBAL
  useEffect(() => {
    const tema = localStorage.getItem("tema");

    if(tema === "dark"){
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  const auraAnimation = `
@keyframes auraGlow {
0%{
text-shadow:
0 2px 3px rgba(0,0,0,0.85),
0 0 8px rgba(255,215,140,0.6),
0 0 15px rgba(255,200,100,0.35);
}
50%{
text-shadow:
0 2px 3px rgba(0,0,0,0.85),
0 0 16px rgba(255,215,140,0.9),
0 0 28px rgba(255,200,100,0.6);
}
100%{
text-shadow:
0 2px 3px rgba(0,0,0,0.85),
0 0 8px rgba(255,215,140,0.6),
0 0 15px rgba(255,200,100,0.35);
}
}
`;

  if(!logueado){
    return <Login onLogin={setLogueado}/>
  }
  
  return(
    <>
    <style>{auraAnimation}</style>

    <BrowserRouter>

      <Menu onLogout={() => setLogueado(false)}/>

      <Routes>

        <Route path="/" element={<GenerarCarta/>} />

        <Route path="/configuracion" element={<Configuracion/>} />

        <Route path="/historial" element={<Historial/>} />

      </Routes>

    </BrowserRouter>

    </>
  )

}

export default App;