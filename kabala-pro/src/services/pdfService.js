export const generarPDFBackend =
  async (carta) => {

    try{

      const response =
        await fetch(

          'http://100.95.42.29:4000/api/pdf/generar',

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