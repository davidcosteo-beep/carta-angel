function SplashScreen() {

  return (

    <div
      style={{

        width:"100%",
        height:"100vh",

        display:"flex",
        flexDirection:"column",

        justifyContent:"center",
        alignItems:"center",

        background:
        "linear-gradient(180deg, #f4ead7 0%, #ead8bb 50%, #e2c79f 100%)",

        overflow:"hidden"
      }}
    >

      <div
        style={{

          width:"140px",
          height:"140px",

          borderRadius:"50%",

          background:
          "radial-gradient(circle, rgba(255,230,170,0.95) 0%, rgba(201,150,70,0.85) 55%, rgba(120,70,20,0.18) 100%)",

          boxShadow:
          "0 0 45px rgba(255,210,120,0.45)",

          marginBottom:"28px"
        }}
      />

      <h1
        style={{

          fontFamily:"UnifrakturCook, cursive",

          fontSize:"52px",

          color:"#4d2d18",

          margin:0,

          textShadow:
          "0 2px 6px rgba(255,255,255,0.25)"
        }}
      >
        Kabala Pro
      </h1>

      <p
        style={{

          marginTop:"10px",

          color:"#7a5634",

          fontSize:"15px",

          letterSpacing:"1px"
        }}
      >
        Sistema Angelical
      </p>

    </div>

  );
}

export default SplashScreen;