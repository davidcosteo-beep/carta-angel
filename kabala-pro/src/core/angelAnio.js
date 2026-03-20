import { tablaAngelAnio } from "./tablaAngelAnio";

function reducirANueve(numero) {
  while (numero > 9) {
    numero = numero
      .toString()
      .split("")
      .reduce((acc, dig) => acc + parseInt(dig), 0);
  }
  return numero;
}

export function calcularAngelPorAnio(fechaString) {
  const fecha = new Date(fechaString);
  const anio = fecha.getFullYear();

  const numeroReducido = reducirANueve(anio);

  return {
    anio,
    numero: numeroReducido,
    angel: tablaAngelAnio[numeroReducido]
  };
}