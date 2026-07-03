import { HEALTH_URL } from "../config/api";
import { normalizeServerUrl } from "../utils/serverConfig";

export const testServerConnection = async (url) => {

  const healthUrl = url
    ? `${normalizeServerUrl(url)}/health`
    : HEALTH_URL;

  if (!healthUrl) {

    return {
      ok: false,
      message: "Debes ingresar la URL del servidor."
    };

  }

  try {

    const response = await fetch(
      healthUrl
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
