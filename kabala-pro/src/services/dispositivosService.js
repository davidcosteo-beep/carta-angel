import { apiFetch } from "./apiFetch";

const parseResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return {
    ...data,
    ok: response.ok && data.ok !== false,
    status: response.status,
    code: data.code || null,
    message:
      data.message ||
      (
        response.ok
          ? ""
          : "No fue posible completar la operacion."
      )
  };
};

export const obtenerDispositivos = async () => {
  try {
    const response = await apiFetch(
      "/api/dispositivos",
      {
        method: "GET",
        cache: "no-store"
      }
    );

    return parseResponse(response);
  } catch {
    return {
      ok: false,
      status: 0,
      code: "SERVER_UNAVAILABLE",
      message:
        "No fue posible conectar con el servidor."
    };
  }
};

export const revocarDispositivo = async ({
  id,
  password
}) => {
  try {
    const response = await apiFetch(
      `/api/dispositivos/${id}/revocar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          password
            ? { password }
            : {}
        )
      }
    );

    return parseResponse(response);
  } catch {
    return {
      ok: false,
      status: 0,
      code: "SERVER_UNAVAILABLE",
      message:
        "No fue posible conectar con el servidor."
    };
  }
};

export const reactivarDispositivo = async (id) => {
  try {
    const response = await apiFetch(
      `/api/dispositivos/${id}/reactivar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: "{}"
      }
    );

    return parseResponse(response);
  } catch {
    return {
      ok: false,
      status: 0,
      code: "SERVER_UNAVAILABLE",
      message:
        "No fue posible conectar con el servidor."
    };
  }
};
