const fs = require('fs');

const path = require('path');

const {
  generarPDFNuevo
} = require('../services/pdfGenerator');

const {
  buildCartaPdfFileName
} = require('../utils/cartaPdfFileName');

const generarPDF = async (req, res) => {

  try {

    const carta =
  req.body;

 
    const pdfBytes =
      await generarPDFNuevo(
        carta
      );

    const nombreArchivo =
      buildCartaPdfFileName(
        carta.nombre,
        carta.fecha
      );

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
