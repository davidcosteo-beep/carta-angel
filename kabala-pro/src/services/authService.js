export const loginRequest = async (correo, password) => {

  let response;

  try {

    response = await fetch("/api/auth/login", {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        correo,
        password
      })

    });

  } catch {

    return {
      ok: false,
      code: "SERVER_UNAVAILABLE",
      message: "No fue posible conectar con el servidor."
    };

  }

  let data;

  try {

    data = await response.json();

  } catch {

    data = {};

  }

  if (!response.ok) {

    return {
      ok: false,
      code: data.code || (
        response.status >= 500
          ? "SERVER_UNAVAILABLE"
          : "INVALID_CREDENTIALS"
      ),
      requiresEmailVerification:
        Boolean(data.requiresEmailVerification),
      correo: data.correo,
      message: data.message
    };

  }

  return data;

};

const authPost = async (url, body) => {
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch {
    return {
      ok: false,
      message:
        "No fue posible conectar con Kabala Pro. Verifica que el servidor este activo."
    };
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return {
    ...data,
    ok: response.ok && data.ok !== false,
    message: data.message
  };
};

export const confirmarCorreo = ({
  correo,
  codigo
}) =>
  authPost("/api/auth/confirmar-correo", {
    correo,
    codigo
  });

export const reenviarConfirmacionCorreo = (correo) =>
  authPost("/api/auth/reenviar-confirmacion-correo", {
    correo
  });
