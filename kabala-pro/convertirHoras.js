import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, "tablaHoras.csv");
const outputPath = path.join(__dirname, "tablaHoras.js");

const fileContent = fs.readFileSync(csvPath, "utf8");

const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  delimiter: ";",
  trim: true
});

let resultado = {};

records.forEach((row) => {
  const angelBase = row["Angel Base"]?.trim();
  if (!angelBase) return;

  // Tomamos SOLO columnas numéricas 1 a 24
  const horas = [];

  for (let i = 1; i <= 24; i++) {
    const key = String(i);
    horas.push(row[key]?.trim() || "");
  }

  resultado[angelBase] = horas;
});

const contenidoFinal =
  `export const tablaHoras = ${JSON.stringify(resultado, null, 2)};`;

fs.writeFileSync(outputPath, contenidoFinal);

console.log("Archivo tablaHoras.js generado correctamente 🚀");