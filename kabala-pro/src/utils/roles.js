export const MAESTRO = "MAESTRO";
export const TECNICO = "TECNICO";
export const TERAPEUTA = "TERAPEUTA";
export const AUXILIAR = "AUXILIAR";

export const DEFAULT_ROLE = TERAPEUTA;

export const ROLES = {
  MAESTRO,
  TECNICO,
  TERAPEUTA,
  AUXILIAR
};

export const normalizeRole = (
  rol,
  fallback = DEFAULT_ROLE
) => {

  const normalizedRole =
    String(rol || "")
      .trim()
      .toUpperCase();

  return Object.values(ROLES).includes(normalizedRole)
    ? normalizedRole
    : fallback;

};

export const isMaestro = (rol) =>
  normalizeRole(rol, "") === MAESTRO;

export const isTecnico = (rol) =>
  normalizeRole(rol, "") === TECNICO;

export const isTerapeuta = (rol) =>
  normalizeRole(rol, "") === TERAPEUTA;

export const isAuxiliar = (rol) =>
  normalizeRole(rol, "") === AUXILIAR;
