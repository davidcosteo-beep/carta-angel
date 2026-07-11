import { API_URL } from "../config/api";
import { apiFetch } from "./apiFetch";

export const obtenerEstadoTerapeuta = async () => {
  const response = await apiFetch(
    `${API_URL}/usuarios/exists-terapeuta`
  );

  return response.json();
};

export const crearPrimerTerapeuta = async ({
  correo,
  password,
  confirmPassword
}) => {
  const response = await apiFetch(
    `${API_URL}/usuarios/crear-primer-terapeuta`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo,
        password,
        confirmPassword
      })
    }
  );

  return response.json();
};

export const crearUsuarioFuncional = async ({
  nombre,
  correo,
  password,
  confirmPassword,
  rol,
  activo = true
}) => {
  const response = await apiFetch(
    `${API_URL}/usuarios`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        correo,
        password,
        confirmPassword,
        rol,
        activo
      })
    }
  );

  return response.json();
};

export const listarPendientesVerificacion = async () => {
  const response = await apiFetch(
    `${API_URL}/usuarios/pendientes-verificacion`
  );

  return response.json();
};

export const reenviarConfirmacionUsuario = async (usuarioId) => {
  const response = await apiFetch(
    `${API_URL}/usuarios/${usuarioId}/reenviar-confirmacion`,
    {
      method: "POST"
    }
  );

  return response.json();
};

export const corregirCorreoPendiente = async ({
  usuarioId,
  correo
}) => {
  const response = await apiFetch(
    `${API_URL}/usuarios/${usuarioId}/correo-pendiente`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo
      })
    }
  );

  return response.json();
};

export const generarCodigoConfirmacionManual = async (usuarioId) => {
  const response = await apiFetch(
    `${API_URL}/usuarios/${usuarioId}/generar-codigo-confirmacion-manual`,
    {
      method: "POST"
    }
  );

  return response.json();
};
