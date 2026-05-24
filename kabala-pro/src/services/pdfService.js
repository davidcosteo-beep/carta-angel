export const generarPDFBackend =
  async (carta) => {

    try{

      const response =
        await fetch(

          'http://192.168.1.19:4000/api/pdf/generar',

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