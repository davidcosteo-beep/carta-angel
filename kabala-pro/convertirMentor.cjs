const fs = require("fs");
const path = require("path");

const csvPath = path.join(__dirname, "tablaMentor.csv");
const outputPath = path.join(process.cwd(), "src/core/tablaMentor.js");

const csv = fs.readFileSync(csvPath, "utf8");

// Forzamos separador ;
const lineas = csv
  .split("\n")
  .map(l => l.trim())
  .filter(l => l !== "");

const resultado = {};

for (let i = 1; i < lineas.length; i++) {
  const columnas = lineas[i].split(";");

  if (columnas.length < 2) continue;

  const dia = columnas[0].trim().toLowerCase();
  const angel = columnas[1].trim();

  resultado[dia] = angel;
}

const contenidoFinal =
  "export const tablaMentor = " +
  JSON.stringify(resultado, null, 2) +
  ";";

fs.writeFileSync(outputPath, contenidoFinal);

console.log("tablaMentor.js generado correctamente 🚀");