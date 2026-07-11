import {
  API_URL,
  construirUrlPublica
} from "../config/api";
import { apiFetch } from "./apiFetch";

export const generarPDFBackend =
  async (carta) => {

    try{

      const response =
        await apiFetch(

          `${API_URL}/pdf/generar`,

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.url) {

        return {
          ok:false,
          status: response.status,
          error: data?.error || "No se pudo generar el PDF en el servidor"
        };

      }

      return {
        ...data,
        url: construirUrlPublica(data.url)
      };

    }catch(error){

      console.error(error);

      return {

        ok:false,
        error: error?.message || "No se pudo conectar con el servidor"

      };

    }

};
