import {
  TERAPEUTA,
  normalizeRole
} from "./roles";

const DEFAULT_ROLE = TERAPEUTA;

export const getToken = () =>
  localStorage.getItem('token');

export const getTokenPayload = () => {

  const token = getToken();

  if (!token) {

    return null;

  }

  try {

    return JSON.parse(

      atob(token.split('.')[1])

    );

  } catch {

    return null;

  }

};

export const isTokenValid = () => {

  const payload = getTokenPayload();

  if (!payload?.exp) {

    return false;

  }

  const now = Date.now() / 1000;

  return payload.exp > now;

};

export const getCurrentUser = () => {

  const payload = getTokenPayload();

  if (!payload) {

    return null;

  }

  return {
    id: payload.id,
    correo: payload.correo,
    premium: payload.premium,
    rol: normalizeRole(
      payload.rol,
      DEFAULT_ROLE
    )
  };

};

export const getUserRole = () =>
  getCurrentUser()?.rol || DEFAULT_ROLE;
