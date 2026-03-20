const fs = require("fs");
const path = require("path");

const csvPath = path.join(process.cwd(), "angelSigno.csv");
const outputPath = path.join(process.cwd(), "src/core/tablaAngelSigno.js");

const csv = fs.readFileSync(csvPath, "utf8");

const lineas = csv
  .replace(/\r/g, "")
  .split("\n")
  .map(l => l.trim())
  .filter(l => l.length > 0);

const encabezados = lineas[0].split(";");

const resultado = {};

for (let i = 1; i < lineas.length; i++) {
  const columnas = lineas[i].split(";");

  const signo = columnas[0]?.trim().toLowerCase();
  const angel = columnas[1]?.trim();

  if (!signo || !angel) continue;

  resultado[signo] = angel;
}

const contenidoFinal =
  "export const tablaAngelSigno = " +
  JSON.stringify(resultado, null, 2) +
  ";";

fs.writeFileSync(outputPath, contenidoFinal);

console.log("tablaAngelSigno generada correctamente 🚀");