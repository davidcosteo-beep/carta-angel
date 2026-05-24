import { tablaEsenciaDia } from "./tablaEsenciaDia";

export function calcularEsenciaDia(fechaString){

const fecha = new Date(fechaString);

const dia = fecha.getDate();

return {
dia,
esencia: tablaEsenciaDia[dia]
};

}