import { useState } from "react";
import pergamino from "../assets/pergamino.png";
import florVida from "../assets/flor-vida.png";
import texturaPapel from "../assets/texturaPapel.png";
import { tablaMentor } from "../core/tablaMentor";
import { tablaCartas } from "../core/tablaCartas";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


function CartaAngel({ carta }) {

const auraColor = (hex, alpha) => {
  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);
  return `rgba(${r},${g},${b},${alpha})`;
};  

const [modoPDF, setModoPDF] = useState(false);  

if (!carta) return null;

const datosMentor = Object.values(tablaMentor).find(
  m => m.mentor.toLowerCase() === carta.mentor.toLowerCase()


);
const nombreAngeologo = localStorage.getItem("nombreAngeologo") || "Nombre del Angeólogo";
const tituloAngeologo = localStorage.getItem("tituloAngeologo") || "Título del Angeólogo";

const colorGuardian = carta.color;
const colorMentor = datosMentor?.colorMentor;
const colorGuia = datosMentor?.colorGuia;
const colorDia = datosMentor?.colorDia;
const nombreColorGuardian = tablaCartas[carta.numero]?.colorNombre;
const mensajeAngel = tablaCartas[carta.numero]?.mensaje;


const nombreColorMentor = datosMentor?.colorNombreMentor;
const nombreColorGuia = datosMentor?.colorNombreGuia;
const nombreColorDia = datosMentor?.colorNombreDia;


/* función para decidir color del texto */
const colorTexto = (hex) => {

  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);

  const brillo = (r*299 + g*587 + b*114) / 1000;

  return brillo > 160 ? "#111827" : "#FFFFFF";

};

function hexToRGBA(hex, alpha = 0.45) {

  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);

  return `rgba(${r},${g},${b},${alpha})`;

}

const auraGuardian1 = hexToRGBA(colorGuardian, 0.55);
const auraGuardian2 = hexToRGBA(colorGuardian, 0.35);



const descargarPDF = async () => {

setModoPDF(true);
await new Promise(r => setTimeout(r, 100));

  const elemento = document.getElementById("pdfArea");
  if (!elemento) return;

  // 🔥 activar modo PDF
  elemento.classList.add("pdf-mode");

  // 🔥 esperar a que el DOM aplique estilos
  await new Promise(r => setTimeout(r, 100));

  const canvas = await html2canvas(elemento,{
    scale:3,
    useCORS:true,
    backgroundColor:null
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation:"portrait",
    unit:"px",
    format:[canvas.width, canvas.height]
  });

  pdf.addImage(imgData,"PNG",0,0,canvas.width,canvas.height);

  const nombreArchivo = `${carta.nombre}_${carta.fecha}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g,"_");

  pdf.save(`${nombreArchivo}.pdf`);

  // 🔥 limpiar modo PDF
  elemento.classList.remove("pdf-mode");

  setModoPDF(false);
};

const tamañoNombre =
carta.nombre.length > 35 ? "32px" :
carta.nombre.length > 28 ? "36px" :
"40px";

return (

<div>

<div id="pdfArea">


<div
id="cartaPDF"
className="cartaPDF"
style={{

backgroundColor:"#efe3c4",  

backgroundImage:`
radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.22) 100%),
radial-gradient(circle at center,
rgba(255,255,255,0.12) 0%,
rgba(255,255,255,0.04) 40%,
rgba(0,0,0,0.05) 70%),
url(${pergamino}),
url(${texturaPapel})
`,

backgroundSize:"100%  100%",
backgroundPosition:"center bottom",
backgroundRepeat:"no-repeat",
padding:"60px 85px 140px 85px",
minHeight:"1150px",

boxShadow:`
0 10px 30px rgba(0,0,0,0.25),
inset 0 0 40px rgba(80,60,30,0.35),
inset 0 -35px 60px rgba(80,60,30,0.28)
`,

borderRadius:"18px",

width:"100%",
maxWidth:"900px",
overflow:"hidden",
display:"block",

color:"#2a1a0f",
margin:"auto",

fontFamily:"IM Fell English, serif",
fontWeight:"600",
letterSpacing:"0.2px"

}}
>

{/* CABECERA */}

<div style={{marginBottom:"2px"}}>

<div style={{

fontFamily:"Almendra Display, serif",
fontSize:tamañoNombre,
fontWeight:"700",
letterSpacing:"3px",
textAlign:"center",

color:"#3a1f12",

textShadow:`
0 0 2px rgba(255,210,120,0.65),
0 1px 0 rgba(255,255,255,0.5),
0 3px 6px rgba(0,0,0,0.35),
0 0 18px rgba(255,210,120,0.45)
`,

background:"radial-gradient(circle at top, rgba(255,220,140,0.35) 0%, rgba(255,220,140,0.15) 35%, rgba(255,220,140,0) 70%)",

padding:"10px 20px",
borderRadius:"10px",

marginTop:"90px",
marginBottom:"4px",
lineHeight:"1.25"

}}>
{carta.nombre}
</div>

<div
style={{
background:"rgba(255,255,255,0.10)",
border:"1px solid rgba(80,60,30,0.2)",
fontFamily:"IM Fell English, serif",
letterSpacing:"1px",
padding:"4px 10px",
textAlign:"center",
borderRadius:"8px",
fontSize:"20px"
}}
>
Nacimiento: {carta.fecha} | Día: {carta.diaNacimiento} | Hora: {carta.hora} | Signo: {carta.signo}
</div>

</div>


{/* ANGEL DE LA GUARDA */}

<div style={{
borderRadius:"8px",
background:"rgba(255,255,255,0.10)",
border:"1px solid rgba(80,60,30,0.2)",
marginBottom:"18px"
}}>

<div style={{
background:`linear-gradient(90deg, ${colorGuardian}, #111827)`,
color: colorTexto(colorGuardian),
padding:"8px",
fontWeight:"600",
fontFamily:"IM Fell English, serif",
textAlign:"center",
letterSpacing:"3px"
}}>
ANGEL DE LA GUARDA
</div>


