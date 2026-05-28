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

          <path
            d="
            M100 60
            C120 60 135 80 100 100
            C65 80 80 60 100 60

            M140 100
            C140 120 120 135 100 100
            C120 65 140 80 140 100

            M100 140
            C80 140 65 120 100 100
            C135 120 120 140 100 140

            M60 100
            C60 80 80 65 100 100
            C80 135 60 120 60 100
            "
          />

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