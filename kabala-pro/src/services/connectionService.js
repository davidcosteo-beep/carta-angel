import { HEALTH_URL } from "../config/api";

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

export const testServerConnection = async () => {

  try {

    const response = await fetch(
      HEALTH_URL,
      {
        cache: "no-store"
      }
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
