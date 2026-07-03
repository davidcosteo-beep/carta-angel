const fs = require('fs');

const path = require('path');

const {
  generarPDFNuevo
} = require('../services/pdfGenerator');

const generarPDF = async (req, res) => {

  try {

    const carta =
  req.body;

 
    const pdfBytes =
      await generarPDFNuevo(
        carta
      );

    const nombrePaciente =
  (carta.nombre || "PACIENTE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_");

    const nombreArchivo =
      `${nombrePaciente}.pdf`;

    const rutaPDF = path.join(

      __dirname,

      '..',

      '..',

      'storage',

      'pdfs',

      nombreArchivo

    );

    fs.writeFileSync(
      rutaPDF,
      pdfBytes
    );

    return res.json({

      ok:true,

      url:
        `/pdfs/${encodeURIComponent(nombreArchivo)}`,

      nombreArchivo

    });

  } catch(error){

    console.error(error);

    res.status(500).json({

      ok:false,

      message:
        'Error generando PDF'

    });

  }

};

module.exports = {

  generarPDF

};
