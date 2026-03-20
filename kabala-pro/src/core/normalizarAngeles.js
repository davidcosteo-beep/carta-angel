import { tablaCartas } from "./tablaCartas.js";

const normalizado = {};

Object.entries(tablaCartas).forEach(([key, angel]) => {

  normalizado[key] = {
    angel: angel["angel"],
    imagen: angel["imagen"],
    atributo: angel["atributo"],
    planeta: angel["planeta"],
    coroAngelical: angel["coro angelical"],
    aroma: angel["aroma"],
    talisman: angel["talisman"],
    ofrenda: angel["ofrenda"],
    donSerDeLuz: angel["don ser de luz"],
    horaCanalizacion: angel["hora canalizacion"]
      ?.replace("de ", "")
      ?.replace(" a ", " - "),
    seCanalizaPara: angel["se canaliza para"],
    color: angel["color"],
    fechaNacimiento: angel["por fecha de nac"],
    mensaje: angel["mensaje"]
  };

});

console.log(JSON.stringify(normalizado, null, 2));