<div style={{
display:"grid",
gridTemplateColumns:"220px 1fr",
gap:"25px",
padding:"15px"
}}>


{/* IMAGEN */}

<div style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
position:"relative"
}}>

<div style={{
  position:"absolute",
  width:"520px",
  height:"560px",
  borderRadius:"50% / 60%",
  background: modoPDF
    ? "radial-gradient(circle, rgba(255,200,120,0.4) 0%, transparent 70%)"
    : "none",
  zIndex:0
}}/>  

<div
  className="auraAngel"
  style={{
    position:"absolute",
    width: modoPDF ? "420px" : "380px",
    height: modoPDF ? "460px" : "420px",
    borderRadius:"50% / 60%",

   background: modoPDF
  ? `
    radial-gradient(circle,
      ${auraColor(colorGuardian, 0.45)} 0%,
      ${auraColor(colorGuardian, 0.25)} 20%,
      ${auraColor(colorGuardian, 0.18)} 40%,
      ${auraColor(colorGuardian, 0.10)} 60%,
      ${auraColor(colorGuardian, 0.05)} 75%,
      rgba(0,0,0,0) 90%
    )
  `
  : `
    radial-gradient(circle,
      ${auraColor(colorGuardian, 0.65)} 0%,
      ${auraColor(colorGuardian, 0.35)} 35%,
      ${auraColor(colorGuardian, 0.15)} 55%,
      rgba(0,0,0,0) 70%
    )
  `,

    filter: modoPDF ? "none" : "blur(35px)",
    mixBlendMode: modoPDF ? "normal" : "screen",

    opacity: modoPDF ? 0.85 : 0.85,
    

    zIndex:"1"
  }}
/>

<img
src={`/angeles/${carta.angel.toLowerCase()}.webp`}
alt={carta.angel}
style={{

maxHeight:"280px",
width:"auto",

position:"relative",
zIndex:"2",

WebkitMaskImage:"radial-gradient(ellipse, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
maskImage:"radial-gradient(ellipse, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",

 filter: `
  drop-shadow(0 12px 18px rgba(0,0,0,0.45))
  drop-shadow(0 0 45px ${auraGuardian1})
  drop-shadow(0 0 90px ${auraGuardian2})
`


}}
/>

