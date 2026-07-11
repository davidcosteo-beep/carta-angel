export const TECNICO = "TECNICO";
export const TERAPEUTA = "TERAPEUTA";
export const AUXILIAR = "AUXILIAR";

export const DEFAULT_ROLE = TERAPEUTA;

export const ROLES = {
  TECNICO,
  TERAPEUTA,
  AUXILIAR
};

export const FUNCTIONAL_USER_ROLE_OPTIONS = [
  {
    value: TERAPEUTA,
    label: "ANGEÓLOGO"
  },
  {
    value: AUXILIAR,
    label: AUXILIAR
  }
];

export const getRoleLabel = (rol) => {
  const normalizedRole = normalizeRole(rol, "");
  const option = FUNCTIONAL_USER_ROLE_OPTIONS.find(
    (roleOption) => roleOption.value === normalizedRole
  );

  return option?.label || normalizedRole || "";
};

const LEGACY_ROLE_MAP = {
  ANGEOLOGO: TERAPEUTA,
  MAESTRO: TERAPEUTA
};

export const normalizeRole = (
  rol,
  fallback = DEFAULT_ROLE
) => {

  const normalizedRole =
    String(rol || "")
      .trim()
      .toUpperCase();

  if (LEGACY_ROLE_MAP[normalizedRole]) {
    return LEGACY_ROLE_MAP[normalizedRole];
  }

  return Object.values(ROLES).includes(normalizedRole)
    ? normalizedRole
    : fallback;

};

export const isTecnico = (rol) =>
  normalizeRole(rol, "") === TECNICO;

export const isTerapeuta = (rol) =>
  normalizeRole(rol, "") === TERAPEUTA;

export const isAuxiliar = (rol) =>
  normalizeRole(rol, "") === AUXILIAR;
