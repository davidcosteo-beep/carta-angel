export function calcularNumeroAngel(fechaNacimiento) {
  const fecha = new Date(fechaNacimiento);
  const year = fecha.getFullYear();

  const inicioCiclo = new Date(year, 2, 21); // 21 marzo
  const inicioAnio = new Date(year, 0, 1);
  const inicioAnioSiguiente = new Date(year + 1, 0, 1);

  const diasEnAnio =
    (inicioAnioSiguiente - inicioAnio) / (1000 * 60 * 60 * 24);

  let diferencia =
    (fecha - inicioCiclo) / (1000 * 60 * 60 * 24);

  let diaRelativo =
    ((diferencia + diasEnAnio) % diasEnAnio) + 1;

  let numero = Math.ceil(diaRelativo / 5);

  numero = Math.max(1, Math.min(72, numero));

  return numero;
}