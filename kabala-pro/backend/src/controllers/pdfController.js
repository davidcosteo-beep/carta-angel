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

    const nombreArchivo =
      `carta-${Date.now()}.pdf`;

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
`http://192.168.1.19:4000/pdfs/${nombreArchivo}`

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