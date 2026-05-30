import { useState, useRef, useEffect } from "react";

import CartaAngel from "../components/CartaAngel";
import { calcularNumeroAngel } from "../core/angelCalculator";
import { tablaCartas } from "../core/tablaCartas";

import { tablaAngelAnio } from "../core/tablaAngelAnio";
import { tablaAngelMes } from "../core/tablaAngelMes";

import { calcularAngelPorHora } from "../core/angelHora";
import { calcularAngelPorSigno } from "../core/angelSigno";

import { tablaMentor } from "../core/tablaMentor";
import { tablaEsenciaMes } from "../core/tablaEsenciaMes";
import { tablaEsenciaDia } from "../core/tablaEsenciaDia";

function GenerarCarta() {

const nombreRef = useRef(null);
const fechaRef = useRef(null);
const horaRef = useRef(null);
const botonRef = useRef(null);
const cartaRef = useRef(null);
const [nombre,setNombre] = useState("");
const [fecha,setFecha] = useState("");
const [hora,setHora] = useState("");
const [horaPartes, setHoraPartes] = useState({
  hora: "",
  minuto: "",
  periodo: ""
});

const [carta,setCarta] = useState(null);
const [fechaPartes, setFechaPartes] = useState({
  dia: "",
  mes: "",
  anio: ""
});

const diasMes = (() => {

  const mes = Number(fechaPartes.mes);
  const anio = Number(fechaPartes.anio);

  if (!mes) {

    return Array.from(
      { length: 31 },
      (_, i) => String(i + 1).padStart(2, "0")
    );

  }

  const cantidadDias =
    new Date(anio || 2024, mes, 0).getDate();

  return Array.from(
    { length: cantidadDias },
    (_, i) => String(i + 1).padStart(2, "0")
  );

})();

const meses = Array.from(
  { length: 12 },
  (_, i) => String(i + 1).padStart(2, "0")
);

const anios = Array.from(
  { length: 100 },
  (_, i) => String(new Date().getFullYear() - i)
);

const horas = Array.from(
  { length: 12 },
  (_, i) => String(i + 1).padStart(2, "0")
);

const minutos = Array.from(
  { length: 60 },
  (_, i) => String(i).padStart(2, "0")
);

const inputStyle = {

  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.1)",
  background: "white",
  fontSize: "15px",
  outline: "none"
};


useEffect(() => {

  if (!fecha) return;

  const partes = fecha.split("-");

  if (partes.length !== 3) return;

  setFechaPartes({
    anio: partes[0],
    mes: partes[1],
    dia: partes[2]
  });

}, [fecha]);

useEffect(() => {

  if (!hora) return;

  const partes = hora.split(" ");

  if (partes.length !== 2) return;

  const tiempo = partes[0].split(":");

  if (tiempo.length !== 2) return;

  setHoraPartes({
    hora: tiempo[0],
    minuto: tiempo[1],
    periodo: partes[1]
  });

}, [hora]);

useEffect(() => {

  const mes = Number(fechaPartes.mes);
  const anio = Number(fechaPartes.anio);

  if (!mes || !fechaPartes.dia) return;

  const maxDias =
    new Date(anio || 2024, mes, 0).getDate();

  if (Number(fechaPartes.dia) > maxDias) {

    setFechaPartes(prev => ({
      ...prev,
      dia: ""
    }));

  }

}, [
  fechaPartes.dia,
  fechaPartes.mes,
  fechaPartes.anio
]);

const nombreAngeologo = localStorage.getItem("nombreAngeologo") || "";
const tituloAngeologo = localStorage.getItem("tituloAngeologo") || "";

useEffect(() => {
  if(nombreRef.current){
    nombreRef.current.focus();
    nombreRef.current.select();
  }
}, []);


const guardarHistorial = (data) => {

  const historial =
    JSON.parse(localStorage.getItem("historialCartas")) || [];

  const nuevaCarta = {

   id: Date.now().toString(),

    fechaGeneracion:
      new Date().toISOString(),

    ...data
  };

  historial.unshift(nuevaCarta);

  localStorage.setItem(
    "historialCartas",
    JSON.stringify(historial)
  );
};

