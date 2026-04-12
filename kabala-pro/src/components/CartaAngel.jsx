import florVida from "../assets/flor-vida.png";
import { tablaMentor } from "../core/tablaMentor";
import { tablaCartas } from "../core/tablaCartas";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from "@pdf-lib/fontkit";



function CartaAngel({ carta }) {

async function generarPDFNuevo() {

const inicioX = 67;
const inicioY = 760;
const anchoUtil = 464;

const imagenPrincipalX = inicioX + 5;
const col1X = inicioX + 130;
const col2X = inicioX + 280;
const labelOffset = 80;
const lineHeight = 14;  


function wrapText(text, maxWidth, font, size) {

  if (text === null || text === undefined) return [];

  text = String(text); // convierte todo a string

  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  words.forEach(word => {
    const testLine = currentLine + word + " ";
    const width = font.widthOfTextAtSize(testLine, size);

    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word + " ";
    }
  });

  if (currentLine) lines.push(currentLine);

  return lines;
}
  
const pdfDoc = await PDFDocument.create();

pdfDoc.registerFontkit(fontkit);

const page = pdfDoc.addPage([600, 910]);

const fondoBytes = await fetch("/assets/pdf/fondo.jpg").then(res => res.arrayBuffer());
const fondoImage = await pdfDoc.embedJpg(fondoBytes);

page.drawImage(fondoImage, {
  x: 0,
  y: 0,
  width: page.getWidth(),
  height: page.getHeight(),
  opacity: 0.90,
});

 
const fontTituloBytes = await fetch("/fonts/Cinzel-Bold.ttf")
  .then(res => res.arrayBuffer());

const fontTituloDecorativoBytes = await fetch("/fonts/CinzelDecorative-Bold.ttf")
  .then(res => res.arrayBuffer());

const fontRegularBytes = await fetch("/fonts/Cardo-Regular.ttf")
  .then(res => res.arrayBuffer());

const fontBoldBytes = await fetch("/fonts/Cardo-Bold.ttf")
  .then(res => res.arrayBuffer());

const cardoItalicBytes = await fetch("/fonts/UnifrakturCook-Bold.ttf")
  .then(res => res.arrayBuffer());

const fontTitulo = await pdfDoc.embedFont(fontTituloBytes);
const fontTituloDecorativo = await pdfDoc.embedFont(fontTituloDecorativoBytes);
const font = await pdfDoc.embedFont(fontRegularBytes);
const fontBold = await pdfDoc.embedFont(fontBoldBytes);
const cardoItalicFont = await pdfDoc.embedFont(cardoItalicBytes);


const hexToRgb = (hex) => {
if (!hex) return rgb(0.5, 0.5, 0.5); // gris fallback

const r = parseInt(hex.slice(1,3),16)/255;
const g = parseInt(hex.slice(3,5),16)/255;
const b = parseInt(hex.slice(5,7),16)/255;

return rgb(r,g,b);
};

const nombreTexto = carta.nombre?.toUpperCase() || "";
const fontSizeNombre = 28;
const letterSpacing = 3;

let nombreWidth = 0;

for (const char of nombreTexto) {
  nombreWidth += fontTituloDecorativo.widthOfTextAtSize(char, fontSizeNombre) + letterSpacing;
}

nombreWidth -= letterSpacing;

const nombreX = inicioX + (anchoUtil - nombreWidth) / 2 + 45;
const nombreY = inicioY + 45;

// texto principal
page.drawText(nombreTexto, {
  x: nombreX,
  y: nombreY,
  size: fontSizeNombre,
  font: fontTituloDecorativo,
  color: rgb(0.42, 0.26, 0.14),
});

const fechaNacimiento = new Date(`${carta.fecha}T00:00`);

const diasSemana = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado"
];

const diaSemana = diasSemana[fechaNacimiento.getDay()];

const horaTexto = carta.hora
  ? (() => {
      const [hora, minuto] = carta.hora.split(":");
      const h = parseInt(hora, 10);
      const periodo = h >= 12 ? "p.m." : "a.m.";
      const hora12 = h % 12 || 12;
      return ` | Hora: ${hora12}:${minuto} ${periodo}`;
    })()
  : "";

const textoFecha = `Nacimiento: ${carta.fecha} | Día: ${diaSemana}${horaTexto} | Signo: ${carta.signo}`;

const fechaWidth = fontBold.widthOfTextAtSize(textoFecha, 12);

page.drawText(textoFecha, {
  x: inicioX + (anchoUtil - fechaWidth) / 2,
  y: inicioY + 25,
  size: 12,
  font: fontBold,
  color: rgb(0.15, 0.10, 0.05),
});


// BARRA DE COLOR

const barraY = inicioY - 10 ;
const barraH = 25;

const colorBase = carta.color || "#3B82F6";

const hex = colorBase.replace("#", "");

const rBase = parseInt(hex.substring(0, 2), 16) / 255;
const gBase = parseInt(hex.substring(2, 4), 16) / 255;
const bBase = parseInt(hex.substring(4, 6), 16) / 255;

// degradado horizontal dinámico
const luminosidadBase = (rBase + gBase + bBase) / 3;

const brilloExtraBase = luminosidadBase > 0.7 ? 0.08 : 0.10;
const sombraCentroBase =
   luminosidadBase > 0.7 
   ? 0.22 
   : luminosidadBase > 0.45
   ? 0.26
   :0.20;

for (let i = 0; i < anchoUtil; i++) {
  const tBase = i / anchoUtil;

  let factorBase;

  if (tBase < 0.20) {
    factorBase = 1 + brilloExtraBase;
  } else if (tBase < 0.40) {
    factorBase =
      (1 + brilloExtraBase) -
      ((tBase - 0.20) / 0.20) * 0.10;
  } else if (tBase < 0.60) {
    factorBase =
      1.00 -
      ((tBase - 0.40) / 0.20) * sombraCentroBase;
  } else if (tBase < 0.80) {
    factorBase =
      (1 - sombraCentroBase) +
      ((tBase - 0.60) / 0.20) * 0.10;
  } else {
    factorBase =
      (1 - sombraCentroBase + 0.10) +
      ((tBase - 0.80) / 0.20) * 0.06;
  }

  const rBaseFinal = Math.max(0, Math.min(1, rBase * factorBase));
  const gBaseFinal = Math.max(0, Math.min(1, gBase * factorBase));
  const bBaseFinal = Math.max(0, Math.min(1, bBase * factorBase));

  page.drawRectangle({
    x: inicioX + i,
    y: barraY,
    width: 1,
    height: barraH,
    color: rgb(rBaseFinal, gBaseFinal, bBaseFinal),
  });
}

// brillo suave superior tipo barniz
page.drawRectangle({
  x: inicioX,
  y: barraY + barraH - 4,
  width: anchoUtil,
  height: 2,
  color: rgb(1, 1, 1),
  opacity: 0.06,
});

// sombra suave inferior
page.drawRectangle({
  x: inicioX,
  y: barraY,
  width: anchoUtil,
  height: 5,
  color: rgb(0, 0, 0),
  opacity: 0.08,
});

// línea clara inferior
page.drawLine({
  start: { x: inicioX, y: barraY + barraH - 1 },
  end: { x: inicioX + anchoUtil, y: barraY + barraH - 1 },
  thickness: 1,
  color: rgb(1, 1, 1),
  opacity: 0.22,
});

// línea oscura superior
page.drawLine({
  start: { x: inicioX, y: barraY + 1 },
  end: { x: inicioX + anchoUtil, y: barraY + 1 },
  thickness: 1,
  color: rgb(0, 0, 0),
  opacity: 0.25,
});

// borde externo muy sutil
page.drawRectangle({
  x: inicioX,
  y: barraY,
  width: anchoUtil,
  height: barraH,
  borderWidth: 0.6,
  borderColor: rgb(
    Math.max(0, rBase - 0.20),
    Math.max(0, gBase - 0.20),
    Math.max(0, bBase - 0.20)
  ),
  opacity: 0.35,
});

const text = "ANGEL    DE    LA    GUARDA";

const textWidth = fontBold.widthOfTextAtSize(text, 15);
const letterSpacingTitulo = 3.5;

page.drawText(text, {
  x: inicioX + (anchoUtil - textWidth) / 2,
  y: inicioY - 1,
  size: 15,
  font: fontTituloDecorativo,
  characterSpacing:letterSpacingTitulo,
  color: rgb(1, 1, 1),
});

const angelBytes = await fetch(`/assets/pdf/angeles/${carta.angel.toLowerCase()}.png`)
  .then(r => r.arrayBuffer());

const angelImg = await pdfDoc.embedPng(angelBytes);

page.drawImage(angelImg, {
  x: imagenPrincipalX - 24,
  y: inicioY - 204,
  width: 163,
  height: 193,
  opacity: 0.08,
});

page.drawImage(angelImg, {
  x: imagenPrincipalX - 10,
  y: inicioY - 190,
  width: 135,
  height: 161,
  opacity: 0.20,
});

page.drawImage(angelImg, {
  x: imagenPrincipalX,
  y: inicioY - 180,
  width: 115,
  height: 145,
});

page.drawImage(angelImg, {
  x: imagenPrincipalX,
  y: inicioY - 180,
  width: 115,
  height: 145,
});

let y = 685;

