import { tablaMentor } from "./tablaMentor.js";

export function calcularAngelBasePorDia(fechaString) {
  const fecha = new Date(fechaString);

  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado"
  ];

  const diaNombre = dias[fecha.getDay()];

  return tablaMentor[diaNombre]?.mentor || null;
}