const generarCarta = ()=>{

  if(!nombre){
    alert("Debes ingresar el nombre.");
    nombreRef.current?.focus();
    return;
  }

  if(!fecha){
    alert("Debes ingresar la fecha de nacimiento.");
    fechaRef.current?.focus();
    return;
  }

  

const fechaObj = new Date(fecha+"T12:00:00");

const diaNacimiento = fechaObj.toLocaleDateString("es-ES",{weekday:"long"});

const diaMes = fechaObj.getDate();

const numero = calcularNumeroAngel(fecha);

const cartaData = tablaCartas[numero];

const mentorData = tablaMentor[diaNacimiento];

const angelGuia = mentorData?.angelGuia;

const angelDia = mentorData?.angelDia;

const angelHora = calcularAngelPorHora(angelDia,hora);

const anio = fechaObj.getFullYear();

const numeroAnio = anio % 9 === 0 ? 9 : anio % 9;

const angelAnio = tablaAngelAnio[numeroAnio];

const mes = fechaObj.getMonth()+1;

const angelMes = tablaAngelMes[mes];

const {signo,angel,esencia,sirvePara} = calcularAngelPorSigno(fecha);

const esenciaMes = tablaEsenciaMes[mes];

const esenciaDia = tablaEsenciaDia[diaMes];

const resultado = {

nombreAngeologo,
tituloAngeologo, 

nombre:nombre,

fecha,
hora,

diaNacimiento,

numero,

angel:cartaData?.angel,
planeta:cartaData?.planeta,
color:cartaData?.color,

aroma:cartaData?.aroma,
talisman:cartaData?.talisman,
ofrenda:cartaData?.ofrenda,


coroAngelical:
  cartaData?.["coro angelical"] ||
  cartaData?.coroAngelical,

donSerDeLuz:
  cartaData?.["don ser de luz"] ||
  cartaData?.donSerDeLuz,

horaCanalizacion:
  cartaData?.["hora canalizacion"] ||
  cartaData?.["hora canalización"] ||
  cartaData?.horaCanalizacion,

seCanalizaPara:
  cartaData?.["se canaliza para"] ||
  cartaData?.seCanalizaPara,

atributo:cartaData?.atributo,

angelGuia,
angelDia,
angelHora,

angelAnio,
angelMes,
angelSigno:angel,

signo,

esenciaSigno:esencia,
esenciaMes,
esenciaDia,
esenciaMentor:mentorData?.aroma,
esenciaAngelGuarda:cartaData?.aroma,

sirvePara,

mentor:mentorData?.mentor,
mentorCodigo:mentorData?.codigoSagrado,
planetaMentor:mentorData?.planeta,
atributoMentor:mentorData?.atributo,
graciaMentor:mentorData?.gracia,
gemasMentor:mentorData?.gemas,
aromaMentor:mentorData?.aroma,
canalizacionMentor:mentorData?.seCanalizaPara,
donMentor:mentorData?.don,

colorGuia:mentorData?.colorGuia,
colorDia:mentorData?.colorDia,
colorHora:mentorData?.colorHora,

significado:mentorData?.significado

};

setCarta(resultado);

guardarHistorial(resultado);

setTimeout(()=>{
  cartaRef.current?.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });
},150);

setTimeout(()=>{
  nombreRef.current?.focus();
  nombreRef.current?.select();
},100);

};

useEffect(() => {

 const resetFormulario = () => {

  setNombre("");

  setFecha("");
  setHora("");

  setFechaPartes({
    dia: "",
    mes: "",
    anio: ""
  });

  setHoraPartes({
    hora: "",
    minuto: "",
    periodo: ""
  });

  setCarta(null);

};

  window.addEventListener(
    "reset-generar-carta",
    resetFormulario
  );

  return () => {

    window.removeEventListener(
      "reset-generar-carta",
      resetFormulario
    );

  };

}, []);

// eslint-disable-next-line react-hooks/exhaustive-deps

useEffect(() => {

  const cartaGuardada =
    localStorage.getItem("cartaTemporal");

  if(!cartaGuardada) return;

  const cartaParseada =
    JSON.parse(cartaGuardada);

  setTimeout(() => {

    setNombre(cartaParseada.nombre || "");
    setFecha(cartaParseada.fecha || "");
    setHora(cartaParseada.hora || "");

  }, 0);

  localStorage.removeItem("cartaTemporal");

}, []);

