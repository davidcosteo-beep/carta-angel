import { tablaHoras } from "./tablaHoras";

export function calcularAngelPorHora(angelBase, horaString) {
  console.log("Angel base recibido:", angelBase);
  console.log("Existe en tablaHoras?", tablaHoras[angelBase]);

  if (!horaString) return null;

  const hora = new Date(`1970-01-01T${horaString}:00`).getHours();
  const fila = tablaHoras[angelBase];

  if (!fila) return null;

  return fila[hora] || null;
}