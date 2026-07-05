import { HEALTH_URL } from "../config/api";
import { normalizeServerUrl } from "../utils/serverConfig";

export const checkServerAvailable = async () => {

  if (
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {

    return false;

  }

  const controller = new AbortController();

  const timer = setTimeout(() => {

    controller.abort();

  }, 2500);

  try {

    const response = await fetch(
      HEALTH_URL,
      {
        cache: "no-store",
        signal: controller.signal
      }
    );

    return response.ok;

  } catch {

    return false;

  } finally {

    clearTimeout(timer);

  }

};

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
