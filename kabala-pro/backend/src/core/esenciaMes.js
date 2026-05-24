import { tablaEsenciaMes } from "./tablaEsenciaMes";

export function calcularEsenciaMes(fechaString) {

  const fecha = new Date(fechaString);

  const mes = fecha.getMonth() + 1;

  return {
    mes,
    esencia: tablaEsenciaMes[mes]
  };

}
