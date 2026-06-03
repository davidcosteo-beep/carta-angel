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

import "./GenerarCarta.css";
import florVida from "../assets/flor-vida.png";
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

<div className="generar-carta-enter">

{!carta && (

<div className="generar-carta-panel">

<img
  src={florVida}
  alt="Flor de la Vida"
  className="generar-carta-simbolo"
/>

 <h2 className="generar-carta-titulo">

  CANALIZACIÓN ANGELICAL

 </h2>

<div className="generar-carta-divider">
  <div className="generar-carta-divider-line"></div>

  <div className="generar-carta-divider-ornament">
    ❈
  </div>

  <div className="generar-carta-divider-line"></div>
</div>

<div
className="generar-carta-label">
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

className="generar-carta-input"

/>

<br/><br/>

<div className="generar-carta-label">
Fecha de Nacimiento
</div>

<div className="generar-carta-row">

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
    className="generar-carta-select"
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
    className="generar-carta-select"
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
    className="generar-carta-select"
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

<div className="generar-carta-label">
Hora de Nacimiento
<span
className="generar-carta-opcional">
(Opcional)
</span>
</div>

<div className="generar-carta-row-hora">

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

    className="generar-carta-select"
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

    className="generar-carta-select"
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

    className="generar-carta-select"
  >

    <option value="">A.M / P.M</option>

    <option value="AM">AM</option>

    <option value="PM">PM</option>

  </select>

</div>

<br/><br/>

<button 
ref={botonRef}
onClick={generarCarta}
disabled={!nombre || !fecha}
className="generar-carta-boton"
>
  Generar Carta
</button>

</div>

)}

{carta && (

  <div
  ref={cartaRef}
  className="generar-carta-resultado"
>

    <CartaAngel carta={carta}/>

  </div>

)}

</div>

);

}

export default GenerarCarta;