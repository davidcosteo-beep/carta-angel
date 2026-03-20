const fs = require("fs");
const path = require("path");

const csvPath = path.join(process.cwd(), "angelAño.csv");
const outputPath = path.join(process.cwd(), "src/core/tablaAngelAnio.js");

const csv = fs.readFileSync(csvPath, "utf8");

const lineas = csv
  .replace(/\r/g, "")
  .split("\n")
  .map(l => l.trim())
  .filter(l => l.length > 0);

const resultado = {};

for (let i = 1; i < lineas.length; i++) {
  const columnas = lineas[i].split(";");

  const numero = columnas[0]?.trim();
  const angel = columnas[1]?.trim();

  if (!numero || !angel) continue;

  resultado[numero] = angel;
}

const contenidoFinal =
  "export const tablaAngelAnio = " +
  JSON.stringify(resultado, null, 2) +
  ";";

fs.writeFileSync(outputPath, contenidoFinal);

console.log("tablaAngelAnio generada correctamente 🚀");