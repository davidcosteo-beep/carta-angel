import { tablaHoras } from "./tablaHoras";

export function calcularAngelPorHora(angelBase, horaString) {
  console.log("Angel base recibido:", angelBase);
  console.log("Existe en tablaHoras?", tablaHoras[angelBase]);

  if (!horaString) return null;

  const [horaTexto, minutosTexto] =
  horaString.split(":");

const hora =
  parseInt(horaTexto, 10);
  const fila = tablaHoras[angelBase];

  if (!fila) return null;

  return fila[hora] || null;
}