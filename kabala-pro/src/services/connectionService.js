import { getApiUrl } from "../config/api";
import { normalizeServerUrl } from "../utils/serverConfig";

export const testServerConnection = async (url) => {

  const apiUrl = normalizeServerUrl(
    url || getApiUrl()
  );

  if (!apiUrl) {

    return {
      ok: false,
      message: "Debes ingresar la URL del servidor."
    };

  }

  try {

    const response = await fetch(
      `${apiUrl}/health`
    );

    if (!response.ok) {

      return {
        ok: false,
        message: `El servidor respondio con estado ${response.status}.`
      };

    }

    return {
      ok: true,
      message: "Conexion exitosa."
    };

  } catch {

    return {
      ok: false,
      message: "No fue posible conectar con el servidor."
    };

  }

};
