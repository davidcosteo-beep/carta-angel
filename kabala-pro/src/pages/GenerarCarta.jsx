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
const [carta,setCarta] = useState(null);

const nombreAngeologo = localStorage.getItem("nombreAngeologo") || "";
const tituloAngeologo = localStorage.getItem("tituloAngeologo") || "";

useEffect(() => {
  if(nombreRef.current){
    nombreRef.current.focus();
    nombreRef.current.select();
  }
}, []);

const guardarHistorial = (data)=>{

const historial = JSON.parse(localStorage.getItem("historialCartas")) || [];

historial.push(data);

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
const nuevaCarta = () => {

  setNombre("");
  setFecha("");
  setHora("");
  setCarta(null);

  setTimeout(()=>{
    nombreRef.current?.focus();
  },100);

};

return(

<div style={{ width:"100%" }}>

<div
style={{
maxWidth:"420px",
margin:"40px auto",
padding:"25px",

background:"rgba(255,248,230,0.55)",
border:"1px solid rgba(120,90,40,0.25)",
borderRadius:"10px",

boxShadow:"0 8px 20px rgba(0,0,0,0.25)"
}}
>

 <h2
style={{
fontFamily:"Almendra Display, serif",
fontSize:"28px",
letterSpacing:"2px",
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
      .replace(/[^A-ZÁÉÍÓÚÑ ]/g,"")   // solo letras y espacios
      .replace(/\s+/g," ")            // evita múltiples espacios
      .trimStart();                   // evita espacio al inicio

    setNombre(valor)

  }}

  onKeyDown={(e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      fechaRef.current?.focus();
      fechaRef.current?.showPicker();
    }
  }}

  style={{
  width:"100%",
  padding:"10px",
  marginBottom:"15px",

  border:"1px solid rgba(120,90,40,0.35)",
  borderRadius:"6px",

  fontSize:"15px",
  fontFamily:"IM Fell English, serif",

  background:"rgba(255,255,255,0.9)",
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

<input
  ref={fechaRef}
  type="date"
  value={fecha}
  onChange={(e)=>{
    setFecha(e.target.value);

    setTimeout(()=>{
      horaRef.current?.focus();
      horaRef.current?.showPicker?.();
    },100);
  }}

  onFocus={()=>{
    fechaRef.current?.showPicker?.();
  }}

  onKeyDown={(e)=>{
    if(e.key !== "Tab"){
      e.preventDefault();
    }
  }}

  style={{
  width:"100%",
  padding:"10px",
  marginBottom:"15px",

  border:"1px solid rgba(120,90,40,0.35)",
  borderRadius:"6px",

  fontSize:"15px",
  fontFamily:"IM Fell English, serif",

  background:"rgba(255,255,255,0.9)"
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
Hora de Nacimiento
</div>

<input
  ref={horaRef}
  type="time"
  value={hora}
  onChange={(e)=>setHora(e.target.value)}

  onKeyDown={(e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      botonRef.current?.focus();
    }
  }}

  style={{
  width:"100%",
  padding:"10px",
  marginBottom:"15px",

  border:"1px solid rgba(120,90,40,0.35)",
  borderRadius:"6px",

  fontSize:"15px",
  fontFamily:"IM Fell English, serif",

  background:"rgba(255,255,255,0.9)"

}}
/>

<br/><br/>

<button 
ref={botonRef}
onClick={generarCarta}
disabled={!nombre || !fecha}

style={{
width:"100%",
padding:"12px",

background:"#6b4c2f",
color:"#fff",

border:"none",
borderRadius:"6px",

fontSize:"16px",
fontWeight:"600",

marginTop:"10px",

boxShadow:"0 4px 10px rgba(0,0,0,0.25)",

opacity: !nombre || !fecha ? 0.5 : 1,
cursor: !nombre || !fecha ? "not-allowed" : "pointer"
}}

>

Generar Carta

</button>

{carta && (

<button
onClick={nuevaCarta}
style={{
width:"100%",
padding:"10px",

marginTop:"10px",

background:"#e6d3a3",
border:"1px solid #8b6a3c",

borderRadius:"6px",
cursor:"pointer"
}}
>
Nueva Carta
</button>

)}

</div>

{carta && (

<div
ref={cartaRef}
style={{
  width:"100%",
  display:"flex",
  justifyContent:"center",
  marginTop:"35px"
}}
>
<CartaAngel carta={carta}/>
</div>

)}

</div>

);

}

export default GenerarCarta;