return(

<div

className="generar-carta-enter"

style={{
minHeight:"100vh",

background:
"linear-gradient(180deg, #f4ead7 0%, #ead8bb 50%, #e2c79f 100%)",

padding:"20px"
}}
>

{!carta && (

<div
style={{
maxWidth:"460px",
margin:"40px auto",
padding:"30px",
background:"rgba(255,248,230,0.42)",
backdropFilter:"blur(6px)",
border:"1px solid rgba(120,90,40,0.22)",
borderRadius:"18px",
boxShadow:"0 12px 35px rgba(90,50,20,0.15)"
}}
>

 <h2
style={{
fontFamily:"Cinzel, serif",
fontSize:"28px",
fontWeight:"600",
letterSpacing:"1px",
textAlign:"center",
marginBottom:"12px",

color:"#1a0f08"


}}
>
GENERAR CARTA
</h2> 

<div
style={{
height:"1px",
background:"rgba(120,90,40,0.2)",
marginBottom:"20px"
}}
/>

<div
style={{
fontFamily:"IM Fell English, serif",
fontSize:"14px",
marginBottom:"4px",
color:"#3a1f12"
}}
>
Nombre del Paciente
</div>

<input
  ref={nombreRef}
  type="text"
  value={nombre}
  onChange={(e)=>{

    let valor = e.target.value
      .toUpperCase()
      .replace(/[^A-ZÁÉÍÓÚÑ ]/g,"")
      .replace(/\s+/g," ")
      .trimStart();

    setNombre(valor)

  }}

  onKeyDown={(e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      fechaRef.current?.focus();
    }
  }}

  style={{
  width:"100%",
  padding:"12px 14px",
  marginBottom:"15px",
  border:"1px solid rgba(120,90,40,0.16)",
  borderRadius:"10px",
  fontSize:"15px",
  fontFamily:"IM Fell English, serif",
  background:"rgba(255,255,255,0.58)",
  backdropFilter:"blur(4px)",
  boxShadow:"inset 0 1px 3px rgba(90,50,20,0.05)",
  transition:"all 0.25s ease",
  color:"#3a1f12",
  textTransform:"uppercase"
  }}

/>

<br/><br/>

<div
style={{
fontFamily:"IM Fell English, serif",
fontSize:"14px",
marginBottom:"4px",
color:"#3a1f12"
}}
>
Fecha de Nacimiento
</div>

<div
  style={{
    display: "flex",
    gap: "10px",
    width: "100%"
  }}
>

  {/* DIA */}

  <select
    value={fechaPartes.dia}
    onChange={(e) => {

      const nuevoDia = e.target.value;

      setFechaPartes(prev => ({
  ...prev,
  dia: nuevoDia
}));

if (
  nuevoDia &&
  fechaPartes.mes &&
  fechaPartes.anio
) {

  setFecha(
    `${fechaPartes.anio}-${fechaPartes.mes}-${nuevoDia}`
  );

        setTimeout(() => {
          horaRef.current?.focus();
        }, 100);

      }

    }}
    style={inputStyle}
  >
    <option value="">Día</option>

    {diasMes.map((d) => (
      <option key={d} value={d}>
        {d}
      </option>
    ))}

  </select>

  {/* MES */}

  <select
    value={fechaPartes.mes}
    onChange={(e) => {

      const nuevoMes = e.target.value;

      setFechaPartes(prev => ({
  ...prev,
  mes: nuevoMes
}));

if (
  fechaPartes.dia &&
  nuevoMes &&
  fechaPartes.anio
) {

  setFecha(
    `${fechaPartes.anio}-${nuevoMes}-${fechaPartes.dia}`
  );

  setTimeout(() => {
    horaRef.current?.focus();
  }, 100);

}

    }}
    style={inputStyle}
  >
    <option value="">Mes</option>

    {meses.map((m) => (
      <option key={m} value={m}>
        {m}
      </option>
    ))}

  </select>

  {/* AÑO */}

  <select
    value={fechaPartes.anio}
    onChange={(e) => {

      const nuevoAnio = e.target.value;

     setFechaPartes(prev => ({
  ...prev,
  anio: nuevoAnio
}));

if (
  fechaPartes.dia &&
  fechaPartes.mes &&
  nuevoAnio
) {

  setFecha(
    `${nuevoAnio}-${fechaPartes.mes}-${fechaPartes.dia}`
  );

  setTimeout(() => {
    horaRef.current?.focus();
  }, 100);

}

    }}
    style={inputStyle}
  >
    <option value="">Año</option>

    {anios.map((a) => (
      <option key={a} value={a}>
        {a}
      </option>
    ))}

  </select>

</div>

<br/><br/>

<div
style={{
fontFamily:"IM Fell English, serif",
fontSize:"14px",
marginBottom:"4px",
color:"#3a1f12"
}}
>
Hora de Nacimiento
<span
style={{
fontSize:"11px",
color:"#8c6f4f",
marginLeft:"6px",
fontStyle:"italic"
}}
>
(Opcional)
</span>
</div>

<div
  style={{
    display: "flex",
    gap: "10px",
    width: "100%",
    marginBottom: "15px"
  }}
>

  {/* HORA */}

  <select
    value={horaPartes.hora}

    onChange={(e) => {

      const nuevaHora = e.target.value;

      setHoraPartes(prev => ({
        ...prev,
        hora: nuevaHora
      }));

      if (
        nuevaHora &&
        horaPartes.minuto &&
        horaPartes.periodo
      ) {

        setHora(
          `${nuevaHora}:${horaPartes.minuto} ${horaPartes.periodo}`
        );

      }

    }}

    style={inputStyle}
  >

    <option value="">Hora</option>

    {horas.map((h) => (
      <option key={h} value={h}>
        {h}
      </option>
    ))}

  </select>

  {/* MINUTOS */}

  <select
    value={horaPartes.minuto}

    onChange={(e) => {

      const nuevoMinuto = e.target.value;

      setHoraPartes(prev => ({
        ...prev,
        minuto: nuevoMinuto
      }));

      if (
        horaPartes.hora &&
        nuevoMinuto &&
        horaPartes.periodo
      ) {

        setHora(
          `${horaPartes.hora}:${nuevoMinuto} ${horaPartes.periodo}`
        );

      }

    }}

    style={inputStyle}
  >

    <option value="">Min</option>

    {minutos.map((m) => (
      <option key={m} value={m}>
        {m}
      </option>
    ))}

  </select>

  {/* AM PM */}

  <select
    ref={horaRef}

    value={horaPartes.periodo}

    onChange={(e) => {

      const nuevoPeriodo = e.target.value;

      setHoraPartes(prev => ({
        ...prev,
        periodo: nuevoPeriodo
      }));

      if (
        horaPartes.hora &&
        horaPartes.minuto &&
        nuevoPeriodo
      ) {

        setHora(
          `${horaPartes.hora}:${horaPartes.minuto} ${nuevoPeriodo}`
        );

      }

    }}

    style={inputStyle}
  >

    <option value="">AM/PM</option>

    <option value="AM">AM</option>

    <option value="PM">PM</option>

  </select>

</div>

<br/><br/>

<button 
ref={botonRef}
onClick={generarCarta}
disabled={!nombre || !fecha}

style={{
width:"100%",
padding:"14px",
background:
"linear-gradient(180deg, #7b5532 0%, #5f3f24 100%)",
color:"#fff",
border:"1px solid rgba(255,220,160,0.18)",
borderRadius:"12px",
fontSize:"17px",
fontWeight:"600",
marginTop:"12px",
boxShadow:"0 8px 18px rgba(90,50,20,0.25)",
opacity: !nombre || !fecha ? 0.5 : 1,
cursor: !nombre || !fecha ? "not-allowed" : "pointer",
transition:"all 0.25s ease"
}}

>

Generar Carta

</button>

</div>

)}

{carta && (

  <div
    ref={cartaRef}
    style={{
      width:"100%",
      display:"flex",
      justifyContent:"center",
      marginTop:"35px",
      animation:
        "revelarCarta 1.4s ease forwards"
    }}
  >

    <CartaAngel carta={carta}/>

  </div>

)}

</div>

);

}

export default GenerarCarta;