</div>


{/* TEXTO */}

<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"3px 12px",
fontSize:"17px",
fontFamily:"IM Fell English, serif",
lineHeight:"1.3",
textAlign:"justify",
letterSpacing:"0.5px",

color:"#3a2f1d",

mixBlendMode:"multiply",
opacity:0.92,
filter:"contrast(0.95)",

textShadow:`
0 1px 0 #f7edd6,
0 -1px 0 #8a6f45,
0 0 2px rgba(0,0,0,0.15)
`
}}
>

<p style={{margin:"1px 0"}}>
<span className="grabado">Número:</span> {carta.numero}
</p>

<p style={{margin:"1px 0"}}>
<span className="grabado">Ángel:</span> {carta.angel}
</p>

<p style={{margin:"1px 0"}}>
<span className="grabado">Color:</span> {nombreColorGuardian}
</p>

<p style={{margin:"1px 0"}}>
<span className="grabado">Planeta:</span> {carta.planeta}
</p>

<p style={{margin:"1px 0"}}>
<span className="grabado">Coro angelical:</span> {carta.coroAngelical}
</p>

<p style={{margin:"1px 0"}}>
<span className="grabado">Aroma:</span> {carta.aroma}
</p>

<p style={{margin:"1px 0"}}>
<span className="grabado">Talismán:</span> {carta.talisman}
</p>

<p style={{margin:"1px 0"}}>
<span className="grabado">Atributo:</span> {carta.atributo}
</p>

<p style={{margin:"1px 0"}}>
<span className="grabado">Ofrenda:</span> {carta.ofrenda}
</p>

<p style={{margin:"1px 0", whiteSpace:"nowrap"}}>
<span className="grabado">Hora canalización:</span> {carta.horaCanalizacion}
</p>

<p style={{
gridColumn:"1 / span 2",
margin:"4px 0",
fontSize:"16px",
lineHeight:"1.35"
}}>
<span className="grabado">Se canaliza para:</span> {carta.seCanalizaPara}
</p>

<p style={{
gridColumn:"1 / span 2",
margin:"4px 0",
fontSize:"16px",
lineHeight:"1.35"
}}>
<span className="grabado">Don del ser de luz:</span> {carta.donSerDeLuz}
</p>

</div>

</div>

</div>

<div style={{
height:"2px",
background:`linear-gradient(90deg, transparent, ${colorGuardian}, transparent)`,
boxShadow:`0 0 8px ${colorGuardian}66`,
margin:"28px 0"
}}></div>

{/* ANGEL MENTOR */}

<div style={{border:"1px solid #ddd",marginBottom:"18px"}}>

<div style={{
background:`linear-gradient(90deg, ${colorMentor}, #111827)`,
color: colorTexto(colorGuardian),
padding:"8px",
fontWeight:"600",
fontFamily:"IM Fell English, serif",
textAlign:"center",
letterSpacing:"3px"
}}>
ANGEL MENTOR
</div>

<div style={{
padding:"18px 12px 18px 26px",
display:"grid",
background:"rgba(255,248,220,0.18)",
border:"1px solid rgba(80,60,30,0.2)",
gridTemplateColumns:"1fr 260px",
gap:"24px",
alignItems:"center"
}}>


<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"6px 22px",

fontSize:"16px",
fontFamily:"IM Fell English, serif",
letterSpacing:"0.5px",

lineHeight:"1.25",
paddingLeft:"10px",

color:"#3d2b1f",

mixBlendMode:"multiply",

textShadow:`
0 1px 0 #f7edd6,
0 -1px 0 #8a6f45,
0 0 2px rgba(0,0,0,0.15)
`
}}>

<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Mentor:</b> {carta.mentor}</p>
<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Color:</b> {nombreColorMentor}</p>
<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Código Sagrado:</b> {carta.mentorCodigo}</p>

<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Planeta:</b> {carta.planetaMentor}</p>
<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Atributo:</b> {carta.atributoMentor}</p>

<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Aroma:</b> {carta.aromaMentor}</p>
<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Gracia:</b> {carta.graciaMentor}</p>


