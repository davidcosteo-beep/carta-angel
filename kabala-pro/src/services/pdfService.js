import { API_URL } from "../config/api";

export const generarPDFBackend =
  async (carta) => {

    try{

      const response =
        await fetch(

          `${API_URL}/api/pdf/generar`,

          {
            method:'POST',

            headers:{
              'Content-Type':
                'application/json'
            },

            body:JSON.stringify(
              carta
            )

          }

        );

      return response.json();

    }catch(error){

      console.error(error);

      return {

        ok:false

      };

    }

};