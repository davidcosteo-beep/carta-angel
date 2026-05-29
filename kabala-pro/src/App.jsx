import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import GenerarCarta from "./pages/GenerarCarta";
import Configuracion from "./pages/Configuracion";
import Historial from "./pages/Historial";
import ProtectedRoute from "./routes/ProtectedRoute";
import Menu from "./components/Menu";
import { isTokenValid } from "./utils/auth";


function App(){

  const [logueado, setLogueado] = useState(
  isTokenValid()
);

  const [mostrarSplash, setMostrarSplash] = useState(true);

  // 🌙 CARGAR TEMA GLOBAL
  useEffect(() => {
    const tema = localStorage.getItem("tema");

    if(tema === "dark"){
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  useEffect(() => {

  const timer = setTimeout(() => {

    setMostrarSplash(false);

  }, 7000);

  return () => clearTimeout(timer);

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

if(mostrarSplash){
  return <SplashScreen/>
}

  if(!logueado){

  return (

    <div className="page-transition">

      <Login onLogin={setLogueado}/>

    </div>

  );

}
  
  return(
    <>
    <style>{auraAnimation}</style>

    <BrowserRouter>

      <Menu
  onLogout={() => {

    localStorage.removeItem('token');

    setLogueado(false);

  }}
/>

      <Routes>

        <Route
  path="/"
  element={
    <ProtectedRoute>
      <GenerarCarta />
    </ProtectedRoute>
  }
/>

<Route
  path="/configuracion"
  element={
    <ProtectedRoute>
      <Configuracion />
    </ProtectedRoute>
  }
/>

<Route
  path="/historial"
  element={
    <ProtectedRoute>
      <Historial />
    </ProtectedRoute>
  }
/>

      </Routes>

    </BrowserRouter>

    </>
  )

}

export default App;