<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Gemas:</b> {carta.gemasMentor}</p>
<p style={{margin:"2px 0"}}><b style={{color:"#4a3720"}}>Se canaliza para:</b> {carta.canalizacionMentor}</p>

<p style={{gridColumn:"1 / span 2", margin:"2px 0"}}>
<b style={{color:"#4a3720"}}>Don:</b> {carta.donMentor}
</p>

</div>


<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"flex-start"
}}>

<div style={{
display:"flex",
justifyContent:"flex-end",
alignItems:"center",
position:"relative",
marginTop:"6px"
}}>

  <div style={{
position:"absolute",
width:"260px",
height:"260px",
background: modoPDF
  ? `
    radial-gradient(circle,
      ${auraColor(colorMentor, 0.25)} 0%,
      ${auraColor(colorMentor, 0.18)} 35%,
      ${auraColor(colorMentor, 0.10)} 55%,
      ${auraColor(colorMentor, 0.05)} 75%,
      rgba(0,0,0,0) 100%
    )
  `
  : `
    radial-gradient(circle,
      ${auraColor(colorMentor, 0.45)} 0%,
      ${auraColor(colorMentor, 0.25)} 40%,
      ${auraColor(colorMentor, 0.12)} 65%,
      rgba(0,0,0,0) 80%
    )
  `,
filter:"blur(14px)",
zIndex:0
}}/>

 <img
  src={`/mentores/${carta.mentor.toLowerCase()}.webp`}
  alt={carta.mentor}
  style={{
    position:"relative",
    zIndex:1,

    width:"260px",
    height:"260px",
    maxWidth:"260px",
    objectFit:"contain",

    // 🔥 SOLO aplicar máscara en APP
    WebkitMaskImage: modoPDF ? "none" : `
      radial-gradient(ellipse 75% 90% at center, black 75%, transparent 100%),
      linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)
    `,
    maskImage: modoPDF ? "none" : `
      radial-gradient(ellipse 75% 90% at center, black 75%, transparent 100%),
      linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)
    `,

    // 🔥 SOMBRA DIFERENTE PARA PDF
    filter: modoPDF
      ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
      : "drop-shadow(0 12px 18px rgba(0,0,0,0.35))",

    background:"transparent"
  }}
/>
 

</div>

</div>

</div>

</div>

<div style={{
height:"2px",
background:`linear-gradient(90deg, transparent, ${colorMentor}, transparent)`,
boxShadow:`0 0 8px ${colorMentor}66`,
margin:"28px 0"
}}></div>


{/* INFLUENCIAS ANGELICALES */}

<div style={{
borderRadius:"8px",
background:"rgba(255,255,255,0.10)",
border:"1px solid rgba(80,60,30,0.2)",
marginBottom:"18px"
}}>

<div style={{
background:`linear-gradient(90deg, ${colorGuia}, #111827)`,
color: colorTexto(colorDia),
padding:"8px",
fontWeight:"600",
fontFamily:"IM Fell English, serif",
textAlign:"center",
letterSpacing:"3px"
}}>
INFLUENCIAS ANGELICALES
</div>

<div style={{
padding:"18px",
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:"15px",

fontSize:"16px",
fontFamily:"IM Fell English, serif",
letterSpacing:"0.5px",
lineHeight:"1.25",

color:"#3d2b1f",
mixBlendMode:"multiply",

textShadow:`
0 1px 0 #f7edd6,
0 -1px 0 #8a6f45,
0 0 2px rgba(0,0,0,0.15)
`
}}>

<div>
<p style={{margin:"2px 0"}}><b>Ángel guía:</b> {carta.angelGuia}</p>
<p style={{margin:"2px 0"}}><b>Color:</b> {nombreColorGuia}</p>
<p style={{margin:"2px 0"}}><b>Significado:</b> {carta.significado}</p>
</div>

<div>
<p style={{margin:"2px 0"}}><b>Ángel por mes:</b> {carta.angelMes}</p>
<p style={{margin:"2px 0"}}><b>Ángel por signo:</b> {carta.angelSigno}</p>
</div>

