import { useState } from "react";

function Login({ onLogin }) {

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    if (usuario === "admin" && password === "1234") {
      onLogin(true);
    } else {
      alert("Usuario o contraseña incorrectos");
    }

  };

  return (
    <div style={{ padding: "40px" }}>

      <h1>Kabala Pro</h1>

      <input
        type="text"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>
        Iniciar sesión
      </button>

    </div>
  );

}

export default Login;