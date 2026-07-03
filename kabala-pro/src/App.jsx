import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import ConfigServerPage from "./pages/ConfigServerPage";
import GenerarCarta from "./pages/GenerarCarta";
import Configuracion from "./pages/Configuracion";
import Historial from "./pages/Historial";
import ProtectedRoute from "./routes/ProtectedRoute";
import Menu from "./components/Menu";
import { isTokenValid } from "./utils/auth";
import Pacientes from "./pages/Pacientes";
import Agenda from "./pages/Agenda";
import { PRIVATE_ROUTE_PERMISSIONS } from "./utils/permissions";

const SPLASH_SEEN_KEY = "kabala_splash_seen";

const hasSeenSplashInSession = () => {

  try {

    return sessionStorage.getItem(
      SPLASH_SEEN_KEY
    ) === "true";

  } catch {

    return false;

  }

};

const markSplashAsSeen = () => {

  try {

    sessionStorage.setItem(
      SPLASH_SEEN_KEY,
      "true"
    );

  } catch {

    // La app debe continuar aunque sessionStorage no esté disponible.

  }

};



function App(){

  const [logueado, setLogueado] = useState(
  isTokenValid()
);

  const [mostrarSplash, setMostrarSplash] = useState(
  () => !hasSeenSplashInSession()
);

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

  if (!mostrarSplash) {

    return;

  }

  const timer = setTimeout(() => {

    markSplashAsSeen();

    setMostrarSplash(false);

  }, 7000);

  return () => clearTimeout(timer);

}, [mostrarSplash]);

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

  return(

    <BrowserRouter>

      {!logueado ? (
        <PublicRoutes
          setLogueado={setLogueado}
        />
      ) : (
        <PrivateRoutes
          setLogueado={setLogueado}
          auraAnimation={auraAnimation}
        />
      )}

    </BrowserRouter>

  )

}

function PublicRoutes({
  setLogueado
}) {

  const navigate = useNavigate();

  return (

    <Routes>

      <Route
        path="/configurar-servidor"
        element={
          <div className="page-transition">

            <ConfigServerPage
              onVolver={() =>
                navigate("/")
              }
              onGuardado={() => {

                navigate("/");

                window.location.reload();

              }}
            />

          </div>
        }
      />

      <Route
        path="*"
        element={
          <div className="page-transition">

            <Login
              onLogin={setLogueado}
              onConfigServer={() =>
                navigate("/configurar-servidor")
              }
            />

          </div>
        }
      />

    </Routes>

  );

}

function PrivateRoutes({
  setLogueado,
  auraAnimation
}) {

  return(
    <>
    <style>{auraAnimation}</style>

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
    <ProtectedRoute
      allowedRoles={
        PRIVATE_ROUTE_PERMISSIONS.GENERAR_CARTA
      }
    >
      <GenerarCarta />
    </ProtectedRoute>
  }
/>

<Route
  path="/configuracion"
  element={
    <ProtectedRoute
      allowedRoles={
        PRIVATE_ROUTE_PERMISSIONS.CONFIGURACION
      }
    >
      <Configuracion />
    </ProtectedRoute>
  }
/>

<Route
  path="/historial"
  element={
    <ProtectedRoute
      allowedRoles={
        PRIVATE_ROUTE_PERMISSIONS.HISTORIAL
      }
    >
      <Historial />
    </ProtectedRoute>
  }
/>

<Route
  path="/pacientes"
  element={
    <ProtectedRoute
      allowedRoles={
        PRIVATE_ROUTE_PERMISSIONS.PACIENTES
      }
    >
      <Pacientes />
    </ProtectedRoute>
  }
/>

<Route
  path="/agenda"
  element={
    <ProtectedRoute
      allowedRoles={
        PRIVATE_ROUTE_PERMISSIONS.AGENDA
      }
    >
      <Agenda />
    </ProtectedRoute>
  }
/>

      </Routes>

    </>
  )

}

export default App;
