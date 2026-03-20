const fs = require("fs");
const path = require("path");

const csvPath = path.join(process.cwd(), "mentor.csv");
const outputPath = path.join(process.cwd(), "src/core/tablaMentor.js");

const csv = fs.readFileSync(csvPath, "utf8");

const lineas = csv
  .split("\n")
  .map(l => l.trim())
  .filter(l => l !== "");

const encabezados = lineas[0].split(";");

const resultado = {};

for (let i = 1; i < lineas.length; i++) {
  const columnas = lineas[i].split(";");

  const fila = {};
  encabezados.forEach((encabezado, index) => {
    fila[encabezado.trim()] = columnas[index]
      ? columnas[index].trim()
      : "";
  });

  const dia = fila["Día"].toLowerCase();

  resultado[dia] = {
    mentor: fila["Mentor"],
    codigoSagrado: fila["Codigo Sagrado"],
    atributo: fila["Atributo"],
    planeta: fila["Planeta"],
    gracia: fila["Gracia"],
    gemas: fila["Gemas"],
    aroma: fila["Aroma"],
    seCanalizaPara: fila["Se canaliza para"],
    don: fila["Don"]
  };
}

const contenidoFinal =
  "export const tablaMentor = " +
  JSON.stringify(resultado, null, 2) +
  ";";

fs.writeFileSync(outputPath, contenidoFinal);

console.log("tablaMentor COMPLETA generada correctamente 🚀");