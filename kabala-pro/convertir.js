import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, "tablaCartas.csv");
const outputPath = path.join(__dirname, "tablaCartas.js");

const fileContent = fs.readFileSync(csvPath, "utf8");

const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  delimiter: ";",
  trim: true
});

let resultado = {};

records.forEach((row) => {

  // Normalizamos claves eliminando espacios
  let cleanRow = {};
  Object.keys(row).forEach(key => {
    cleanRow[key.trim().toLowerCase()] = row[key];
  });

  const numero = cleanRow["numero"];

  if (!numero) {
    console.log("Fila sin numero detectada:", cleanRow);
    return;
  }

  delete cleanRow["numero"];

  resultado[numero] = cleanRow;
});

const contenidoFinal =
  `export const tablaCartas = ${JSON.stringify(resultado, null, 2)};`;

fs.writeFileSync(outputPath, contenidoFinal);

console.log("Archivo tablaCartas.js generado correctamente 🚀");