<div>
<p style={{margin:"2px 0"}}><b>Ángel por día:</b> {carta.angelDia}</p>
<p style={{margin:"2px 0"}}><b>Color:</b> {nombreColorDia}</p>
<p style={{margin:"2px 0"}}><b>Ángel por hora:</b> {carta.angelHora}</p>
<p style={{margin:"2px 0"}}><b>Ángel por año:</b> {carta.angelAnio}</p>
</div>

</div>

</div>

<div style={{
height:"2px",
background:`linear-gradient(90deg, transparent, ${colorGuia}, transparent)`,
boxShadow:`0 0 8px ${colorGuia}66`,
margin:"28px 0"
}}></div>

{/* ESENCIAS */}

<div style={{
borderRadius:"8px",
background:"rgba(255,255,255,0.10)",
border:"1px solid rgba(80,60,30,0.2)",
}}>

<div style={{
background:`linear-gradient(90deg, ${colorDia}, #111827)`,
color:"white",
padding:"8px",
fontWeight:"600",
fontFamily:"IM Fell English, serif",
textAlign:"center",
letterSpacing:"3px"
}}>
ESENCIAS LOCION ANGELICAL
</div>

<div style={{
display:"grid",
gridTemplateColumns:"200px 1fr",
gap:"20px",
padding:"18px"
}}>


<div style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
position:"relative"
}}>

 <div
  style={{
    position:"absolute",

    width: modoPDF ? "200px" : "180px",
    height: modoPDF ? "200px" : "180px",

    borderRadius:"50%",

    background: modoPDF
      ? `
        radial-gradient(circle,
          rgba(255,210,120,0.45) 0%,
          rgba(255,190,90,0.25) 40%,
          rgba(255,170,60,0.12) 65%,
          rgba(255,150,40,0.05) 80%,
          rgba(0,0,0,0) 100%
        )
      `
      : `
        radial-gradient(circle,
          rgba(255,210,120,0.6) 0%,
          rgba(255,190,90,0.35) 40%,
          rgba(255,170,60,0.18) 65%,
          rgba(0,0,0,0) 80%
        )
      `,

    filter: modoPDF ? "none" : "blur(18px)",
    mixBlendMode: modoPDF ? "normal" : "screen",

    opacity: modoPDF ? 0.7 : 0.9,

    zIndex:0
  }}
/> 

<div style={{
  position:"absolute",
  width:"180px",
  height:"180px",
  borderRadius:"50%",

  background: modoPDF
  ? `
    radial-gradient(circle,
      rgba(255,240,180,0.9) 0%,
      rgba(255,220,150,0.6) 25%,
      rgba(255,200,100,0.35) 45%,
      rgba(255,180,80,0.15) 65%,
      rgba(255,150,60,0.05) 80%,
      rgba(255,120,40,0) 100%
    )
  `
  : `
    radial-gradient(circle,
      rgba(255,215,120,0.5) 0%,
      rgba(255,200,100,0.3) 35%,
      rgba(255,180,80,0.15) 55%,
      rgba(255,150,60,0.05) 70%,
      rgba(255,120,40,0) 100%
    )
  `,

  filter: modoPDF ? "none" : "blur(18px)",
  opacity: 1,
  zIndex:1
}}/>

<img
src={`/signos/${carta.signo.toLowerCase()}.webp`}
alt={carta.signo}
style={{
width:"140px",

maskImage:"radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
WebkitMaskImage:"radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",

filter: modoPDF
  ? `
    drop-shadow(0 0 12px rgba(255,215,120,0.9))
    drop-shadow(0 0 22px rgba(255,200,100,0.7))
  `
  : `
    drop-shadow(0 0 18px rgba(255,215,120,0.9))
    drop-shadow(0 0 35px rgba(255,215,120,0.6))
    drop-shadow(0 0 60px rgba(255,215,120,0.4))
  `,

transform: modoPDF ? "scale(1.08)" : "scale(1)",

position:"relative",
zIndex:2,

}}
/>

</div>


<div style={{
padding:"18px",
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"6px 14px",

fontSize:"16px",
fontFamily:"IM Fell English, serif",
letterSpacing:"0.4px",
lineHeight:"1.15",

color:"#3d2b1f",
mixBlendMode:"multiply",

textShadow:`
0 1px 0 #f7edd6,
0 -1px 0 #8a6f45,
0 0 2px rgba(0,0,0,0.15)
`
}}>

