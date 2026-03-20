import { tablaAngelMes } from "./tablaAngelMes";

export function calcularAngelPorMes(fechaString) {
  const fecha = new Date(fechaString);
  const mes = fecha.getMonth() + 1;

  return {
    mes,
    angel: tablaAngelMes[mes]
  };
}