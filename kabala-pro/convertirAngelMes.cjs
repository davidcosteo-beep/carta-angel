const fs = require("fs");
const path = require("path");

const csvPath = path.join(process.cwd(), "angelMes.csv");
const outputPath = path.join(process.cwd(), "src/core/tablaAngelMes.js");

const csv = fs.readFileSync(csvPath, "utf8");

const lineas = csv
  .replace(/\r/g, "")
  .split("\n")
  .map(l => l.trim())
  .filter(l => l.length > 0);

const resultado = {};

for (let i = 1; i < lineas.length; i++) {
  const columnas = lineas[i].split(";");

  const mes = columnas[0]?.trim();
  const angel = columnas[1]?.trim();

  if (!mes || !angel) continue;

  resultado[mes] = angel;
}

const contenidoFinal =
  "export const tablaAngelMes = " +
  JSON.stringify(resultado, null, 2) +
  ";";

fs.writeFileSync(outputPath, contenidoFinal);

console.log("tablaAngelMes generada correctamente 🚀");