import {
  AUXILIAR,
  TECNICO,
  TERAPEUTA,
  normalizeRole
} from "./roles";

export const PRIVATE_ROUTE_PERMISSIONS = {
  GENERAR_CARTA: [
    TECNICO,
    TERAPEUTA
  ],
  PACIENTES: [
    TECNICO,
    TERAPEUTA,
    AUXILIAR
  ],
  AGENDA: [
    TECNICO,
    TERAPEUTA,
    AUXILIAR
  ],
  HISTORIAL: [
    TECNICO,
    TERAPEUTA
  ],
  CONFIGURACION: [
    TECNICO,
    TERAPEUTA
  ]
};

export const canAccessRole = (
  rol,
  allowedRoles
) => {

  if (!allowedRoles?.length) {

    return true;

  }

  return allowedRoles.includes(
    normalizeRole(rol)
  );

};

export const getSafeRouteForRole = (rol) => {

  const normalizedRole = normalizeRole(rol);

  if (normalizedRole === AUXILIAR) {

    return "/agenda";

  }

  return "/";

};