<p style={{margin:"2px 0"}}><b>Esencia por signo:</b> {carta.esenciaSigno}</p>
<p style={{margin:"2px 0"}}><b>Esencia por mes:</b> {carta.esenciaMes}</p>

<p style={{margin:"2px 0"}}><b>Esencia por día:</b> {carta.esenciaDia}</p>
<p style={{margin:"2px 0"}}><b>Esencia mentor:</b> {carta.esenciaMentor}</p>

<p style={{margin:"2px 0"}}><b>Esencia ángel guarda:</b> {carta.esenciaAngelGuarda}</p>

<p style={{gridColumn:"1 / span 2", margin:"2px 0"}}>
<b>Sirve para:</b> {carta.sirvePara}
</p>

</div>

</div>

</div>

<div style={{textAlign:"center", marginTop:"25px"}}>


{mensajeAngel && (

<>
<div style={{

maxWidth:"794px",
margin:"0px auto",
padding:"18px 30px",

background:"rgba(255,255,255,0.10)",

borderRadius:"8px",

fontFamily:"IM Fell English, serif",
fontSize:"20px",

textAlign:"center",
lineHeight:"1.5",

color:"#3a2a18",

boxShadow:"0 6px 18px rgba(0,0,0,0.15)",
border:"1px solid rgba(120,90,40,0.35)",

display:"flex",
flexDirection:"column",
justifyContent:"center"

}}>

<div style={{
fontSize:"14px",
letterSpacing:"3px",
marginBottom:"6px",
color:"#2a1a0f"
}}>
PROPOSITO DEL ÁNGEL DE LA GUARDA
</div>

<div style={{
fontFamily:"Almendra Display, serif",
fontSize:"26px",
fontStyle:"italic",
fontWeight:"600",
lineHeight:"1.5",
letterSpacing:"0.3",
color:"#2a1a0f"

}}>
“{mensajeAngel}”
</div>

</div>

</>

)}  

</div>

</div>

<div style={{

marginTop:"-135px",
paddingTop:"10px",
maxWidth:"794px",
marginLeft:"auto",
marginRight:"auto",
width:"70%",

borderTop:`1px solid rgba(120,90,400,0.35)`,
borderRadius:"8px",

textAlign:"center",

fontFamily:"IM Fell English, serif",
fontSize:"15px",
letterSpacing:"1px",

opacity:"0.9"

}}>

<div
className="firmaAngelologo"
style={{

textAlign:"center",

marginTop:"1px",
paddingTop:"10px",
paddingBottom:"12px",

borderTop:"1px solid rgba(120,90,40,0.35)",

background:"rgba(255,248,230,0.10)",

borderRadius:"8px",

width:"70%",
marginLeft:"auto",
marginRight:"auto"

}}
>

<div style={{ marginTop:"30px", textAlign:"center" }}>

{(nombreAngeologo?.trim() && tituloAngeologo?.trim()) ? (

  <>
    <div style={{
      fontWeight:"600",
      marginBottom:"4px",
      letterSpacing:"1px"
    }}>
      Angeólogo
    </div>

    <div style={{
      fontSize:"16px",
      letterSpacing:"0.5px",

    }}>
      {nombreAngeologo}
    </div>

    <div style={{
      fontSize:"13px",
      opacity:"0.8",
      marginTop:"2px"
    }}>
      {tituloAngeologo}
    </div>
  </>

) : (

  <img
    src={florVida}
    alt="Flor de la Vida"
    style={{
      width:"130px",
      opacity:"0.85",
      margin:"10px auto",
      display:"block",
      filter:"sepia(1) brightness(0.35) contrast(1.4)"
    }}
  />

)}

</div>

</div>

</div>

</div>


<div style={{
textAlign:"center",
marginTop:"25px",
width:"794px",
marginLeft:"auto",
marginRight:"auto"
}}>

<button
onClick={descargarPDF}
style={{
padding:"12px 26px",
fontSize:"16px",
background:"#b08d57",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer"
}}
>
Descargar PDF
</button>

</div>

</div>

);


}

export default CartaAngel;