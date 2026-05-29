import { useEffect, useState } from "react";

import "./SplashScreen.css";

function SplashScreen() {

  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => {

      setFadeOut(true);

    }, 5000);

    return () => clearTimeout(timer);

  }, []);

  return (

    <div
      className={fadeOut ? "splash fade-out" : "splash"}

      style={{

        width:"100%",
        height:"100vh",

        display:"flex",
        flexDirection:"column",

        justifyContent:"center",
        alignItems:"center",

        background:
        "radial-gradient(circle at top, #f4e6cf 0%, #e7d1ad 45%, #d9bc8f 100%)",

        overflow:"hidden",

        transition:
        "all 1.8s ease"
      }}
    >

      <div className="splash-symbol">

        <div className="ring ring-1"></div>

        <div className="ring ring-2"></div>

        <div className="ring ring-3"></div>

      <svg
        className="center-symbol"
        viewBox="0 0 200 200"
        >

        <g className="flower-group">

            <circle cx="100" cy="100" r="28" />

            <circle cx="100" cy="72" r="28" />
            <circle cx="124" cy="86" r="28" />
            <circle cx="124" cy="114" r="28" />
            <circle cx="100" cy="128" r="28" />
            <circle cx="76" cy="114" r="28" />
            <circle cx="76" cy="86" r="28" />

          </g>

      </svg>

      </div>

      <h1
        style={{

          fontFamily:"UnifrakturCook, cursive",

          fontSize:"52px",

          color:"#4d2d18",

          margin:0,

          textShadow:
          "0 2px 6px rgba(255,255,255,0.25)",

          transition:
          "all 1.8s ease"
        }}
      >
        Kabala Pro
      </h1>

      <p
        style={{

          marginTop:"10px",

          color:"#7a5634",

          fontSize:"15px",

          letterSpacing:"1px",

          transition:
          "all 1.8s ease"
        }}
      >
        Sistema Angelical
      </p>

    </div>

  );
}

export default SplashScreen;