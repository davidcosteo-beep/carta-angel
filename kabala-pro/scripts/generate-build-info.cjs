const fs = require("fs");
const path = require("path");

const outputPath = path.resolve(
  __dirname,
  "..",
  "src",
  "config",
  "buildInfo.js"
);

const formatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

const buildDateTime = formatter
  .format(new Date())
  .replace(" ", " ");

const content = `export const BUILD_DATE_TIME = "${buildDateTime}";
`;

fs.writeFileSync(outputPath, content, "utf8");

console.log(`Build info generated: ${buildDateTime}`);
