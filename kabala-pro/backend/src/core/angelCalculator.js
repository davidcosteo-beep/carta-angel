import { tablaCartas } from "./tablaCartas";

export function calcularNumeroAngel(fechaNacimiento) {

  const [, month, day] = fechaNacimiento
    .split("-")
    .map(Number);

  const fecha = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  for (const [numero, carta] of Object.entries(tablaCartas)) {

    const { desde, hasta } = carta;

    // rango normal
    if (desde <= hasta) {

      if (fecha >= desde && fecha <= hasta) {
        return Number(numero);
      }

    }

    // rango cruzando año
    else {

      if (fecha >= desde || fecha <= hasta) {
        return Number(numero);
      }

    }

  }

  return null;
}