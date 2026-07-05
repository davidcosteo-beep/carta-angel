import florVida from "../assets/flor-vida.png";
import { tablaMentor } from "../core/tablaMentor";
import { tablaCartas } from "../core/tablaCartas";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from "@pdf-lib/fontkit";
import { useIsMobile } from "../hooks/useIsMobile";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useEffect, useState, useRef } from "react";
import {
  PDF_ASSET_BASE,
  PDF_FONT_URLS,
  crearCandidatosAsset,
  loadPdfResource,
  normalizarNombreAsset
} from "../utils/pdfResources";

function CartaAngel({ carta }) {

const isMobile = useIsMobile();  
const isOnline = useOnlineStatus();
const [pdfData, setPdfData] = useState(null);
const [pdfUrl, setPdfUrl] = useState("");
const [visorPdfAbierto, setVisorPdfAbierto] = useState(false);
const pdfCacheRef = useRef(null);
const ultimoURLRef = useRef(null);
const [generando, setGenerando] = useState(false);  

useEffect(() => {

  if (!isMobile || !carta) return;

  const generar = async () => {

  try {

    setGenerando(true);

    setPdfData(null);

    setPdfUrl("");

    setVisorPdfAbierto(false);

    const inicio = Date.now();

    console.info("Generando PDF local con assets publicos PWA");

    const resultado = {
      ...(await generarPDFNuevo()),
      ok: true,
      local: true
    };

    const tiempo =
      Date.now() - inicio;

    const minimo = 3800;

    if (tiempo < minimo) {

      await new Promise(resolve =>
        setTimeout(
          resolve,
          minimo - tiempo
        )
      );

    }

    const urlPublica = resultado.url;

    setPdfData({
      ...resultado,
      url: urlPublica
    });

    setPdfUrl(urlPublica);

    if (urlPublica) {

      const preloadLink =
      document.createElement("link");

      preloadLink.rel = "preload";

      preloadLink.as = "document";

      preloadLink.href = urlPublica;

      document.head.appendChild(preloadLink);

    }

  } catch (error) {

    console.error(error);

  } finally {

    setGenerando(false);

  }

};

  generar();

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isMobile, isOnline, carta]);

async function generarPDFNuevo() {

if (pdfCacheRef.current) {

  return pdfCacheRef.current;

}  

const inicioX = 67;
const inicioY = 760;
const anchoUtil = 464;

const imagenPrincipalX = inicioX + 5;
const col1X = inicioX + 130;
const col2X = inicioX + 300;
const labelOffset = 80;
const lineHeight = 14;  


function wrapText(text, maxWidth, font, size) {

  if (text === null || text === undefined) return [];

  text = String(text);

  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  words.forEach(word => {

    const testLine = currentLine + word + " ";
    const width = font.widthOfTextAtSize(testLine, size);

    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    }

  });

  if (currentLine) lines.push(currentLine.trim());

  return lines;
}
  
const pdfDoc = await PDFDocument.create();

pdfDoc.registerFontkit(fontkit);

const page = pdfDoc.addPage([600, 910]);

const fetchArrayBuffer = async (url) => {
  return loadPdfResource(url);
};

const embedPdfImage = async (url, type = "png", options = {}) => {
  try {
    const bytes = await fetchArrayBuffer(url);

    return type === "jpg"
      ? await pdfDoc.embedJpg(bytes)
      : await pdfDoc.embedPng(bytes);
  } catch (error) {
    if (!options.silent) {
      console.warn(
        `No se pudo cargar imagen PDF local: ${url}`,
        error
      );
    }
    return null;
  }
};

const embedPdfImageDesdeAssets = async ({
  basePath,
  nombre,
  tipo,
  extensiones = ["png"]
}) => {
  const rutas = crearCandidatosAsset(basePath, nombre, extensiones);

  for (const ruta of rutas) {
    const extension = ruta.toLowerCase().endsWith(".jpg") ||
      ruta.toLowerCase().endsWith(".jpeg")
      ? "jpg"
      : "png";
    const imagen = await embedPdfImage(ruta, extension, { silent: true });

    if (imagen) return imagen;
  }

  rutas.forEach((ruta) => {
    console.warn(`No se encontro imagen PDF local (${tipo}): ${ruta}`);
  });

  return null;
};

const embedPdfFont = async (url, fallbackFont) => {
  try {
    const bytes = await fetchArrayBuffer(url);

    return await pdfDoc.embedFont(bytes);
  } catch (error) {
    console.warn(error?.message || `No se pudo cargar ${url}`);
    return pdfDoc.embedFont(fallbackFont);
  }
};

const fondoImage = await embedPdfImage(`${PDF_ASSET_BASE}/fondo.jpg`, "jpg");

if (fondoImage) {

  page.drawImage(fondoImage, {
  x: 0,
  y: 0,
  width: page.getWidth(),
  height: page.getHeight(),
  opacity: 0.90,
  });

} else {

  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
    color: rgb(0.93, 0.86, 0.72),
  });

}

 
const [
  fontTitulo,
  fontTituloDecorativo,
  font,
  fontBold,
  cardoItalicFont
] = await Promise.all([
  embedPdfFont(PDF_FONT_URLS[0], StandardFonts.TimesRomanBold),
  embedPdfFont(PDF_FONT_URLS[1], StandardFonts.TimesRomanBold),
  embedPdfFont(PDF_FONT_URLS[2], StandardFonts.TimesRoman),
  embedPdfFont(PDF_FONT_URLS[3], StandardFonts.TimesRomanBold),
  embedPdfFont(PDF_FONT_URLS[4], StandardFonts.TimesRomanBoldItalic)
]);


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
  ? ` | Hora: ${carta.hora}`
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

// 🔹 Color real de la barra
const colorBarraGuarda = {
  red: rBase,
  green: gBase,
  blue: bBase
};

