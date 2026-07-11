import { HEALTH_URL } from "../config/api";

const isHealthyResponse = (response, payload) =>
  response.ok === true &&
  payload?.ok === true &&
  payload?.service === "kabala-pro-api" &&
  payload?.status === "running";

const checkServerHealth = async () => {

  if (
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {

    return {
      available: false,
      status: null
    };

  }

  const controller = new AbortController();

  const timer = setTimeout(() => {

    controller.abort();

  }, 2500);

  try {

    const response = await fetch(
      `${HEALTH_URL}?_=${Date.now()}`,
      {
        cache: "no-store",
        signal: controller.signal
      }
    );

    const payload = await response.json();

    return {
      available: isHealthyResponse(
        response,
        payload
      ),
      status: response.status
    };

  } catch {

    return {
      available: false,
      status: null
    };

  } finally {

    clearTimeout(timer);

  }

};

export const checkServerAvailable = async () => {

  const result = await checkServerHealth();

  return result.available;

};

export const testServerConnection = async () => {

  const result = await checkServerHealth();

  if (!result.available) {

    return {
      ok: false,
      message: result.status === null
        ? "No fue posible conectar con el servidor."
        : `El servidor respondio con estado ${result.status}.`
    };

  }

  return {
    ok: true,
    message: "Conexion exitosa."
  };

};
