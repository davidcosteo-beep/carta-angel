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

<div
style={{

minHeight:"100vh",

display:"flex",

alignItems:"center",

justifyContent:"center",

padding:"20px",

background:
"linear-gradient(180deg, #f4ead7 0%, #ead8bb 50%, #e2c79f 100%)"
}}
>

<div
style={{

width:"100%",

maxWidth:"460px",

background:"rgba(255,248,230,0.42)",

backdropFilter:"blur(6px)",

border:"1px solid rgba(120,90,40,0.16)",

borderRadius:"18px",

padding:"35px",

boxShadow:
"0 12px 30px rgba(90,50,20,0.12)"
}}
>

<h1
style={{

fontFamily:"UnifrakturCook, cursive",

fontSize:"42px",

color:"#4d2d18",

textAlign:"center",

marginBottom:"30px"
}}
>
Kabala Pro
</h1>

<input
type="text"

placeholder="Usuario"

value={usuario}

onChange={(e) => setUsuario(e.target.value)}

style={{

width:"100%",

padding:"12px 14px",

marginBottom:"18px",

borderRadius:"10px",

border:
"1px solid rgba(120,90,40,0.16)",

background:
"rgba(255,255,255,0.58)",

color:"#3a1f12",

backdropFilter:"blur(4px)",

boxShadow:
"inset 0 1px 3px rgba(90,50,20,0.05)",

outline:"none",

fontSize:"15px"
}}
/>

<input
type="password"

placeholder="Contraseña"

value={password}

onChange={(e) => setPassword(e.target.value)}

style={{

width:"100%",

padding:"12px 14px",

marginBottom:"22px",

borderRadius:"10px",

border:
"1px solid rgba(120,90,40,0.16)",

background:
"rgba(255,255,255,0.58)",

color:"#3a1f12",

backdropFilter:"blur(4px)",

boxShadow:
"inset 0 1px 3px rgba(90,50,20,0.05)",

outline:"none",

fontSize:"15px"
}}
/>

<button
onClick={handleLogin}

style={{

width:"100%",

padding:"14px",

background:
"linear-gradient(180deg, #7b5532 0%, #5f3f24 100%)",

color:"#fff",

border:"none",

borderRadius:"12px",

fontSize:"17px",

fontWeight:"600",

cursor:"pointer",

boxShadow:
"0 8px 18px rgba(90,50,20,0.25)",

transition:"all 0.25s ease"
}}
>
Iniciar sesión
</button>

</div>

</div>
);

}

export default Login;