// 🔹 Detectar luminosidad
const luminosidadGuarda =
  (colorBarraGuarda.red * 0.299) +
  (colorBarraGuarda.green * 0.587) +
  (colorBarraGuarda.blue * 0.114);

const fondoClaroGuarda =
  luminosidadGuarda > 0.68;

// 🔹 Color inteligente
const colorTextoGuarda = fondoClaroGuarda
  ? rgb(0.18, 0.18, 0.18)
  : rgb(1, 1, 1);

// 🔹 Dibujar título
page.drawText(text, {
  x: inicioX + (anchoUtil - textWidth) / 2,
  y: inicioY - 1,
  size: 15,
  font: fontTituloDecorativo,
  characterSpacing: letterSpacingTitulo,
  color: colorTextoGuarda,
});

const angelImg = await embedPdfImageDesdeAssets({
  basePath: `${PDF_ASSET_BASE}/angeles`,
  nombre: carta.angel,
  tipo: "ángel"
});

if (angelImg) {

  page.drawImage(angelImg, {
  x: imagenPrincipalX - 24,
  y: inicioY - 232,
  width: 163,
  height: 242,
  opacity: 0.08,
  });

  page.drawImage(angelImg, {
  x: imagenPrincipalX - 10,
  y: inicioY - 215,
  width: 135,
  height: 205,
  opacity: 0.20,
  });

  page.drawImage(angelImg, {
  x: imagenPrincipalX,
  y: inicioY - 205,
  width: 115,
  height: 188,
  });

} else {

  page.drawEllipse({
    x: imagenPrincipalX + 58,
    y: inicioY - 112,
    xScale: 48,
    yScale: 72,
    color: rgb(0.72, 0.56, 0.34),
    opacity: 0.18,
  });

  page.drawText((carta.angel || "?").charAt(0).toUpperCase(), {
    x: imagenPrincipalX + 42,
    y: inicioY - 126,
    size: 44,
    font: fontTituloDecorativo,
    color: rgb(0.42, 0.25, 0.12),
    opacity: 0.72,
  });

}

let y = 685;