const drawLine2Cols = (label1, value1, label2, value2) => {

  const lines1 = value1
    ? wrapText(value1, 95, font, 11)
    : [];

  const lines2 = value2
    ? wrapText(value2, 95, font, 11)
    : [];

  const maxLines = Math.max(lines1.length, lines2.length);
  const colorTextoPrincipal = rgb(0.18, 0.09, 0.03);
  const colorSombra = rgb(0.32, 0.18, 0.08);
  const colorLuz = rgb(0.95, 0.88, 0.72);

  for (let i = 0; i < maxLines; i++) {

    // COLUMNA 1
    if (i === 0 && label1) {
  page.drawText(label1 + ":", {
  x: col1X + 0.5,
  y: y - 0.4,
  size: 11,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

  page.drawText(label1 + ":", {
  x: col1X - 0.2,
  y: y + 0.2,
  size: 11,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText(label1 + ":", {
  x: col1X,
  y,
  size: 11,
  font: fontBold,
  color: colorTextoPrincipal,
});

}

    if (lines1[i]) {
  page.drawText(lines1[i], {
  x: col1X + labelOffset + 0.4,
  y: y - 0.3,
  size: 11,
  font,
  color: colorSombra,
  opacity: 0.15,
});

page.drawText(lines1[i], {
  x: col1X + labelOffset,
  y,
  size: 11,
  font,
  color: colorTextoPrincipal,
});

    }

    // COLUMNA 2
    if (i === 0 && label2) {
  page.drawText(label2 + ":", {
    x: col2X + 0.5,
    y: y - 0.4,
    size: 11,
    font: fontBold,
    color: colorSombra,
    opacity: 0.28,
  });

  page.drawText(label2 + ":", {
    x: col2X - 0.2,
    y: y + 0.2,
    size: 11,
    font: fontBold,
    color: colorLuz,
    opacity: 0.15,
  });

  page.drawText(label2 + ":", {
    x: col2X,
    y,
    size: 11,
    font: fontBold,
    color: colorTextoPrincipal,
  });
}

if (lines2[i]) {
  page.drawText(lines2[i], {
    x: col2X + 58 + 0.4,
    y: y - 0.3,
    size: 11,
    font,
    color: colorSombra,
    opacity: 0.15,
  });

  page.drawText(lines2[i], {
    x: col2X + 58,
    y,
    size: 11,
    font,
    color: colorTextoPrincipal,
  });
}

y -= lineHeight;
}

y -= 4;
};

const panelX = col1X - 15;
const panelY = y - 20;
const panelWidth = 360;
const panelHeight = 120;

page.drawRectangle({
  x: panelX,
  y: panelY,
  width: panelWidth,
  height: panelHeight,
  color: rgb(1, 0.96, 0.88),
  opacity: 0.08,
});

page.drawRectangle({
  x: panelX,
  y: panelY + panelHeight - 2,
  width: panelWidth,
  height: 2,
  color: rgb(1, 1, 1),
  opacity: 0.10,
});

page.drawRectangle({
  x: panelX,
  y: panelY,
  width: panelWidth,
  height: 2,
  color: rgb(0.45, 0.30, 0.15),
  opacity: 0.08,
});

y += 50;

drawLine2Cols("Número", carta.numero, "Ángel", carta.angel);
drawLine2Cols("Color", nombreColorGuardian, "Planeta", carta.planeta);
drawLine2Cols("Coro angelical", carta.coroAngelical, "Aroma", carta.aroma);
drawLine2Cols("Talismán", carta.talisman, "Atributo", carta.atributo);
drawLine2Cols("Ofrenda", carta.ofrenda, "", "");


y -= 1;

// TÍTULO

page.drawText("Se canaliza para:", {
  x: col1X,
  y,
  size: 11,
  font:fontBold,
});

y -= 15;

const drawJustifiedText = (text, x, yStart, maxWidth, font, size, lineHeight = 14) => {
  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  words.forEach(word => {
    const testLine = currentLine + word + " ";
    const testWidth = font.widthOfTextAtSize(testLine, size);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    }
  });

  if (currentLine) lines.push(currentLine.trim());

  let y = yStart;

  lines.forEach((line, index) => {
    const isLastLine = index === lines.length - 1;
    const wordsInLine = line.split(" ");

    if (wordsInLine.length === 1 || isLastLine) {
      page.drawText(line, {
        x,
        y,
        size,
        font,
      });
    } else {
      const textWithoutSpaces = wordsInLine.join("");
      const wordsWidth = font.widthOfTextAtSize(textWithoutSpaces, size);
      const totalSpacing = maxWidth - wordsWidth;
      const spacing = totalSpacing / (wordsInLine.length - 1);

      let currentX = x;

      wordsInLine.forEach(word => {
        page.drawText(word, {
          x: currentX,
          y,
          size,
          font,
        });

        currentX += font.widthOfTextAtSize(word, size) + spacing;
      });
    }

    y -= lineHeight;
  });

  return y;
};

y = drawJustifiedText(
  carta.seCanalizaPara,
  col1X,
  y,
  320,
  font,
  11,
  14
);

y -= 6;

page.drawText("Don del ser de luz:", {
  x: col1X,
  y,
  size: 11,
  font: fontBold,
});

y -= 15;

y = drawJustifiedText(
  carta.donSerDeLuz,
  col1X,
  y,
  320,
  font,
  11,
  14
);

y-=10;

//Separador y Circulo Central

const separadorY = y + 18;

// línea principal
page.drawLine({
  start: { x: inicioX + 55, y: separadorY },
  end: { x: inicioX + anchoUtil - 55, y: separadorY },
  thickness: 1.6,
  color: rgb(
    Math.max(0, rBase - 0.03),
    Math.max(0, gBase - 0.03),
    Math.max(0, bBase - 0.03)
  ),
  opacity: 0.40,
});

// brillo superior
page.drawLine({
  start: { x: inicioX + 55, y: separadorY + 1 },
  end: { x: inicioX + anchoUtil - 55, y: separadorY + 1 },
  thickness: 0.6,
  color: rgb(
    Math.min(1, rBase + 0.22),
    Math.min(1, gBase + 0.22),
    Math.min(1, bBase + 0.22)
  ),
  opacity: 0.25,
});

// círculo exterior
page.drawCircle({
  x: inicioX + (anchoUtil / 2),
  y: separadorY,
  size: 4,
  color: rgb(
    Math.max(0, rBase - 0.02),
    Math.max(0, gBase - 0.02),
    Math.max(0, bBase - 0.02)
  ),
  opacity: 0.50,
});

// círculo interior claro
page.drawCircle({
  x: inicioX + (anchoUtil / 2),
  y: separadorY,
  size: 2.2,
  color: rgb(
    Math.min(1, rBase + 0.25),
    Math.min(1, gBase + 0.25),
    Math.min(1, bBase + 0.25)
  ),
  opacity: 0.85,
});

//proteccion
if(y <120) {
  y=120;
}

// 🔍 BUSCAR MENTOR
const normalizar = (t) =>
  t?.toLowerCase().trim().replace(/\s+/g, "");

const mentorData = Object.values(tablaMentor).find(
  m => normalizar(m.mentor) === normalizar(carta.mentor)
);

//  FUNCIÓN AQUÍ ADENTRO 
  async function dibujarMentor({
    page,
    pdfDoc,
    font,
    rgb,
    mentorData,
    yStart,
  }) {

    if (!mentorData) return yStart;

    let y = yStart;

  const col1X = 80;
  const col2X = 255;
  const imgX = 380;
  const lineHeight = 15;

  const colorTextoPrincipal = rgb(0.18, 0.09, 0.03);
  const colorSombra = rgb(0.32, 0.18, 0.08);
  const colorLuz = rgb(0.95, 0.88, 0.72);

  const colorMentor = mentorData.colorMentor || "#9333EA";

  const hexMentor = colorMentor.replace("#", "");

  const rMentor = parseInt(hexMentor.substring(0, 2), 16) / 255;
  const gMentor = parseInt(hexMentor.substring(2, 4), 16) / 255;
  const bMentor = parseInt(hexMentor.substring(4, 6), 16) / 255;

 const barraMentorY = y;

// degradado horizontal dinámico
const luminosidadMentor = (rMentor + gMentor + bMentor) / 3;

const brilloExtraMentor = luminosidadMentor > 0.7 ? 0.08 : 0.10;
const sombraCentroMentor = 
  luminosidadMentor > 0.7 
    ? 0.22 
    : luminosidadMentor> 0.45
    ? 0.26
    : 0.20;

for (let i = 0; i < anchoUtil; i++) {
  const tMentor = i / anchoUtil;

  let factorMentor;

  if (tMentor < 0.20) {
    factorMentor = 1 + brilloExtraMentor;
  } else if (tMentor < 0.40) {
    factorMentor =
      (1 + brilloExtraMentor) -
      ((tMentor - 0.20) / 0.20) * 0.10;
  } else if (tMentor < 0.60) {
    factorMentor =
      1.00 -
      ((tMentor - 0.40) / 0.20) * sombraCentroMentor;
  } else if (tMentor < 0.80) {
    factorMentor =
      (1 - sombraCentroMentor) +
      ((tMentor - 0.60) / 0.20) * 0.10;
  } else {
    factorMentor =
      (1 - sombraCentroMentor + 0.10) +
      ((tMentor - 0.80) / 0.20) * 0.06;
  }

  const rMentorFinal = Math.max(0, Math.min(1, rMentor * factorMentor));
  const gMentorFinal = Math.max(0, Math.min(1, gMentor * factorMentor));
  const bMentorFinal = Math.max(0, Math.min(1, bMentor * factorMentor));

  page.drawRectangle({
    x: inicioX + i,
    y: barraMentorY,
    width: 1,
    height: 25,
    color: rgb(rMentorFinal, gMentorFinal, bMentorFinal),
  });
}

// brillo superior
page.drawRectangle({
  x: inicioX,
  y: barraMentorY + 19,
  width: anchoUtil,
  height: 4,
  color: rgb(1, 1, 1),
  opacity: 0.08,
});

// sombra inferior
page.drawRectangle({
  x: inicioX,
  y: barraMentorY,
  width: anchoUtil,
  height: 5,
  color: rgb(0, 0, 0),
  opacity: 0.08,
});

// línea clara inferior
page.drawLine({
  start: { x: inicioX, y: barraMentorY + 24 },
  end: { x: inicioX + anchoUtil, y: barraMentorY + 24 },
  thickness: 1,
  color: rgb(1, 1, 1),
  opacity: 0.20,
});

// línea oscura superior
page.drawLine({
  start: { x: inicioX, y: barraMentorY + 1 },
  end: { x: inicioX + anchoUtil, y: barraMentorY + 1 },
  thickness: 1,
  color: rgb(0, 0, 0),
  opacity: 0.22,
});

// borde exterior sutil
page.drawRectangle({
  x: inicioX,
  y: barraMentorY,
  width: anchoUtil,
  height: 25,
  borderWidth: 0.5,
  borderColor: rgb(
    Math.max(0, rMentor - 0.20),
    Math.max(0, gMentor - 0.20),
    Math.max(0, bMentor - 0.20)
  ),
  opacity: 0.35,
});

const titulo = "ANGEL    MENTOR";
const fontSizeTitulo = 15;
const letterSpacingTitulo = 3.5;

let tituloWidth = 0;

for (const char of titulo) {
  tituloWidth += fontTituloDecorativo.widthOfTextAtSize(char, fontSizeTitulo) + letterSpacingTitulo;
}

tituloWidth -= letterSpacingTitulo;

const tituloX = (600 - tituloWidth) / 2;

page.drawText(titulo, {
  x: tituloX + 1,
  y: barraMentorY + 5.5,
  size: fontSizeTitulo,
  font: fontTituloDecorativo,
  characterSpacing: letterSpacingTitulo,
  color: rgb(0.20, 0.08, 0.03),
  opacity: 0.28,
});

page.drawText(titulo, {
  x: tituloX - 0.3,
  y: barraMentorY + 7.2,
  size: fontSizeTitulo,
  font: fontTituloDecorativo,
  characterSpacing: letterSpacingTitulo,
  color: rgb(1, 0.95, 0.88),
  opacity: 0.15,
});

page.drawText(titulo, {
  x: tituloX,
  y: barraMentorY + 6.8,
  size: fontSizeTitulo,
  font: fontTituloDecorativo,
  characterSpacing: letterSpacingTitulo,
  color: rgb(1, 1, 1),
});

y -= 20;
    const drawLine = (l1, v1, l2, v2) => {

      if (v1) {
        page.drawText(`${l1}:`, {
  x: col1X + 0.5,
  y: y - 0.4,
  size: 11,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

page.drawText(`${l1}:`, {
  x: col1X - 0.2,
  y: y + 0.2,
  size: 11,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText(`${l1}:`, {
  x: col1X,
  y,
  size: 11,
  font: fontBold,
  color: colorTextoPrincipal,
});

page.drawText(String(v1), {
  x: col1X + 70 + 0.4,
  y: y - 0.3,
  size: 11,
  font,
  color: colorSombra,
  opacity: 0.15,
});

page.drawText(String(v1), {
  x: col1X + 70,
  y,
  size: 11,
  font,
  color: colorTextoPrincipal,
});
      }

      if (v2) {
        page.drawText(`${l2}:`, {
  x: col2X + 0.5,
  y: y - 0.4,
  size: 11,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

page.drawText(`${l2}:`, {
  x: col2X - 0.2,
  y: y + 0.2,
  size: 11,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText(`${l2}:`, {
  x: col2X,
  y,
  size: 11,
  font: fontBold,
  color: colorTextoPrincipal,
});

page.drawText(String(v2), {
  x: col2X + 70 + 0.4,
  y: y - 0.3,
  size: 11,
  font,
  color: colorSombra,
  opacity: 0.15,
});

page.drawText(String(v2), {
  x: col2X + 70,
  y,
  size: 11,
  font,
  color: colorTextoPrincipal,
});
      }

      y -= lineHeight;
    };

    drawLine("Mentor", mentorData.mentor, "Color", mentorData.colorNombreMentor);
    y -=3;
    drawLine("Código", mentorData.codigoSagrado, "Planeta", mentorData.planeta);
    y -=3;
    drawLine("Atributo", mentorData.atributo, "Aroma", mentorData.aroma);
    y -=3;
    drawLine("Gracia", mentorData.gracia, );
    y -=3;
    drawLine("Gemas", mentorData.gemas);

    const yTextoMentor = y - 8;

page.drawText("Se Canaliza para:", {
  x: col1X + 0.5,
  y: yTextoMentor - 0.4,
  size: 11,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

page.drawText("Se Canaliza para:", {
  x: col1X - 0.2,
  y: yTextoMentor + 0.2,
  size: 11,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText("Se Canaliza para:", {
  x: col1X,
  y: yTextoMentor,
  size: 11,
  font: fontBold,
  color: colorTextoPrincipal,
});

const splitTextIntoLines = (text, maxWidth, font, size) => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach(word => {
    const testLine = currentLine ? currentLine + " " + word : word;
    const width = font.widthOfTextAtSize(testLine, size);

    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

let yCanaliza = yTextoMentor;
let yDetalle = yTextoMentor;

const textoCanaliza = String(mentorData.seCanalizaPara || "");

const lineasCanaliza = splitTextIntoLines(
  textoCanaliza,
  230,
  font,
  11
);

lineasCanaliza.forEach((linea, index) => {
  page.drawText(linea, {
    x: col1X + 108 + 0.4,
    y: yCanaliza - (index * 14) - 0.3,
    size: 11,
    font,
    color: colorSombra,
    opacity: 0.15,
  });

  page.drawText(linea, {
    x: col1X + 108,
    y: yCanaliza - (index * 14),
    size: 11,
    font,
    color: colorTextoPrincipal,
  });
});

yDetalle = yTextoMentor - ((lineasCanaliza.length - 1) * 14) - 22;

page.drawText("Don:", {
  x: col1X + 0.5,
  y: yDetalle - 0.4,
  size: 11,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

page.drawText("Don:", {
  x: col1X - 0.2,
  y: yDetalle + 0.2,
  size: 11,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText("Don:", {
  x: col1X,
  y: yDetalle,
  size: 11,
  font: fontBold,
  color: colorTextoPrincipal,
});

page.drawText(String(mentorData.don), {
  x: col1X + 42 + 0.4,
  y: yDetalle - 0.3,
  size: 11,
  font,
  color: colorSombra,
  opacity: 0.15,
});

page.drawText(String(mentorData.don), {
  x: col1X + 42,
  y: yDetalle,
  size: 11,
  font,
  color: colorTextoPrincipal,
});

yDetalle -= 20;

y = yDetalle - 6;

    // IMAGEN
    try {
      const mentorBytes = await fetch(`/assets/pdf/mentores/${mentorData.mentor.toLowerCase()}.png`)
        .then(r => r.arrayBuffer());

      const mentorImg = await pdfDoc.embedPng(mentorBytes);

page.drawEllipse({
  x: imgX + 90,
  y: yStart - 68,
  xScale: 48,
  yScale: 68,
  color: rgb(0, 0, 0),
  opacity: 0.05,
});

page.drawImage(mentorImg, {
  x: imgX + 40,
  y: yStart - 135,
  width: 100,
  height: 135,
});

} catch {
  console.warn("No se encontró imagen mentor");
}

    return y;
}

//  LLAMAR FUNCIÓN
y = await dibujarMentor({
  page,
  pdfDoc,
  font,
  rgb,
  hexToRgb,
  mentorData,
  yStart: y - 14,
});

const colorLineaMentor = mentorData.colorMentor || "#9333EA";

const hexLinea = colorLineaMentor.replace("#", "");
const rLinea = parseInt(hexLinea.substring(0, 2), 16) / 255;
const gLinea = parseInt(hexLinea.substring(2, 4), 16) / 255;
const bLinea = parseInt(hexLinea.substring(4, 6), 16) / 255;

const lineaYMentor = y + 18;

page.drawLine({
  start: { x: inicioX + 70, y: lineaYMentor },
  end: { x: inicioX + anchoUtil - 70, y: lineaYMentor },
  thickness: 1.5,
  color: rgb(rLinea, gLinea, bLinea),
  opacity: 0.55,
});

page.drawLine({
  start: { x: inicioX + 70, y: lineaYMentor - 1 },
  end: { x: inicioX + anchoUtil - 70, y: lineaYMentor - 1 },
  thickness: 0.5,
  color: rgb(1, 1, 1),
  opacity: 0.18,
});

page.drawCircle({
  x: inicioX + (anchoUtil / 2),
  y: lineaYMentor,
  size: 4,
  color: rgb(
    Math.max(0, rLinea - 0.02),
    Math.max(0, gLinea - 0.02),
    Math.max(0, bLinea - 0.02)
  ),
  opacity: 0.50,
});

page.drawCircle({
  x: inicioX + (anchoUtil / 2),
  y: lineaYMentor,
  size: 2.2,
  color: rgb(
    Math.min(1, rLinea + 0.25),
    Math.min(1, gLinea + 0.25),
    Math.min(1, bLinea + 0.25)
  ),
  opacity: 0.85,
});

async function dibujarInfluencias({
  page,
  font,
  rgb,
  carta,
  yStart,
}) {

  let y = yStart;

  const col1X = 70;
  const col2X = 180;
  const col3X = 300;
  const col4X = 410;

  const lineHeight = 14;

 const colorGuia = carta.colorGuia || "#2563EB";

const hexGuia = colorGuia.replace("#", "");

const rGuia = parseInt(hexGuia.substring(0, 2), 16) / 255;
const gGuia = parseInt(hexGuia.substring(2, 4), 16) / 255;
const bGuia = parseInt(hexGuia.substring(4, 6), 16) / 255;

const barraGuiaY = y;


// degradado horizontal dinámico
const luminosidadGuia = (rGuia + gGuia + bGuia) / 3;

const brilloExtraGuia = luminosidadGuia > 0.7 ? 0.08 : 0.10;
const sombraCentroGuia = 
  luminosidadGuia > 0.7 
    ? 0.22 
    : luminosidadGuia > 0.45
     ? 0.26
     : 0.20;

for (let i = 0; i < anchoUtil; i++) {
  const tGuia = i / anchoUtil;

  let factorGuia;

  if (tGuia < 0.20) {
    factorGuia = 1 + brilloExtraGuia;
  } else if (tGuia < 0.40) {
    factorGuia =
      (1 + brilloExtraGuia) -
      ((tGuia - 0.20) / 0.20) * 0.10;
  } else if (tGuia < 0.60) {
    factorGuia =
      1.00 -
      ((tGuia - 0.40) / 0.20) * sombraCentroGuia;
  } else if (tGuia < 0.80) {
    factorGuia =
      (1 - sombraCentroGuia) +
      ((tGuia - 0.60) / 0.20) * 0.10;
  } else {
    factorGuia =
      (1 - sombraCentroGuia + 0.10) +
      ((tGuia - 0.80) / 0.20) * 0.06;
  }

  const rGuiaFinal = Math.max(0, Math.min(1, rGuia * factorGuia));
  const gGuiaFinal = Math.max(0, Math.min(1, gGuia * factorGuia));
  const bGuiaFinal = Math.max(0, Math.min(1, bGuia * factorGuia));

  page.drawRectangle({
    x: inicioX + i,
    y: barraGuiaY,
    width: 1,
    height: 25,
    color: rgb(rGuiaFinal, gGuiaFinal, bGuiaFinal),
  });
}

// brillo superior
page.drawRectangle({
  x: inicioX,
  y: barraGuiaY + 19,
  width: anchoUtil,
  height: 4,
  color: rgb(1, 1, 1),
  opacity: 0.08,
});

// sombra inferior
page.drawRectangle({
  x: inicioX,
  y: barraGuiaY,
  width: anchoUtil,
  height: 5,
  color: rgb(0, 0, 0),
  opacity: 0.08,
});

// línea clara inferior
page.drawLine({
  start: { x: inicioX, y: barraGuiaY + 24 },
  end: { x: inicioX + anchoUtil, y: barraGuiaY + 24 },
  thickness: 1,
  color: rgb(1, 1, 1),
  opacity: 0.18,
});

// línea oscura superior
page.drawLine({
  start: { x: inicioX, y: barraGuiaY + 1 },
  end: { x: inicioX + anchoUtil, y: barraGuiaY + 1 },
  thickness: 1,
  color: rgb(0, 0, 0),
  opacity: 0.22,
});

// borde exterior
page.drawRectangle({
  x: inicioX,
  y: barraGuiaY,
  width: anchoUtil,
  height: 25,
  borderWidth: 0.5,
  borderColor: rgb(
    Math.max(0, rGuia - 0.18),
    Math.max(0, gGuia - 0.18),
    Math.max(0, bGuia - 0.18)
  ),
  opacity: 0.35,
});

const titulo = "INFLUENCIAS    ANGELICALES";
const w = fontBold.widthOfTextAtSize(titulo, 15);

// sombra principal
page.drawText(titulo, {
  x: ((600 - w) / 2) + 1,
  y: barraGuiaY + 6,
  size: 15,
  font: fontTituloDecorativo,
  color: rgb(0.15, 0.15, 0.15),
  opacity: 0.45,
});

// pequeño brillo superior
page.drawText(titulo, {
  x: ((600 - w) / 2) - 0.3,
  y: barraGuiaY + 7.6,
  size: 15,
  font: fontTituloDecorativo,
  color: rgb(1, 0.96, 0.90),
  opacity: 0.20,
});

// texto principal
page.drawText(titulo, {
  x: (600 - w) / 2,
  y: barraGuiaY + 7,
  size: 15,
  font: fontTituloDecorativo,
  color: rgb(1, 1, 1),
  opacity: 1,
});

y -= 20;

  // 🔹 COLUMNA 1
  const col1 = [
    ["Ángel guía", carta.angelGuia],
    ["Color", mentorData.colorNombreGuia],
  ];

  // 🔹 COLUMNA 2
  const col2 = [
    ["Ángel mes", carta.angelMes],
    ["Ángel signo", carta.angelSigno],
  ];

  // 🔹 COLUMNA 3
  const col3 = [
    ["Ángel día", carta.angelDia],
    ["Color", mentorData.colorNombreDia],
  ];

   // 🔹 COLUMNA 4
  const col4 = [
    ["Ángel hora", carta.angelHora],
    ["Ángel año", carta.angelAnio],
  ];

  const drawColumn = (col, x) => {
    let yCol = y;

    col.forEach(([label, value]) => {
      if (value) {
        page.drawText(`${label}:`, {
  x,
  y: yCol,
  size: 11,
  font: fontBold,
});

page.drawText(String(value), {
  x: x + 65,
  y: yCol,
  size: 11,
  font,
});

        yCol -= lineHeight;
      }
    });

    return yCol;
  };

const y1 = drawColumn(col1, col1X);
const y2 = drawColumn(col2, col2X);
const y3 = drawColumn(col3, col3X);
const y4 = drawColumn(col4, col4X);

// tomar el más bajo
let newY = Math.min(y1, y2, y3, y4);

newY -= 6;

page.drawText("Significado:", {
  x: col1X,
  y: newY,
  size: 11,
  font: fontBold,
});

page.drawText(String(carta.significado || ""), {
  x: col1X + 72,
  y: newY,
  size: 11,
  font,
});

newY -= 10;

const separadorInfY = newY - 2;

page.drawLine({
  start: { x: inicioX + 70, y: separadorInfY },
  end: { x: inicioX + anchoUtil - 70, y: separadorInfY },
  thickness: 1.5,
  color: rgb(rGuia, gGuia, bGuia),
  opacity: 0.55,
});

page.drawLine({
  start: { x: inicioX + 70, y: separadorInfY - 1 },
  end: { x: inicioX + anchoUtil - 70, y: separadorInfY - 1 },
  thickness: 0.5,
  color: rgb(1, 1, 1),
  opacity: 0.18,
});

page.drawCircle({
  x: inicioX + (anchoUtil / 2),
  y: separadorInfY,
  size: 4,
  color: rgb(
    Math.max(0, rGuia - 0.02),
    Math.max(0, gGuia - 0.02),
    Math.max(0, bGuia - 0.02)
  ),
  opacity: 0.50,
});

page.drawCircle({
  x: inicioX + (anchoUtil / 2),
  y: separadorInfY,
  size: 2.2,
  color: rgb(
    Math.min(1, rGuia + 0.25),
    Math.min(1, gGuia + 0.25),
    Math.min(1, bGuia + 0.25)
  ),
  opacity: 0.85,
});

newY -= 3;

return newY - 10;

}

y = await dibujarInfluencias({
  page,
  font,
  rgb,
  hexToRgb,
  carta,
  yStart: y - 14,
});

// SIGNO

async function dibujarSigno({
  page,
  pdfDoc,
  font,
  rgb,
  carta,
  yStart,
}) {

  let y = yStart;

  const imgX = 80;  

  const lineHeight = 14;

  // BARRA
  const colorEsencia = carta.color || "#3B82F6";

const hexEsencia = colorEsencia.replace("#", "");

const rEsencia = parseInt(hexEsencia.substring(0, 2), 16) / 255;
const gEsencia = parseInt(hexEsencia.substring(2, 4), 16) / 255;
const bEsencia = parseInt(hexEsencia.substring(4, 6), 16) / 255;

const barraEsenciaY = y;

// degradado horizontal dinámico
const luminosidadEsencia = (rEsencia + gEsencia + bEsencia) / 3;

const brilloExtraEsencia = luminosidadEsencia > 0.7 ? 0.08 : 0.10;
const sombraCentroEsencia =
  luminosidadEsencia > 0.7
    ? 0.22
    : luminosidadEsencia > 0.45
      ? 0.26
      : 0.20;

for (let i = 0; i < anchoUtil; i++) {
  const tEsencia = i / anchoUtil;

  let factorEsencia;

  if (tEsencia < 0.20) {
    factorEsencia = 1 + brilloExtraEsencia;
  } else if (tEsencia < 0.40) {
    factorEsencia =
      (1 + brilloExtraEsencia) -
      ((tEsencia - 0.20) / 0.20) * 0.10;
  } else if (tEsencia < 0.60) {
    factorEsencia =
      1.00 -
      ((tEsencia - 0.40) / 0.20) * sombraCentroEsencia;
  } else if (tEsencia < 0.80) {
    factorEsencia =
      (1 - sombraCentroEsencia) +
      ((tEsencia - 0.60) / 0.20) * 0.10;
  } else {
    factorEsencia =
      (1 - sombraCentroEsencia + 0.10) +
      ((tEsencia - 0.80) / 0.20) * 0.06;
  }

  const rEsenciaFinal = Math.max(0, Math.min(1, rEsencia * factorEsencia));
  const gEsenciaFinal = Math.max(0, Math.min(1, gEsencia * factorEsencia));
  const bEsenciaFinal = Math.max(0, Math.min(1, bEsencia * factorEsencia));

  page.drawRectangle({
    x: inicioX + i,
    y: barraEsenciaY,
    width: 1,
    height: 25,
    color: rgb(rEsenciaFinal, gEsenciaFinal, bEsenciaFinal),
  });
}

// brillo superior
page.drawRectangle({
  x: inicioX,
  y: barraEsenciaY + 19,
  width: anchoUtil,
  height: 4,
  color: rgb(1, 1, 1),
  opacity: 0.08,
});

// sombra inferior
page.drawRectangle({
  x: inicioX,
  y: barraEsenciaY,
  width: anchoUtil,
  height: 5,
  color: rgb(0, 0, 0),
  opacity: 0.08,
});

// línea clara inferior
page.drawLine({
  start: { x: inicioX, y: barraEsenciaY + 24 },
  end: { x: inicioX + anchoUtil, y: barraEsenciaY + 24 },
  thickness: 1,
  color: rgb(1, 1, 1),
  opacity: 0.18,
});

// línea oscura superior
page.drawLine({
  start: { x: inicioX, y: barraEsenciaY + 1 },
  end: { x: inicioX + anchoUtil, y: barraEsenciaY + 1 },
  thickness: 1,
  color: rgb(0, 0, 0),
  opacity: 0.22,
});

// borde exterior
page.drawRectangle({
  x: inicioX,
  y: barraEsenciaY,
  width: anchoUtil,
  height: 25,
  borderWidth: 0.5,
  borderColor: rgb(
    Math.max(0, rEsencia - 0.18),
    Math.max(0, gEsencia - 0.18),
    Math.max(0, bEsencia - 0.18)
  ),
  opacity: 0.35,
});

const tituloEsencia = "ESENCIAS    LOCIÓN    ANGELICAL";
const tituloEsenciaWidth = fontBold.widthOfTextAtSize(tituloEsencia, 15);

page.drawText(tituloEsencia, {
  x: ((600 - tituloEsenciaWidth) / 2) + 0.5,
  y: barraEsenciaY + 6.4,
  size: 15,
  font: fontTituloDecorativo,
  color: rgb(0.12, 0.08, 0.02),
  opacity: 0.35,
});

page.drawText(tituloEsencia, {
  x: ((600 - tituloEsenciaWidth) / 2) - 0.2,
  y: barraEsenciaY + 7.4,
  size: 15,
  font: fontTituloDecorativo,
  color: rgb(1, 0.95, 0.88),
  opacity: 0.18,
});

page.drawText(tituloEsencia, {
  x: (600 - tituloEsenciaWidth) / 2,
  y: barraEsenciaY + 7,
  size: 15,
  font: fontTituloDecorativo,
  color: rgb(1, 1, 1),
});

y -= 20;

  //  IMAGEN SIGNO
  try {
    const signoBytes = await fetch(`/assets/pdf/signos/${carta.signo.toLowerCase()}.png`)
      .then(r => r.arrayBuffer());

    const signoImg = await pdfDoc.embedPng(signoBytes);

    

   page.drawCircle({
    x: imgX + 27,
    y: y - 18,
    size: 30,
    color: rgb(1, 0.72, 0.08),
    opacity: 0.10,
    });

    page.drawCircle({
    x: imgX + 27,
    y: y - 18,
    size: 24,
    color: rgb(1, 0.85, 0.25),
    opacity: 0.14,
    });

    page.drawCircle({
    x: imgX + 27,
    y: y - 18,
    size: 18,
    color: rgb(1, 0.95, 0.5),
    opacity: 0.08,
    });

    page.drawImage(signoImg, {
      x: imgX ,
      y: y - 45,
      width: 55,
      height: 55,
      opacity:0.85,
    });

  } catch {
    console.warn("No se encontró imagen signo");
  }

  // TEXTO EN COLUMNAS
  const esenciacol1X = 150;
  const esenciacol2X = 330;

  const drawLine = (l1, v1, l2, v2) => {

  if (v1) {
    page.drawText(`${l1}:`, {
      x: esenciacol1X,
      y,
      size: 11,
      font: fontBold,
    });

    page.drawText(String(v1), {
      x: esenciacol1X + 85,
      y,
      size: 11,
      font,
    });
  }

  if (v2) {
    page.drawText(`${l2}:`, {
      x: esenciacol2X,
      y,
      size: 11,
      font: fontBold,
    });

    page.drawText(String(v2), {
      x: esenciacol2X + 95,
      y,
      size: 11,
      font,
    });
  }

  y -= lineHeight;
};

  drawLine("Esencia signo", carta.esenciaSigno, "Esencia mes", carta.esenciaMes);
  drawLine("Esencia día", carta.esenciaDia, "Esencia mentor", carta.esenciaMentor);
  drawLine("Ángel guarda", carta.esenciaAngelGuarda, "", "");

  y -= 5;

  const colorTextoPrincipal = rgb(0.18, 0.09, 0.03);

  page.drawText("Sirve para:", {
  x: esenciacol1X,
  y,
  size: 11,
  font: fontBold,
  color: colorTextoPrincipal,
});

page.drawText(String(carta.sirvePara || ""), {
  x: esenciacol1X + 83,
  y,
  size: 11,
  font,
  color: colorTextoPrincipal,
});

y -= 10;

return y;
}

y = await dibujarSigno({
  page,
  pdfDoc,
  font,
  rgb,
  hexToRgb,
  carta,
  yStart: y - 20,
});

y -= 5;

const separadorEsenciasY = y - 5;

page.drawLine({
  start: { x: inicioX + 90, y: separadorEsenciasY },
  end: { x: inicioX + anchoUtil - 90, y: separadorEsenciasY },
  thickness: 1.2,
  color: rgb(rBase, gBase, bBase),
  opacity: 0.55,
});

// círculo exterior
page.drawCircle({
  x: inicioX + (anchoUtil / 2),
  y: separadorEsenciasY,
  size: 4,
  color: rgb(
    Math.max(0, rBase - 0.02),
    Math.max(0, gBase - 0.02),
    Math.max(0, bBase - 0.02)
  ),
  opacity: 0.50,
});

// círculo interior
page.drawCircle({
  x: inicioX + (anchoUtil / 2),
  y: separadorEsenciasY,
  size: 2.2,
  color: rgb(
    Math.min(1, rBase + 0.25),
    Math.min(1, gBase + 0.25),
    Math.min(1, bBase + 0.25)
  ),
  opacity: 0.85,
});

y = separadorEsenciasY;

const propositoBoxX = 95;
const propositoBoxWidth = page.getWidth() - 190;
const propositoBoxHeight = 62;
const propositoBoxY = y - propositoBoxHeight;

// Fondo translúcido
page.drawRectangle({
  x: propositoBoxX,
  y: propositoBoxY,
  width: propositoBoxWidth,
  height: propositoBoxHeight,
  color: rgb(1, 1, 1),
  opacity: 0.10,
});

// Título
const tituloProposito = 'PROPOSITO    DEL    ÁNGEL    DE    LA    GUARDA';
const tituloWidth = fontBold.widthOfTextAtSize(tituloProposito, 15);

page.drawText(tituloProposito, {
  x: propositoBoxX + (propositoBoxWidth - tituloWidth) / 2,
  y: propositoBoxY + 45,
  size: 15,
  font: fontTituloDecorativo,
  color: rgb(0.16, 0.10, 0.06),
});

// Frase
const fraseTexto = `“${mensajeAngel}”`;
const fraseSize = 15;
const fraseMaxWidth = propositoBoxWidth - 80;

// Separar manualmente en palabras
const palabras = fraseTexto.split(' ');
const lineas = [];
let lineaActual = '';

for (const palabra of palabras) {
  const pruebaLinea = lineaActual ? `${lineaActual} ${palabra}` : palabra;
  const anchoPrueba = cardoItalicFont.widthOfTextAtSize(pruebaLinea, fraseSize);

  if (anchoPrueba <= fraseMaxWidth) {
    lineaActual = pruebaLinea;
  } else {
    lineas.push(lineaActual);
    lineaActual = palabra;
  }
}

if (lineaActual) {
  lineas.push(lineaActual);
}

// Dibujar cada línea centrada
let lineaY = propositoBoxY + 18;

lineas.forEach((linea) => {
  const lineaWidth = fontBold.widthOfTextAtSize(linea, fraseSize);
  const lineaX = propositoBoxX + (propositoBoxWidth - lineaWidth) / 2;

  // sombra principal
  page.drawText(linea, {
    x: lineaX + 0.8,
    y: lineaY - 0.5,
    size: fraseSize,
    font: fontBold,
    color: rgb(0.08, 0.04, 0.02),
    opacity: 0.35,
  });

  // brillo superior suave
  page.drawText(linea, {
    x: lineaX - 0.2,
    y: lineaY + 0.2,
    size: fraseSize,
    font: fontBold,
    color: rgb(0.92, 0.85, 0.72),
    opacity: 0.10,
  });

  // texto principal
  page.drawText(linea, {
    x: lineaX,
    y: lineaY,
    size: fraseSize,
    font: fontBold,
    color: rgb(0.15, 0.08, 0.03),
  });

  lineaY -= 14;
});

// Actualizar y
y = propositoBoxY -15;

if (
  nombreAngeologo &&
  nombreAngeologo !== "Nombre del Angeólogo" &&
  tituloAngeologo &&
  tituloAngeologo !== "Título del Angeólogo"
) {

  page.drawText("Angeólogo", {
    x: 260,
    y,
    size: 11,
    font: fontBold,
  });

  y -= 18;

const nombreSize = 12;
const nombreAncho = cardoItalicFont.widthOfTextAtSize(nombreAngeologo, nombreSize);

page.drawText(nombreAngeologo, {
  x: (page.getWidth() - nombreAncho) / 2,
  y,
  size: nombreSize,
  font: cardoItalicFont,
  color: rgb(0.28, 0.18, 0.10),
});

  y -= 16;
const tituloAncho = font.widthOfTextAtSize(tituloAngeologo, 10);

const tituloX = propositoBoxX + ((propositoBoxWidth - tituloAncho) / 2)- 30;

page.drawText(tituloAngeologo, {
  x: tituloX,
  y,
  size: 10,
  font: fontTitulo,
});

} else {

  try {
    const florBytes = await fetch("/assets/pdf/flor-vida.png")
      .then(r => r.arrayBuffer());

    const florImg = await pdfDoc.embedPng(florBytes);

    y -=10;

    page.drawImage(florImg, {
  x: inicioX + (anchoUtil / 2) - 32,
  y: y - 40,
  width: 64,
  height: 44,
  });

  } catch {
    console.warn("No se encontró imagen flor de vida");
  }
}


const fechaTexto = carta.fecha || "";

const nombreArchivo = `${nombreTexto || "PACIENTE"}_${fechaTexto || "SIN_FECHA"}`
  .replace(/[\\/:*?"<>|]/g, "_")
  .replace(/\s+/g, "_");

const pdfBytes = await pdfDoc.save();

const blob = new Blob([pdfBytes], { type: "application/pdf" });
const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = `${nombreArchivo}.pdf`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);

URL.revokeObjectURL(url);
}

const auraColor = (hex, alpha) => {
  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);
  return `rgba(${r},${g},${b},${alpha})`;
};  

const modoPDF = false;

if (!carta) return null;

const datosMentor = Object.values(tablaMentor).find(
  m => m.mentor.toLowerCase() === carta.mentor.toLowerCase()


);
const nombreAngeologo = localStorage.getItem("nombreAngeologo") || "Nombre del Angeólogo";
const tituloAngeologo = localStorage.getItem("tituloAngeologo") || "Título del Angeólogo";

const colorGuardian = carta.color;
const colorMentor = datosMentor?.colorMentor;
const colorGuia = datosMentor?.colorGuia;
const nombreColorGuardian = tablaCartas[carta.numero]?.colorNombre;
const mensajeAngel = tablaCartas[carta.numero]?.mensaje;


const nombreColorMentor = datosMentor?.colorNombreMentor;
const nombreColorGuia = datosMentor?.colorNombreGuia;
const nombreColorDia = datosMentor?.colorNombreDia;


/* función para decidir color del texto */
const colorTexto = (hex) => {

  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);

  const brillo = (r*299 + g*587 + b*114) / 1000;

  return brillo > 160 ? "#111827" : "#FFFFFF";

};

function hexToRGBA(hex, alpha = 0.45) {

  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);

  return `rgba(${r},${g},${b},${alpha})`;

}

const auraGuardian1 = hexToRGBA(colorGuardian, 0.55);
const auraGuardian2 = hexToRGBA(colorGuardian, 0.35);

const tamañoNombre =
carta.nombre.length > 35 ? "32px" :
carta.nombre.length > 28 ? "36px" :
"40px";

return (

<div>

<div id="pdfArea">


<div
id="cartaPDF"
className="cartaPDF"
style={{

backgroundColor:"#efe3c4",  

backgroundImage: `url("/assets/pdf/fondo.jpg")`,
backgroundSize: "100% 100%",
backgroundPosition: "center",
backgroundRepeat: "no-repeat",

padding: "40px clamp(18px, 5vw, 85px) 100px clamp(18px, 5vw, 85px)",
minHeight:"1150px",

boxShadow:`
0 10px 30px rgba(0,0,0,0.25),
inset 0 0 40px rgba(80,60,30,0.35),
inset 0 -35px 60px rgba(80,60,30,0.28)
`,

borderRadius:"18px",

width:"100%",
maxWidth:"1100px",
overflow:"hidden",
display:"block",

color:"#2a1a0f",
margin:"auto",

fontFamily:"IM Fell English, serif",
fontWeight:"600",
letterSpacing:"0.2px"

}}
>

{/* CABECERA */}

<div style={{marginBottom:"2px"}}>

<div style={{

fontFamily:"Cinzel Decorative, serif",
fontSize:tamañoNombre,
fontWeight:"700",
letterSpacing:"3px",
textAlign:"center",

color:"#5b341c",

textShadow:`
0 1px 0 rgba(255,255,255,0.35),
0 2px 3px rgba(0,0,0,0.18),
0 0 6px rgba(255,220,140,0.12)
`,

background:"radial-gradient(circle at top, rgba(255,220,140,0.35) 0%, rgba(255,220,140,0.15) 35%, rgba(255,220,140,0) 70%)",

padding:"10px 20px",
borderRadius:"10px",


marginTop:"130px",
marginBottom:"4px",
lineHeight:"1.25"

}}>
{carta.nombre}
</div>

<div
  style={{
    background:"rgba(255,255,255,0.10)",
    border:"1px solid rgba(80,60,30,0.2)",
    fontFamily:"serif",
    letterSpacing:"1px",
    padding:"4px 10px",
    width: "calc(100% - 80px)",
    margin:"0 auto",
    textAlign:"center",
    borderRadius:"8px",
    fontSize:"20px"
  }}
>
  {(() => {
    const horaTexto = carta.hora
      ? (() => {
          const [hora, minuto] = carta.hora.split(":");
          const h = parseInt(hora, 10);
          const periodo = h >= 12 ? "PM" : "AM";
          const hora12 = h % 12 || 12;

          return ` | Hora: ${hora12}:${minuto} ${periodo}`;
        })()
      : "";

    return `Nacimiento: ${carta.fecha} | Día: ${carta.diaNacimiento}${horaTexto} | Signo: ${carta.signo}`;
  })()}
</div>

</div>

{/* ANGEL DE LA GUARDA */}

<div style={{
  borderRadius:"8px",
  background:"rgba(255,255,255,0.10)",
  border:"1px solid rgba(80,60,30,0.2)",
  marginBottom:"18px",
  width: "calc(100% - 80px)",
  margin:"0 auto 18px auto"
}}>

  <div style={{
    background: `linear-gradient(
  90deg,
  ${colorGuardian}99 0%,
  ${colorGuardian}CC 15%,
  ${colorGuardian} 28%,
  #081a4d 50%,
  ${colorGuardian} 72%,
  ${colorGuardian}CC 85%,
  ${colorGuardian}99 100%
)`,
    color: colorTexto(colorGuardian),
    padding:"8px",
    fontSize:"24px",
    fontWeight:"700",
    fontFamily:"Cinzel Decorative, serif",
    textAlign:"center",
    letterSpacing:"3px",
    wordSpacing:"10px",
    textTransform:"uppercase",
    width:"100%",
    margin:"0 auto",
    textShadow:`
    0 1px 0 rgba(255,255,255,0.25),
    0 2px 4px rgba(0,0,0,0.35)
    `,
    borderTop:"1px solid rgba(255,255,255,0.22)",
    borderBottom:"1px solid rgba(0,0,0,0.28)",
    boxShadow:`
      inset 0 2px 0 rgba(255,255,255,0.18),
      inset 0 -2px 0 rgba(0,0,0,0.25)
      0 2px 6px rgba(0,0,0,0.15)
    `
  }}>
    ANGEL DE LA GUARDA
  </div>

  <div style={{
    display:"grid",
    gridTemplateColumns:"220px 1fr",
    gap:"25px",
    padding:"15px"
  }}>


{/* IMAGEN */}

<div style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
position:"relative"
}}>

<div style={{
  position:"absolute",
  width:"520px",
  height:"560px",
  borderRadius:"50% / 60%",
  background: modoPDF
    ? "radial-gradient(circle, rgba(255,200,120,0.4) 0%, transparent 70%)"
    : "none",
  zIndex:0
}}/>  

<div
  className="auraAngel"
  style={{
    position:"absolute",
    width: modoPDF ? "420px" : "380px",
    height: modoPDF ? "460px" : "420px",
    borderRadius:"50% / 60%",

   background: modoPDF
  ? `
    radial-gradient(circle,
      ${auraColor(colorGuardian, 0.45)} 0%,
      ${auraColor(colorGuardian, 0.25)} 20%,
      ${auraColor(colorGuardian, 0.18)} 40%,
      ${auraColor(colorGuardian, 0.10)} 60%,
      ${auraColor(colorGuardian, 0.05)} 75%,
      rgba(0,0,0,0) 90%
    )
  `
  : `
    radial-gradient(circle,
      ${auraColor(colorGuardian, 0.65)} 0%,
      ${auraColor(colorGuardian, 0.35)} 35%,
      ${auraColor(colorGuardian, 0.15)} 55%,
      rgba(0,0,0,0) 70%
    )
  `,

    filter: modoPDF ? "none" : "blur(35px)",
    mixBlendMode: modoPDF ? "normal" : "screen",

    opacity: modoPDF ? 0.85 : 0.85,
    

    zIndex:"1"
  }}
/>

<img
src={`/angeles/${carta.angel.toLowerCase()}.webp`}
alt={carta.angel}
style={{

maxHeight:"280px",
width:"auto",

position:"relative",
zIndex:"2",

WebkitMaskImage:"radial-gradient(ellipse, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
maskImage:"radial-gradient(ellipse, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",

 filter: `
  drop-shadow(0 12px 18px rgba(0,0,0,0.45))
  drop-shadow(0 0 45px ${auraGuardian1})
  drop-shadow(0 0 90px ${auraGuardian2})
`


}}
/>

</div>


{/* TEXTO */}

<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"4px 28px",
fontSize:"17px",
fontFamily:"IM Fell English, serif",
lineHeight:"1.3",
textAlign:"justify",
letterSpacing:"0.5px",

color:"#3a2f1d",

mixBlendMode:"multiply",
opacity:0.92,
filter:"contrast(0.95)",

textShadow:`
0 1px 0 #f7edd6,
0 -1px 0 #8a6f45,
0 0 2px rgba(0,0,0,0.15)
`
}}
>

<p style={{margin:"1px 0",color:"#7a624d"}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Número:</span> {carta.numero}
</p>

<p style={{margin:"1px 0",color:"#7a624d"}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Ángel:</span> {carta.angel}
</p>

<p style={{margin:"1px 0",color:"#7a624d"}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Color:</span> {nombreColorGuardian}
</p>

<p style={{margin:"1px 0",color:"#7a624d"}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Planeta:</span> {carta.planeta}
</p>

<p style={{margin:"1px 0",color:"#7a624d"}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Talismán:</span> {carta.talisman}
</p>

<p style={{margin:"1px 0",color:"#7a624d"}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Aroma:</span> {carta.aroma}
</p>

<p style={{margin:"1px 0",color:"#7a624d"}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Atributo:</span> {carta.atributo}
</p>

<p style={{margin:"1px 0",color:"#7a624d"}}>
  <span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Ofrenda:</span> {carta.ofrenda}
</p>

<p style={{
  margin:"1px 0",
  gridColumn:"1 / span 2",color:"#7a624d"
}}>
  <span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Coro Angelical:</span> {carta.coroAngelical}
</p>

<p style={{
  margin:"1px 0",
  gridColumn:"1 / span 2",color:"#7a624d"
}}>
  <span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Hora Canalización:</span> {carta.horaCanalizacion}
</p>

<p style={{
gridColumn:"1 / span 2",
margin:"4px 0",
fontSize:"16px",
lineHeight:"1.35",
color:"#7a624d"
}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Se canaliza para:</span> {carta.seCanalizaPara}
</p>

<p style={{
gridColumn:"1 / span 2",
margin:"4px 0",
fontSize:"16px",
lineHeight:"1.35",
color:"#7a624d"
}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Don del ser de luz:</span> {carta.donSerDeLuz}
</p>

</div>

</div>

</div>

<div
  style={{
    position:"relative",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    margin:"28px 0"
  }}
>
  <div
    style={{
      width:"100%",
      height:"2px",
      background:`linear-gradient(
        90deg,
        transparent 0%,
        ${colorGuardian} 20%,
        ${colorGuardian} 80%,
        transparent 100%
      )`,
      boxShadow:`0 0 8px ${colorGuardian}66`
    }}
  />

  <div
    style={{
      position:"absolute",
      width:"12px",
      height:"12px",
      borderRadius:"50%",
      background:colorGuardian,
      boxShadow:`
        0 0 0 2px rgba(0,0,0,0.18),
        0 0 8px ${colorGuardian}88,
        inset 0 1px 2px rgba(255,255,255,0.4)
      `
    }}
  />
</div>

{/* ANGEL MENTOR */}

<div style={{
  borderRadius:"8px",
  background:"rgba(255,255,255,0.10)",
  border:"1px solid rgba(80,60,30,0.2)",
  marginBottom:"18px",
  width:"calc(100% - 80px)",
  margin:"0 auto 18px auto"
}}>

  <div style={{
    background: `linear-gradient(
  90deg,
  ${colorMentor}99 0%,
  ${colorMentor}CC 15%,
  ${colorMentor} 28%,
  #2e1065 50%,
  ${colorMentor} 72%,
  ${colorMentor}CC 85%,
  ${colorMentor}99 100%
)`,
    color: colorTexto(colorMentor),
    padding:"8px",
    fontSize:"24px",
    fontWeight:"700",
    fontFamily:"Cinzel Decorative, serif",
    textAlign:"center",
    letterSpacing:"3px",
    wordSpacing:"10px",
    width:"100%",
    margin:"0 auto",
    textShadow:`
    0 1px 0 rgba(255,255,255,0.25),
    0 2px 4px rgba(0,0,0,0.35)
    `,
    borderTop:"1px solid rgba(255,255,255,0.22)",
    borderBottom:"1px solid rgba(0,0,0,0.28)",
    boxShadow:`
      inset 0 2px 0 rgba(255,255,255,0.18),
      inset 0 -2px 0 rgba(0,0,0,0.25)
      0 2px 6px rgba(0,0,0,0.15)
    `
  }}>
    ANGEL MENTOR
  </div>

<div style={{
padding:"14px 8px 14px 18px",
display:"grid",
gridTemplateColumns:"1fr 260px",
gap:"24px",
alignItems:"center"
}}>


<div style={{
display:"grid",
gridTemplateColumns:"0.95fr 1.05fr",
gap:"8px 34px",
fontSize:"16px",
fontFamily:"IM Fell English, serif",
letterSpacing:"0.5px",
lineHeight:"1.25",
paddingLeft:"4px",
color:"#3d2b1f",
mixBlendMode:"multiply",
textShadow:`
0 1px 0 #f7edd6,
0 -1px 0 #8a6f45,
0 0 2px rgba(0,0,0,0.15)
`
}}>

<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Mentor:</b> {carta.mentor}</p>
<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Color:</b> {nombreColorMentor}</p>

<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Código Sagrado:</b> {carta.mentorCodigo}</p>
<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Planeta:</b> {carta.planetaMentor}</p>

<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Atributo:</b> {carta.atributoMentor}</p>
<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Aroma:</b> {carta.aromaMentor}</p>

<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Gracia:</b> {carta.graciaMentor}</p>
<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Gemas:</b> {carta.gemasMentor}</p>

<p style={{gridColumn:"1 / span 2", margin:"2px 0",color:"#7a624d"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Se canaliza para:</b> {carta.canalizacionMentor}
</p>

<p style={{gridColumn:"1 / span 2", margin:"2px 0",color:"#7a624d"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Don:</b> {carta.donMentor}
</p>

</div>


<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"flex-start"
}}>

<div style={{
display:"flex",
justifyContent:"flex-end",
alignItems:"center",
position:"relative",
marginTop:"6px"
}}>

  <div style={{
position:"absolute",
width:"260px",
height:"260px",
background: modoPDF
  ? `
    radial-gradient(circle,
      ${auraColor(colorMentor, 0.25)} 0%,
      ${auraColor(colorMentor, 0.18)} 35%,
      ${auraColor(colorMentor, 0.10)} 55%,
      ${auraColor(colorMentor, 0.05)} 75%,
      rgba(0,0,0,0) 100%
    )
  `
  : `
    radial-gradient(circle,
      ${auraColor(colorMentor, 0.45)} 0%,
      ${auraColor(colorMentor, 0.25)} 40%,
      ${auraColor(colorMentor, 0.12)} 65%,
      rgba(0,0,0,0) 80%
    )
  `,
filter:"blur(14px)",
zIndex:0
}}/>

 <img
  src={`/mentores/${carta.mentor.toLowerCase()}.webp`}
  alt={carta.mentor}
  style={{
    position:"relative",
    zIndex:1,
    marginTop:"-20px",
    width:"260px",
    height:"260px",
    maxWidth:"260px",
    objectFit:"contain",

    // 🔥 SOLO aplicar máscara en APP
    WebkitMaskImage: modoPDF ? "none" : `
      radial-gradient(ellipse 75% 90% at center, black 75%, transparent 100%),
      linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)
    `,
    maskImage: modoPDF ? "none" : `
      radial-gradient(ellipse 75% 90% at center, black 75%, transparent 100%),
      linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)
    `,

    // 🔥 SOMBRA DIFERENTE PARA PDF
    filter: modoPDF
      ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
      : "drop-shadow(0 12px 18px rgba(0,0,0,0.35))",

    background:"transparent"
  }}
/>
 

</div>

</div>

</div>

</div>

<div
  style={{
    position:"relative",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    margin:"28px 0"
  }}
>
  <div
    style={{
      width:"100%",
      height:"2px",
      background:`linear-gradient(
        90deg,
        transparent 0%,
        ${colorMentor} 20%,
        ${colorMentor} 80%,
        transparent 100%
      )`,
      boxShadow:`0 0 8px ${colorMentor}66`
    }}
  />

  <div
    style={{
      position:"absolute",
      width:"16px",
      height:"16px",
      borderRadius:"50%",
      background:colorMentor,
      boxShadow:`
        0 0 0 2px rgba(0,0,0,0.18),
        0 0 12px ${colorMentor}88,
        inset 0 2px 3px rgba(255,255,255,0.45)
      `
    }}
  />
</div>

{/* INFLUENCIAS ANGELICALES */}

<div style={{
  borderRadius:"8px",
  background:"rgba(255,255,255,0.10)",
  border:"1px solid rgba(80,60,30,0.2)",
  marginBottom:"18px",
  width:"calc(100% - 80px)",
  margin:"0 auto 18px auto"
}}>

  <div style={{
    background: `linear-gradient(
  90deg,
  ${colorGuia}99 0%,
  ${colorGuia}CC 15%,
  ${colorGuia} 28%,
  #0f172a 50%,
  ${colorGuia} 72%,
  ${colorGuia}CC 85%,
  ${colorGuia}99 100%
)`,
    color: colorTexto(colorGuia),
    padding:"8px",
    fontSize:"24px",
    fontWeight:"700",
    fontFamily:"Cinzel Decorative, serif",
    textAlign:"center",
    letterSpacing:"3px",
    wordSpacing:"10px",
    width:"100%",
    margin:"0 auto",
    textShadow:`
    0 1px 0 rgba(255,255,255,0.25),
    0 2px 4px rgba(0,0,0,0.35)
    `,
    borderTop:"1px solid rgba(255,255,255,0.22)",
    borderBottom:"1px solid rgba(0,0,0,0.28)",
    boxShadow:`
      inset 0 2px 0 rgba(255,255,255,0.18),
      inset 0 -2px 0 rgba(0,0,0,0.25)
      0 2px 6px rgba(0,0,0,0.15)
    `
  }}>
    INFLUENCIAS ANGELICALES
  </div>

<div style={{
  padding:"18px",
  display:"grid",
  gridTemplateColumns:"1fr 1fr 1fr 1fr",
  gap:"12px 18px",
  fontSize:"15px",
  fontFamily:"IM Fell English, serif",
  letterSpacing:"0.4px",
  lineHeight:"1.2",
  color:"#6f5742",
  mixBlendMode:"multiply",
  textShadow:`
    0 1px 0 #f7edd6,
    0 -1px 0 #8a6f45,
    0 0 2px rgba(0,0,0,0.15)
  `
}}>

  <div>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Ángel guía:</b> {carta.angelGuia}
    </p>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Color:</b> {nombreColorGuia}
    </p>
  </div>

  <div>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Ángel mes:</b> {carta.angelMes}
    </p>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Ángel signo:</b> {carta.angelSigno}
    </p>
  </div>

  <div>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Ángel día:</b> {carta.angelDia}
    </p>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Color:</b> {nombreColorDia}
    </p>
  </div>

  <div>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Ángel hora:</b> {carta.angelHora}
    </p>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Ángel año:</b> {carta.angelAnio}
    </p>
  </div>

  <div style={{gridColumn:"1 / span 4", marginTop:"4px"}}>
    <p style={{margin:"2px 0",color:"#7a624d"}}>
      <b style={{color:"#3a2414",fontWeight:"700"}}>Significado:</b> {carta.significado}
    </p>
  </div>

</div>

</div>

<div
  style={{
    position:"relative",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    margin:"28px 0"
  }}
>
  <div
    style={{
      width:"100%",
      height:"2px",
      background:`linear-gradient(
        90deg,
        transparent 0%,
        ${colorGuia} 20%,
        ${colorGuia} 80%,
        transparent 100%
      )`,
      boxShadow:`0 0 8px ${colorGuia}66`
    }}
  />

  <div
    style={{
      position:"absolute",
      width:"16px",
      height:"16px",
      borderRadius:"50%",
      background:colorGuia,
      boxShadow:`
        0 0 0 2px rgba(0,0,0,0.18),
        0 0 12px ${colorGuia}88,
        inset 0 2px 3px rgba(255,255,255,0.45)
      `
    }}
  />
</div>

{/* ESENCIAS */}

<div style={{
  borderRadius:"8px",
  background:"rgba(255,255,255,0.10)",
  border:"1px solid rgba(80,60,30,0.2)",
  width:"calc(100% - 80px)",
  margin:"0 auto 18px auto"
}}>

  <div style={{
  background: `linear-gradient(
    90deg,
    ${colorGuardian}99 0%,
    ${colorGuardian}CC 15%,
    ${colorGuardian} 28%,
    #0f172a 50%,
    ${colorGuardian} 72%,
    ${colorGuardian}CC 85%,
    ${colorGuardian}99 100%
  )`,
  color:colorTexto(colorGuardian),
  padding:"8px",
  fontSize:"24px",
  fontWeight:"700",
  fontFamily:"Cinzel Decorative, serif",
  textAlign:"center",
  letterSpacing:"3px",
  wordSpacing:"10px",
  width:"100%",
  margin:"0 auto",
  borderTop:"1px solid rgba(255,255,255,0.22)",
  borderBottom:"1px solid rgba(0,0,0,0.28)",
  boxShadow:`
    inset 0 2px 0 rgba(255,255,255,0.18),
    inset 0 -2px 0 rgba(0,0,0,0.25)
    0 2px 6px rgba(0,0,0,0.15)
  `
}}>
    ESENCIAS LOCION ANGELICAL
  </div>

<div style={{
display:"grid",
gridTemplateColumns:"200px 1fr",
gap:"20px",
padding:"18px"
}}>

<div style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
position:"relative"
}}>

 <div
  style={{
    position:"absolute",

    width: modoPDF ? "200px" : "180px",
    height: modoPDF ? "200px" : "180px",

    borderRadius:"50%",

    background: modoPDF
      ? `
        radial-gradient(circle,
          rgba(255,210,120,0.45) 0%,
          rgba(255,190,90,0.25) 40%,
          rgba(255,170,60,0.12) 65%,
          rgba(255,150,40,0.05) 80%,
          rgba(0,0,0,0) 100%
        )
      `
      : `
        radial-gradient(circle,
          rgba(255,210,120,0.6) 0%,
          rgba(255,190,90,0.35) 40%,
          rgba(255,170,60,0.18) 65%,
          rgba(0,0,0,0) 80%
        )
      `,

    filter: modoPDF ? "none" : "blur(18px)",
    mixBlendMode: modoPDF ? "normal" : "screen",

    opacity: modoPDF ? 0.7 : 0.9,

    zIndex:0
  }}
/> 

<div style={{
  position:"absolute",
  width:"180px",
  height:"180px",
  borderRadius:"50%",

  background: modoPDF
  ? `
    radial-gradient(circle,
      rgba(255,240,180,0.9) 0%,
      rgba(255,220,150,0.6) 25%,
      rgba(255,200,100,0.35) 45%,
      rgba(255,180,80,0.15) 65%,
      rgba(255,150,60,0.05) 80%,
      rgba(255,120,40,0) 100%
    )
  `
  : `
    radial-gradient(circle,
      rgba(255,215,120,0.5) 0%,
      rgba(255,200,100,0.3) 35%,
      rgba(255,180,80,0.15) 55%,
      rgba(255,150,60,0.05) 70%,
      rgba(255,120,40,0) 100%
    )
  `,

  filter: modoPDF ? "none" : "blur(18px)",
  opacity: 1,
  zIndex:1
}}/>

<img
src={`/signos/${carta.signo.toLowerCase()}.webp`}
alt={carta.signo}
style={{
width:"140px",

maskImage:"radial-gradient(circle, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
WebkitMaskImage:"radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",

filter: modoPDF
  ? `
    drop-shadow(0 0 12px rgba(255,215,120,0.9))
    drop-shadow(0 0 22px rgba(255,200,100,0.7))
  `
  : `
    drop-shadow(0 0 18px rgba(255,215,120,0.9))
    drop-shadow(0 0 35px rgba(255,215,120,0.6))
    drop-shadow(0 0 60px rgba(255,215,120,0.4))
  `,

transform: modoPDF ? "scale(1.08)" : "scale(1)",

position:"relative",
zIndex:2,

}}
/>

</div>


<div style={{
padding:"18px",
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"6px 14px",

fontSize:"16px",
fontFamily:"IM Fell English, serif",
letterSpacing:"0.4px",
lineHeight:"1.15",

color:"#3d2b1f",
mixBlendMode:"multiply",

textShadow:`
0 1px 0 #f7edd6,
0 -1px 0 #8a6f45,
0 0 2px rgba(0,0,0,0.15)
`
}}>

<p style={{margin:"2px 0", color:"#6f5742"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Esencia por signo:</b> {carta.esenciaSigno}
</p>

<p style={{margin:"2px 0", color:"#6f5742"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Esencia por mes:</b> {carta.esenciaMes}
</p>

<p style={{margin:"2px 0", color:"#6f5742"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Esencia por día:</b> {carta.esenciaDia}
</p>

<p style={{margin:"2px 0", color:"#6f5742"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Esencia mentor:</b> {carta.esenciaMentor}
</p>

<p style={{gridColumn:"1 / span 2", margin:"2px 0", color:"#6f5742"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Esencia ángel guarda:</b> {carta.esenciaAngelGuarda}
</p>

<p style={{gridColumn:"1 / span 2", margin:"2px 0", color:"#6f5742"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Sirve para:</b> {carta.sirvePara}
</p>

</div>

</div>

</div>

<div
  style={{
    position:"relative",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    margin:"28px 0"
  }}
>
  <div
    style={{
      width:"100%",
      height:"2px",
      background:`linear-gradient(
        90deg,
        transparent 0%,
        ${colorGuardian} 20%,
        ${colorGuardian} 80%,
        transparent 100%
      )`,
      boxShadow:`0 0 8px ${colorGuardian}66`
    }}
  />

  <div
    style={{
      position:"absolute",
      width:"16px",
      height:"16px",
      borderRadius:"50%",
      background:colorGuardian,
      boxShadow:`
        0 0 0 2px rgba(0,0,0,0.18),
        0 0 12px ${colorGuardian}88,
        inset 0 2px 3px rgba(255,255,255,0.45)
      `
    }}
  />
</div>

<div style={{textAlign:"center", marginTop:"25px"}}>


{mensajeAngel && (

<>
<div style={{

maxWidth:"794px",
margin:"0px auto",
padding:"18px 30px",

background:"rgba(255,255,255,0.10)",

borderRadius:"8px",

fontFamily:"Cinzel Decorative, serif",
fontSize:"20px",

textAlign:"center",
lineHeight:"1.5",

color:"#3a2a18",

boxShadow:"0 6px 18px rgba(0,0,0,0.15)",
border:"1px solid rgba(120,90,40,0.35)",

display:"flex",
flexDirection:"column",
justifyContent:"center"

}}>

<div style={{
fontSize:"24px",
padding:"8px",
fontFamily:"Cinzel Decorative, serif",
textAlign:"center",
letterSpacing:"3px",
wordSpacing:"10px",
marginBottom:"0 auto",
color:"#2a1a0f",
textShadow:`
    0 1px 0 rgba(255,255,255,0.25),
    0 2px 4px rgba(0,0,0,0.35)
    `,    
}}>
PROPOSITO DEL ÁNGEL DE LA GUARDA
</div>

<div style={{
fontFamily:"serif",
fontSize:"30px",
fontWeight:"700",
lineHeight:"1.5",
letterSpacing:"3px",
color:"#2a1a0f",

}}>
“{mensajeAngel}”
</div>

</div>

</>

)}  

</div>

</div>

<div style={{
marginTop:"-135px",
paddingTop:"10px",
maxWidth:"794px",
marginLeft:"auto",
marginRight:"auto",
width:"70%",
borderTop:`1px solid rgba(120,90,400,0.35)`,
borderRadius:"8px",
textAlign:"center",
fontSize:"15px",
letterSpacing:"1px",
opacity:"0.9"
}}>

<div
className="firmaAngelologo"
style={{
textAlign:"center",
marginTop:"1px",
font:"fontTitulo",
paddingTop:"10px",
paddingBottom:"12px",
borderTop:"1px solid rgba(120,90,40,0.35)",
background:"rgba(255,248,230,0.10)",
borderRadius:"8px",
width:"70%",
marginLeft:"auto",
marginRight:"auto"
}}
>

<div style={{ marginTop:"30px", textAlign:"center" }}>

{(
  nombreAngeologo?.trim() &&
  nombreAngeologo !== "Nombre del Angeólogo" &&
  tituloAngeologo?.trim() &&
  tituloAngeologo !== "Título del Angeólogo"
) ? (

  <>
    <div style={{
      fontWeight:"600",
      marginBottom:"4px",
      letterSpacing:"1px"
    }}>
      Angeólogo
    </div>

    <div style={{
      fontSize:"16px",
      letterSpacing:"0.5px",
      font:"fontTitulo",
    }}>
      {nombreAngeologo}
    </div>

    <div style={{
      fontSize:"13px",
      opacity:"0.8",
      marginTop:"2px"
    }}>
      {tituloAngeologo}
    </div>
  </>

) : (

  <img
    src={florVida}
    alt="Flor de la Vida"
    style={{
      width:"90px",
      opacity:"0.85",
      margin:"10px auto",
      display:"block",
      filter:"sepia(1) brightness(0.35) contrast(1.4)"
    }}
  />

)}

</div>

</div>

</div>

</div>


<div style={{
textAlign:"center",
marginTop:"25px",
width:"794px",
marginLeft:"auto",
marginRight:"auto"
}}>

<button
  onClick={() => generarPDFNuevo(carta)}
  style={{
    padding: "12px 26px",
    fontSize: "16px",
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px"
  }}
>
  Generar PDF
</button>

</div>

</div>

);


}

export default CartaAngel;