const drawLine2Cols = (label1, value1, label2, value2) => {

  const lines1 = value1
    ? wrapText(value1, 95, font, 12)
    : [];

  const lines2 = value2
    ? wrapText(value2, 95, font, 12)
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
  size: 12,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

  page.drawText(label1 + ":", {
  x: col1X - 0.2,
  y: y + 0.2,
  size: 12,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText(label1 + ":", {
  x: col1X,
  y,
  size: 12,
  font: fontBold,
  color: colorTextoPrincipal,
});

}

    if (lines1[i]) {
  page.drawText(lines1[i], {
  x: col1X + labelOffset + 0.4,
  y: y - 0.3,
  size: 12,
  font,
  color: colorSombra,
  opacity: 0.15,
});

page.drawText(lines1[i], {
  x: col1X + labelOffset,
  y,
  size: 12,
  font,
  color: colorTextoPrincipal,
});

    }

    // COLUMNA 2
    if (i === 0 && label2) {
  page.drawText(label2 + ":", {
    x: col2X + 0.5,
    y: y - 0.4,
    size: 12,
    font: fontBold,
    color: colorSombra,
    opacity: 0.28,
  });

  page.drawText(label2 + ":", {
    x: col2X - 0.2,
    y: y + 0.2,
    size: 12,
    font: fontBold,
    color: colorLuz,
    opacity: 0.15,
  });

  page.drawText(label2 + ":", {
    x: col2X,
    y,
    size: 12,
    font: fontBold,
    color: colorTextoPrincipal,
  });
}

if (lines2[i]) {
  page.drawText(lines2[i], {
    x: col2X + 58 + 0.4,
    y: y - 0.3,
    size: 12,
    font,
    color: colorSombra,
    opacity: 0.15,
  });

  page.drawText(lines2[i], {
    x: col2X + 58,
    y,
    size: 12,
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
drawLine2Cols("Talismán", carta.talisman, "Coro", carta.coroAngelical);

y -= 1;

page.drawText("Aroma:", {
  x: col1X,
  y,
  size: 12,
  font: fontBold,
});

page.drawText(String(carta.aroma || ""), {
  x: col1X + 50,
  y,
  size: 12,
  font,
});

y -=16;

page.drawText("Atributo:", {
  x: col1X,
  y,
  size: 12,
  font: fontBold,
});

page.drawText(String(carta.atributo || ""), {
  x: col1X +55,
  y,
  size: 12,
  font,
});

y -= 16;


page.drawText("Ofrenda:", {
  x: col1X,
  y,
  size: 12,
  font: fontBold,
});

page.drawText(String(carta.ofrenda || ""), {
  x: col1X + 58,
  y,
  size: 12,
  font,
});

y -= 15;

// TÍTULO

page.drawText("Se canaliza para:", {
  x: col1X,
  y,
  size: 12,
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
  12,
  14
);

y -= 6;

page.drawText("Don del ser de luz:", {
  x: col1X,
  y,
  size: 12,
  font: fontBold,
});

y = drawJustifiedText(
  carta.donSerDeLuz,
  col1X + 105,
  y,
  320,
  font,
  12,
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

// BUSCAR MENTOR
const normalizar = (t) =>
  normalizarNombreAsset(t).replace(/-/g, "");

const mentorData = Object.values(tablaMentor).find(
  m => normalizar(m.mentor) === normalizar(carta.mentor)
);

//  FUNCIÓN AQUÍ ADENTRO 
  async function dibujarMentor({
    page,
    font,
    rgb,
    mentorData,
    yStart,
  }) {

    if (!mentorData) return yStart;

    let y = yStart;

  const col1X = 70;
  const col2X = 300;
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
const fondoClaroMentor = luminosidadMentor > 0.68;

// 🔹 Colores inteligentes
const colorTextoMentor = fondoClaroMentor
  ? rgb(0.18, 0.18, 0.18)
  : rgb(1, 1, 1);

const colorSombraMentor = fondoClaroMentor
  ? rgb(0, 0, 0)
  : rgb(0.20, 0.08, 0.03);

const opacitySombraMentor = fondoClaroMentor
  ? 0.18
  : 0.28;

const colorBrilloMentor = fondoClaroMentor
  ? rgb(1, 1, 1)
  : rgb(1, 0.95, 0.88);

const opacityBrilloMentor = fondoClaroMentor
  ? 0.05
  : 0.15;

// 🔹 Calcular ancho real del título
let tituloWidth = 0;

for (const char of titulo) {

  tituloWidth +=
    fontTituloDecorativo.widthOfTextAtSize(
      char,
      fontSizeTitulo
    ) + letterSpacingTitulo;

}

tituloWidth -= letterSpacingTitulo;

const tituloX = (600 - tituloWidth) / 2;

// 🔹 Sombra
page.drawText(titulo, {
  x: tituloX + 1,
  y: barraMentorY + 5.5,
  size: fontSizeTitulo,
  font: fontTituloDecorativo,
  characterSpacing: letterSpacingTitulo,
  color: colorSombraMentor,
  opacity: opacitySombraMentor,
});

// 🔹 Brillo
page.drawText(titulo, {
  x: tituloX - 0.3,
  y: barraMentorY + 7.2,
  size: fontSizeTitulo,
  font: fontTituloDecorativo,
  characterSpacing: letterSpacingTitulo,
  color: colorBrilloMentor,
  opacity: opacityBrilloMentor,
});

// 🔹 Texto principal
page.drawText(titulo, {
  x: tituloX,
  y: barraMentorY + 6.8,
  size: fontSizeTitulo,
  font: fontTituloDecorativo,
  characterSpacing: letterSpacingTitulo,
  color: colorTextoMentor,
});

y -= 20;
    const drawLine = (l1, v1, l2, v2) => {

      if (v1) {
        page.drawText(`${l1}:`, {
  x: col1X + 0.5,
  y: y - 0.4,
  size: 12,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

page.drawText(`${l1}:`, {
  x: col1X - 0.2,
  y: y + 0.2,
  size: 12,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText(`${l1}:`, {
  x: col1X,
  y,
  size: 12,
  font: fontBold,
  color: colorTextoPrincipal,
});

page.drawText(String(v1), {
  x: col1X + 70 + 0.4,
  y: y - 0.3,
  size: 12,
  font,
  color: colorSombra,
  opacity: 0.15,
});

page.drawText(String(v1), {
  x: col1X + 70,
  y,
  size: 12,
  font,
  color: colorTextoPrincipal,
});
      }

      if (v2) {
        page.drawText(`${l2}:`, {
  x: col2X + 0.5,
  y: y - 0.4,
  size: 12,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

page.drawText(`${l2}:`, {
  x: col2X - 0.2,
  y: y + 0.2,
  size: 12,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText(`${l2}:`, {
  x: col2X,
  y,
  size: 12,
  font: fontBold,
  color: colorTextoPrincipal,
});

page.drawText(String(v2), {
  x: col2X + 66 + 0.4,
  y: y - 0.3,
  size: 12,
  font,
  color: colorSombra,
  opacity: 0.15,
});

page.drawText(String(v2), {
  x: col2X + 66,
  y,
  size: 12,
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
    drawLine("Don", mentorData.don, );
    y -=3;
    drawLine("Gemas", mentorData.gemas);

    const yTextoMentor = y - 6;

page.drawText("Se Canaliza para:", {
  x: col1X + 0.5,
  y: yTextoMentor - 0.4,
  size: 12,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

page.drawText("Se Canaliza para:", {
  x: col1X - 0.2,
  y: yTextoMentor + 0.2,
  size: 12,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText("Se Canaliza para:", {
  x: col1X,
  y: yTextoMentor,
  size: 12,
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
  12
);

lineasCanaliza.forEach((linea, index) => {
  page.drawText(linea, {
    x: col1X + 108 + 0.4,
    y: yCanaliza - (index * 14) - 0.3,
    size: 12,
    font,
    color: colorSombra,
    opacity: 0.15,
  });

  page.drawText(linea, {
    x: col1X + 108,
    y: yCanaliza - (index * 14),
    size: 12,
    font,
    color: colorTextoPrincipal,
  });
});

yDetalle = yTextoMentor - ((lineasCanaliza.length - 1) * 14) - 22;

page.drawText("Gracia:", {
  x: col1X + 0.5,
  y: yDetalle - 0.4,
  size: 12,
  font: fontBold,
  color: colorSombra,
  opacity: 0.28,
});

page.drawText("Gracia:", {
  x: col1X - 0.2,
  y: yDetalle + 0.2,
  size: 12,
  font: fontBold,
  color: colorLuz,
  opacity: 0.15,
});

page.drawText("Gracia:", {
  x: col1X,
  y: yDetalle,
  size: 12,
  font: fontBold,
  color: colorTextoPrincipal,
});

page.drawText(String(mentorData.gracia), {
  x: col1X + 42 + 0.4,
  y: yDetalle - 0.3,
  size: 12,
  font,
  color: colorSombra,
  opacity: 0.15,
});

page.drawText(String(mentorData.gracia), {
  x: col1X + 42,
  y: yDetalle,
  size: 12,
  font,
  color: colorTextoPrincipal,
});

yDetalle -= 20;

y = yDetalle - 6;

    // IMAGEN
    const mentorImg = await embedPdfImageDesdeAssets({
      basePath: `${PDF_ASSET_BASE}/mentores`,
      nombre: mentorData.mentor,
      tipo: "mentor"
    });

    if (mentorImg) {

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

}

    return y;
}

//  LLAMAR FUNCIÓN
y = await dibujarMentor({
  page,
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


const lineHeight = 18;

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
const colorBarraInfluencias = {
  red: rGuia,
  green: gGuia,
  blue: bGuia
};

// 🔹 Color de fondo de la barra
const barraColor = colorBarraInfluencias;

// 🔹 Detectar luminosidad del fondo
const luminosidad =
  (barraColor.red * 0.299) +
  (barraColor.green * 0.587) +
  (barraColor.blue * 0.114);

// 🔹 Fondo claro u oscuro
const fondoClaro = luminosidad > 0.68;

// 🔹 Colores inteligentes
const colorTexto = fondoClaro
  ? rgb(0.18, 0.18, 0.18)
  : rgb(1, 1, 1);

const colorSombra = fondoClaro
  ? rgb(0, 0, 0)
  : rgb(0.15, 0.15, 0.15);

const opacitySombra = fondoClaro ? 0.18 : 0.45;

const colorBrillo = fondoClaro
  ? rgb(1, 1, 1)
  : rgb(1, 0.96, 0.90);

const opacityBrillo = fondoClaro ? 0.05 : 0.20;

// 🔹 Sombra
page.drawText(titulo, {
  x: ((600 - w) / 2) + 1,
  y: barraGuiaY + 6,
  size: 15,
  font: fontTituloDecorativo,
  color: colorSombra,
  opacity: opacitySombra,
});

// 🔹 Brillo
page.drawText(titulo, {
  x: ((600 - w) / 2) - 0.3,
  y: barraGuiaY + 7.6,
  size: 15,
  font: fontTituloDecorativo,
  color: colorBrillo,
  opacity: opacityBrillo,
});

// 🔹 Texto principal
page.drawText(titulo, {
  x: (600 - w) / 2,
  y: barraGuiaY + 7,
  size: 15,
  font: fontTituloDecorativo,
  color: colorTexto,
  opacity: 1,
});

y -= 20;

 const drawLine3Cols = (
  label1, value1,
  label2, value2,
  label3, value3
) => {

  const col1X = 40;
  const col2X = 220;
  const col3X = 420;

  const fontSize = 12;

  // 🔹 Dibujar labels
  page.drawText(`${label1}:`, {
    x: col1X + 30,
    y,
    size: fontSize,
    font: fontBold,
  });

  page.drawText(`${label2}:`, {
    x: col2X - 20,
    y,
    size: fontSize,
    font: fontBold,
  });

  page.drawText(`${label3}:`, {
    x: col3X - 90,
    y,
    size: fontSize,
    font: fontBold,
  });

  // 🔹 Textos con salto automático
  const lines1 = wrapText(String(value1 || ""), 80, font, fontSize);
  const lines2 = wrapText(String(value2 || ""), 55, font, fontSize);
  const lines3 = wrapText(String(value3 || ""), 130, font, fontSize);

  // 🔹 Columna 1
  lines1.forEach((line, index) => {

    page.drawText(line, {
      x: col1X + 110,
      y: y - (index * lineHeight),
      size: fontSize,
      font,
    });

  });

  // 🔹 Columna 2
  lines2.forEach((line, index) => {

    page.drawText(line, {
      x: col2X + 45,
      y: y - (index * lineHeight),
      size: fontSize,
      font,
    });

  });

  // 🔹 Columna 3
  lines3.forEach((line, index) => {

    page.drawText(line, {
      x: col3X - 20,
      y: y - (index * lineHeight),
      size: fontSize,
      font,
    });

  });

  // 🔹 Detectar cuántas líneas ocupó la fila
  const maxLines = Math.max(
    lines1.length,
    lines2.length,
    lines3.length
  );

  // 🔹 Bajar dinámicamente
  y -= (maxLines * lineHeight) + 4;
};

// 🔹 FILA 1
drawLine3Cols(
  "Ángel Guía",
  carta.angelGuia,
  "Color",
  mentorData.colorNombreGuia,
  "Significado",
  carta.significado
);

// 🔹 FILA 2
drawLine3Cols(
  "Ángel Día",
  carta.angelDia,
  "Color",
  mentorData.colorNombreDia,
  "Ángel Mes",
  carta.angelMes
);

// 🔹 FILA 3
drawLine3Cols(
  "Ángel Signo",
  carta.angelSigno,
  "Ángel Año",
  carta.angelAnio,
  "Ángel Hora",
  carta.angelHora
);

const separadorInfY = y;

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

y -= 3;

return y - 10;

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
  font,
  rgb,
  carta,
  yStart,
}) {

  let y = yStart;

  const imgX = 65;  

  const lineHeight = 18;

  // BARRA
  const colorEsencia = carta.color || "#3B82F6";

const hexEsencia = colorEsencia.replace("#", "");

const rEsencia = parseInt(hexEsencia.substring(0, 2), 16) / 255;
const gEsencia = parseInt(hexEsencia.substring(2, 4), 16) / 255;
const bEsencia = parseInt(hexEsencia.substring(4, 6), 16) / 255;

const barraEsenciaY = y;

// degradado horizontal dinámico
const luminosidadEsencia =
  (rEsencia * 0.299) +
  (gEsencia * 0.587) +
  (bEsencia * 0.114);

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
const tituloEsenciaWidth =
  fontBold.widthOfTextAtSize(tituloEsencia, 15);

// 🔹 Detectar fondo claro
const fondoClaroEsencia =
  luminosidadEsencia > 0.68;

// 🔹 Colores inteligentes
const colorTextoEsencia = fondoClaroEsencia
  ? rgb(0.18, 0.18, 0.18)
  : rgb(1, 1, 1);

const colorSombraEsencia = fondoClaroEsencia
  ? rgb(0, 0, 0)
  : rgb(0.12, 0.08, 0.02);

const opacitySombraEsencia =
  fondoClaroEsencia ? 0.18 : 0.35;

const colorBrilloEsencia = fondoClaroEsencia
  ? rgb(1, 1, 1)
  : rgb(1, 0.95, 0.88);

const opacityBrilloEsencia =
  fondoClaroEsencia ? 0.05 : 0.18;

// 🔹 Sombra
page.drawText(tituloEsencia, {
  x: ((600 - tituloEsenciaWidth) / 2) + 0.5,
  y: barraEsenciaY + 6.4,
  size: 15,
  font: fontTituloDecorativo,
  color: colorSombraEsencia,
  opacity: opacitySombraEsencia,
});

// 🔹 Brillo
page.drawText(tituloEsencia, {
  x: ((600 - tituloEsenciaWidth) / 2) - 0.2,
  y: barraEsenciaY + 7.4,
  size: 15,
  font: fontTituloDecorativo,
  color: colorBrilloEsencia,
  opacity: opacityBrilloEsencia,
});

// 🔹 Texto principal
page.drawText(tituloEsencia, {
  x: (600 - tituloEsenciaWidth) / 2,
  y: barraEsenciaY + 7,
  size: 15,
  font: fontTituloDecorativo,
  color: colorTextoEsencia,
});

y -= 20;

  //  IMAGEN SIGNO
  const signoImg = await embedPdfImageDesdeAssets({
    basePath: `${PDF_ASSET_BASE}/signos`,
    nombre: carta.signo,
    tipo: "signo",
    extensiones: ["png", "jpg", "jpeg"]
  });

  if (signoImg) {
    

   page.drawCircle({
    x: imgX + 27,
    y: y - 68,
    size: 36,
    color: rgb(1, 0.72, 0.08),
    opacity: 0.10,
    });

    page.drawCircle({
    x: imgX + 27,
    y: y - 68,
    size: 29,
    color: rgb(1, 0.85, 0.25),
    opacity: 0.14,
    });

    page.drawCircle({
    x: imgX + 27,
    y: y - 68,
    size: 22,
    color: rgb(1, 0.95, 0.5),
    opacity: 0.08,
    });

    page.drawImage(signoImg, {
      x: imgX ,
      y: y - 68,
      width: 82,
      height: 82,
      opacity:0.85,
    });
  }

  // TEXTO EN COLUMNAS
  const esenciacol1X = 150;
  const esenciacol2X = 330;

  const drawLine = (l1, v1, l2, v2) => {

  if (v1) {
    page.drawText(`${l1}:`, {
      x: esenciacol1X,
      y,
      size: 12,
      font: fontBold,
    });

    page.drawText(String(v1), {
      x: esenciacol1X + 85,
      y,
      size: 12,
      font,
    });
  }

  if (v2) {
    page.drawText(`${l2}:`, {
      x: esenciacol2X,
      y,
      size: 12,
      font: fontBold,
    });

    page.drawText(String(v2), {
      x: esenciacol2X + 95,
      y,
      size: 12,
      font,
    });
  }

  y -= lineHeight;
};

  drawLine("Esencia signo", carta.esenciaSigno, "Esencia mes", carta.esenciaMes);
  drawLine("Esencia día", carta.esenciaDia, "Esencia mentor", carta.esenciaMentor);
  drawLine("Ángel guarda", carta.esenciaAngelGuarda, "", "");

  y -= 2;

  const colorTextoPrincipal = rgb(0.18, 0.09, 0.03);

  page.drawText("Sirve para:", {
  x: esenciacol1X,
  y,
  size: 12,
  font: fontBold,
  color: colorTextoPrincipal,
});

page.drawText(String(carta.sirvePara || ""), {
  x: esenciacol1X + 83,
  y,
  size: 12,
  font,
  color: colorTextoPrincipal,
});

return y;
}

y = await dibujarSigno({
  page,
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
const tituloWidth = fontBold.widthOfTextAtSize(tituloProposito, 13);

page.drawText(tituloProposito, {
  x: propositoBoxX + (propositoBoxWidth - tituloWidth) / 2,
  y: propositoBoxY + 45,
  size: 13,
  font: fontTituloDecorativo,
  color: rgb(0.32, 0.24, 0.18),
});

// Frase
const fraseTexto = `“${mensajeAngel}”`;
const fraseSize = 13;
const fraseMaxWidth = propositoBoxWidth - 70;

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
    color: rgb(0.25, 0.18, 0.12),
    opacity: 0.35,
  });

  // brillo superior suave
  page.drawText(linea, {
    x: lineaX - 0.2,
    y: lineaY + 0.2,
    size: fraseSize,
    font: fontBold,
    color: rgb(0.95, 0.90, 0.80),
    opacity: 0.10,
  });

  // texto principal
  page.drawText(linea, {
    x: lineaX,
    y: lineaY,
    size: fraseSize,
    font: fontBold,
    color: rgb(0.30, 0.22, 0.16),
  });

  lineaY -= 14;
});

// Actualizar y
y = propositoBoxY -28;


if (
  nombreAngeologo &&
  nombreAngeologo !== "Nombre del Angeólogo" &&
  tituloAngeologo &&
  tituloAngeologo !== "Título del Angeólogo"
) {

const nombreSize = 12;

page.drawText(nombreAngeologo, {
  x: 120,
  y,
  size: nombreSize,
  font: cardoItalicFont,
  color: rgb(0.28, 0.18, 0.10),
});

  y -= 11;

const tituloX = 120;

page.drawText(tituloAngeologo, {
  x: tituloX,
  y,
  size: 10,
  font: fontTitulo,
});

} else {

  const florPath = `${PDF_ASSET_BASE}/flor-vida.png`;
  const florImg = await embedPdfImage(florPath, "png", { silent: true });

  if (florImg) {

    page.drawImage(florImg, {
  x: inicioX + (anchoUtil / 2) - 32,
  y: y - 15,
  width: 64,
  height: 44,
  });
  } else {
    console.warn(`No se encontró firma/flor de vida: ${florPath}`);
  }
}


const nombreArchivo = `
Pergamino_${carta.angel}_${nombreTexto || "PACIENTE"}
`
.replace(/[\\/:*?"<>|]/g, "_")
.replace(/\s+/g, "_");

const pdfBytes = await pdfDoc.save();

const blob = new Blob([pdfBytes], {
  type: "application/pdf"
});

const url = URL.createObjectURL(blob);

if (ultimoURLRef.current) {

  URL.revokeObjectURL(
    ultimoURLRef.current
  );

}

ultimoURLRef.current = url;

const resultado = {

  blob,
  url,
  nombreArchivo

};

pdfCacheRef.current =
  resultado;

return resultado;
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

const botonStyle = {
  padding: "14px 24px",
  borderRadius: "14px",
  border: "none",
  background: "#8B5CF6",
  color: "white",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition:"transform 0.18s ease, box-shadow 0.25s ease",
  touchAction: "manipulation",
  boxShadow: "0 8px 20px rgba(139,92,246,0.35)"
};

const enlacePDFStyle = {
  ...botonStyle,
  display: "block",
  textAlign: "center",
  textDecoration: "none",
  boxSizing: "border-box"
};


if (isMobile) {

    if (visorPdfAbierto && pdfUrl) {

  return (

    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#070B16",
        color: "white",
        display: "flex",
        flexDirection: "column"
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "14px 14px 12px 14px",
          background: "linear-gradient(180deg, #111827 0%, #070B16 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          boxSizing: "border-box"
        }}
      >

        <button
          type="button"
          onClick={() => setVisorPdfAbierto(false)}
          style={{
            ...botonStyle,
            width: "auto",
            minWidth: "190px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "#7b5532",
            boxShadow: "0 6px 18px rgba(0,0,0,0.26)"
          }}
        >
          ← Volver a Kabala Pro
        </button>

        <div
          style={{
            minWidth: 0,
            textAlign: "right"
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              lineHeight: "1.2"
            }}
          >
            Carta Angelical
          </div>
          <div
            style={{
              fontSize: "12px",
              opacity: 0.72,
              marginTop: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "130px"
            }}
          >
            {carta.nombre}
          </div>
        </div>

      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          background: "#111827"
        }}
      >
        <iframe
          title="Carta Angelical PDF"
          src={pdfUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "0",
            display: "block",
            background: "#FFFFFF"
          }}
        />
      </div>

      <div
        style={{
          padding: "10px 14px 14px 14px",
          background: "#070B16",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#f6d28b",
            fontSize: "13px",
            textDecoration: "underline"
          }}
        >
          Abrir en navegador
        </a>
      </div>

    </div>

  );

}

    if (generando) {

  return (

    <div
      style={{

        width: "100vw",
        minHeight: "100vh",

        display: "flex",

        alignItems: "center",
        justifyContent: "center",

        flexDirection: "column",

        background: `
          radial-gradient(
            circle at top,
            rgba(139,92,246,0.18),
            transparent 35%
          ),
          linear-gradient(
            180deg,
            #070B16 0%,
            #0B1020 45%,
            #111827 100%
          )
        `,

        color: "white",

        padding: "24px"

      }}
    >

      <div className="orbe-ceremonial" />

      <div
        style={{
          marginTop: "28px",
          textAlign: "center"
        }}
      >

        <div
          style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "10px"
          }}
        >
          Canalizando pergamino angelical
        </div>

        <div
          style={{
            opacity: 0.7,
            fontSize: "14px"
          }}
        >
          Consultando Kabala Angelical...
        </div>

      </div>

    </div>

  );

}

  return (

    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: `
          radial-gradient(
            circle at top,
            rgba(139,92,246,0.18),
            transparent 35%
          ),
          linear-gradient(
            180deg,
            #070B16 0%,
            #0B1020 45%,
            #111827 100%
          )
        `,
        transition:
        "opacity 0.45s ease, filter 0.45s ease",

        opacity: 1,

        color: "white",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "24px",

        position: "relative",
        overflow: "hidden"
      }}
    >

      {/* CARD CEREMONIAL */}

      <div
        style={{
          width: "100%",
          maxWidth: "370px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          padding: "38px 30px",
          backdropFilter: "blur(18px)",
          boxShadow: `
            0 10px 40px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.06)
          `,
          textAlign: "center"
        }}
      >

        {/* TITULO */}

        <h2
          style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "10px",
            letterSpacing: "0.5px"
          }}
        >
          {carta.angel}
        </h2>

        {/* SUBTEXTO */}

        <p
          style={{
            opacity: 0.72,
            lineHeight: "1.5",
            fontSize: "15px",
            marginBottom: "28px"
          }}
        >
          Carta Angelical Generada 
        </p>

        {/* LOADING */}

        {generando && (

  <div
    style={{

      display: "flex",
      flexDirection: "column",

      alignItems: "center",
      justifyContent: "center",

      gap: "26px",

      marginTop: "10px"

    }}
  >

    {/* ORBE */}

    <div
      className="orbe-ceremonial"
    />

    {/* TEXOS */}

    <div
      style={{
        textAlign: "center"
      }}
    >

      <div
        style={{
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "10px",
          letterSpacing: "0.5px"
        }}
      >
        Canalizando pergamino angelical
      </div>

      <div
        style={{
          opacity: 0.68,
          fontSize: "14px",
          lineHeight: "1.6"
        }}
      >
        {isOnline
          ? "Consultando Kabala Angelical..."
          : "Generando PDF local sin conexion..."}
      </div>

    </div>

  </div>

)}

        {/* BOTONES */}

        {!generando && pdfData && pdfUrl && (

          <div
            style={{
              width: "100%",
              maxWidth: "290px",
              margin: "25px auto 0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >

            <button
              type="button"
              onClick={() => setVisorPdfAbierto(true)}
              style={enlacePDFStyle}
            >
              Ver carta
            </button>

            

          </div>

        )}

      </div>

    </div>

  );

}

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
minHeight:"auto",

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
    border:"1px solid rgba(190,160,110,0.22)",
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
  ? ` | Hora: ${carta.hora}`
  : "";

    return `Nacimiento: ${carta.fecha} | Día: ${carta.diaNacimiento}${horaTexto} | Signo: ${carta.signo}`;
  })()}
</div>

</div>

{/* ANGEL DE LA GUARDA */}

<div style={{
  borderRadius:"8px",
  border:"1px solid rgba(190,160,110,0.22)",
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
position:"relative",
marginTop:"18px"
}}>

<div style={{
  position:"absolute",
  width:"620px",
  height:"760px",
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
    width: modoPDF ? "520px" : "450px",
    height: modoPDF ? "620px" : "520px",
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

maxHeight:"390px",
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
gap:"6px 28px",
fontSize:"19px",
fontFamily:"IM Fell English, serif",
lineHeight:"1.45",
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
  <span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Coro:</span> {carta.coroAngelical}
</p>

<p style={{
  margin:"1px 0",
  gridColumn:"1 / span 2",color:"#7a624d"
}}>
  <span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Aroma:</span> {carta.aroma}
</p>

<p style={{
  margin:"1px 0",
  gridColumn:"1 / span 2",color:"#7a624d"
}}>
  <span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Atributo:</span> {carta.atributo}
</p>

<p style={{
  margin:"1px 0",
  gridColumn:"1 / span 2",color:"#7a624d"
}}>
  <span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Ofrenda:</span>  {carta.ofrenda}
</p>

<p style={{
  margin:"1px 0",
  gridColumn:"1 / span 2",color:"#7a624d"
}}>
  <span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Hora Canalización:</span> {carta.horaCanalizacion}
</p>

<p style={{
gridColumn:"1 / span 2",
margin:"6px 0",
fontSize:"18px",
lineHeight:"1.5",
color:"#7a624d"
}}>
<span className="grabado" style={{color:"#3a2414",fontWeight:"700"}}>Se canaliza para:</span> {carta.seCanalizaPara}
</p>

<p style={{
gridColumn:"1 / span 2",
margin:"6px 0",
fontSize:"18px",
lineHeight:"1.5",
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
  border:"1px solid rgba(190,160,110,0.22)",
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
gap:"10px 34px",
fontSize:"18px",
fontFamily:"IM Fell English, serif",
letterSpacing:"0.5px",
lineHeight:"1.4",
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

<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Don:</b>  {carta.donMentor}</p>
<p style={{margin:"2px 0",color:"#7a624d"}}><b style={{color:"#3a2414",fontWeight:"700"}}>Gemas:</b> {carta.gemasMentor}</p>

<p style={{gridColumn:"1 / span 2", margin:"5px 0",fontSize:"17px",lineHeight:"1.45", color:"#7a624d"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Se canaliza para:</b> {carta.canalizacionMentor}
</p>

<p style={{gridColumn:"1 / span 2", margin:"5px 0",fontSize:"17px",lineHeight:"1.45",color:"#7a624d"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Gracia:</b> {carta.graciaMentor}
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

    //  SOLO aplicar máscara en APP
    WebkitMaskImage: modoPDF ? "none" : `
      radial-gradient(ellipse 75% 90% at center, black 75%, transparent 100%),
      linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)
    `,
    maskImage: modoPDF ? "none" : `
      radial-gradient(ellipse 75% 90% at center, black 75%, transparent 100%),
      linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)
    `,

    //  SOMBRA DIFERENTE PARA PDF
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
  border:"1px solid rgba(190,160,110,0.22)",
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
  display:"flex",
  flexDirection:"column",
  gap:"10px",
  fontSize:"17px",
  fontFamily:"IM Fell English, serif",
  letterSpacing:"0.4px",
  lineHeight:"1.4",
  color:"#6f5742",
  mixBlendMode:"multiply",
  textShadow:`
    0 1px 0 #f7edd6,
    0 -1px 0 #8a6f45,
    0 0 2px rgba(0,0,0,0.15)
  `
}}>

{/* Fila 1 */}
<div style={{
  display:"grid",
  gridTemplateColumns:"1fr 1fr 2fr",
  gap:"20px",
  alignItems:"start"
}}>
  <p style={{margin:"2px 0", color:"#7a624d"}}>
    <b style={{color:"#3a2414", fontWeight:"700"}}>Ángel guía:</b> {carta.angelGuia}
  </p>

  <p style={{margin:"2px 0", color:"#7a624d"}}>
    <b style={{color:"#3a2414", fontWeight:"700"}}>Color:</b> {nombreColorGuia}
  </p>

  <p style={{margin:"2px 0", fontSize:"18px", lineHeight:"1.5", color:"#7a624d"}}>
    <b style={{color:"#3a2414", fontWeight:"700"}}>Significado:</b> {carta.significado}
  </p>
</div>

{/* Fila 2 */}
<div style={{
  display:"grid",
  gridTemplateColumns:"1fr 1fr 1fr",
  gap:"20px",
  alignItems:"start"
}}>
  <p style={{margin:"2px 0", color:"#7a624d"}}>
    <b style={{color:"#3a2414", fontWeight:"700"}}>Ángel día:</b> {carta.angelDia}
  </p>

  <p style={{margin:"2px 0",marginLeft:"-70px", color:"#7a624d"}}>
    <b style={{color:"#3a2414", fontWeight:"700"}}>Color:</b> {nombreColorDia}
  </p>

  <p style={{margin:"2px 0",marginLeft:"-130px", color:"#7a624d"}}>
    <b style={{color:"#3a2414", fontWeight:"700"}}>Ángel mes:</b> {carta.angelMes}
  </p>
</div>

{/* Fila 3 */}
<div style={{
  display:"grid",
  gridTemplateColumns:"1fr 1fr 1fr",
  gap:"20px",
  alignItems:"start"
}}>
  <p style={{margin:"2px 0", color:"#7a624d"}}>
    <b style={{color:"#3a2414", fontWeight:"700"}}>Ángel signo:</b> {carta.angelSigno}
  </p>

  <p style={{margin:"2px 0", marginLeft:"-70px", color:"#7a624d"}}>
    <b style={{color:"#3a2414", fontWeight:"700"}}>Ángel año:</b> {carta.angelAnio}
  </p>

  {carta.angelHora && (
    <p style={{margin:"2px 0",marginLeft:"-130px", color:"#7a624d"}}>
      <b style={{color:"#3a2414", fontWeight:"700"}}>Ángel hora:</b> {carta.angelHora}
    </p>
  )}
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
  border:"1px solid rgba(190,160,110,0.22)",
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
gap:"12px",
padding:"10px 16px 8px 16px"
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
width:"185px",
marginTop:"-8px",

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
gap:"10px 30px",

fontSize:"18px",
fontFamily:"IM Fell English, serif",
letterSpacing:"0.4px",
lineHeight:"1.18",

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

<p style={{gridColumn:"1 / span 2", margin:"6px 0",fontSize:"19px",lineHeight:"1.55", color:"#6f5742"}}>
  <b style={{color:"#3a2414",fontWeight:"700"}}>Esencia ángel guarda:</b> {carta.esenciaAngelGuarda}
</p>

<p style={{gridColumn:"1 / span 2", margin:"6px 0",fontSize:"19px",lineHeight:"1.55", color:"#6f5742"}}>
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
    margin:"18px 0 12px 0"
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
maxWidth:"820px",
margin:"0 auto",
padding:"8px 24px",
fontFamily:"Cinzel Decorative, serif",
fontSize:"20px",
textAlign:"center",
lineHeight:"1.3",
color:"#3a2a18",
display:"flex",
flexDirection:"column",
justifyContent:"center"
}}>

<div style={{
fontSize:"21px",
padding:"4px",
marginTop:"-15px",
fontFamily:"Cinzel Decorative, serif",
textAlign:"center",
lineHeight:"1.0",
letterSpacing:"3px",
wordSpacing:"4px",
marginBottom:"12px",
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
fontSize:"20px",
marginBottom:"2px",
fontWeight:"700",
lineHeight:"1.0",
letterSpacing:"3px",
color:"#2a1a0f",
marginTop:"-5px",
}}>
“{mensajeAngel}”
</div>

</div>

</>

)}  

</div>

</div>

<div
className="firmaAngeologo"

style={{
  marginTop:"-125px",
  paddingTop:"0px",
  width:"72%",
  marginLeft:"auto",
  marginRight:"auto",
  textAlign:"left"
}}
>

{(
  nombreAngeologo?.trim() &&
  nombreAngeologo !== "Nombre del Angeólogo" &&
  tituloAngeologo?.trim() &&
  tituloAngeologo !== "Título del Angeólogo"
) ? (

<>

  <div

  style={{
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  gap:"18px",
  marginTop:"20px"
  }}
  />

  <div
  style={{
    fontSize:"15px",
    letterSpacing:"2px",
    marginBottom:"1px",
    color:"#1e0d05",
    marginTop:"0px",
    opacity:"1.0"
  }}
  >
    Angeólogo
  </div>

  <div
  style={{

    fontFamily:"Cinzel, serif",
    fontSize:"20px",
    fontWeight:"600",
    letterSpacing:"1px",
    color:"#2a1409",
    marginBottom:"1px",
    lineHeight:"1",
    textTransform:"uppercase"
  }}
  >
    {nombreAngeologo}
  </div>

  <div
  style={{
    fontSize:"14px",
    letterSpacing:"0.5px",
    color:"#2d160b",
     lineHeight:"1",
    fontWeight:"500"
  }}
  >
    {tituloAngeologo}
  </div>

</>

) : (

<img
  src={florVida}
  alt="Flor de la Vida"

  style={{
    width:"90px",
    opacity:"0.82",
    margin:"14px auto",
    display:"block",
    filter:
    "sepia(1) brightness(0.35) contrast(1.4)"
  }}
/>

)}

</div>

</div>


<div style={{
textAlign:"center",
marginTop:"25px",
maxWidth:"794px",
width:"100%",
padding:"0 14px",
boxSizing:"border-box",
marginLeft:"auto",
marginRight:"auto"
}}>

<button
  onClick={async () => {

  const resultado = await generarPDFNuevo(carta);

  if (!resultado?.url) return;

  const a = document.createElement("a");

  a.href = resultado.url;

  a.download = `${resultado.nombreArchivo}.pdf`;

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

}}
  style={{

  padding:"12px 28px",
  width:"240px",
  display:"block",
  margin:"55px auto 0 auto",
  background:
  "linear-gradient(180deg, #7b5532 0%, #5f3f24 100%)",
  color:"#fff",
  border:
  "1px solid rgba(255,220,160,0.18)",
  borderRadius:"12px",
  cursor:"pointer",
  fontSize:"15px",
  fontWeight:"600",
  letterSpacing:"0.5px",
  boxShadow:
  "0 8px 18px rgba(90,50,20,0.22)",
  transition:"all 0.25s ease"
}}
>
  Generar PDF
</button>

</div>

</div>

);


}

export default CartaAngel;
