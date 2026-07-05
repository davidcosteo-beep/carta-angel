import {
  AUXILIAR,
  MAESTRO,
  TECNICO,
  TERAPEUTA,
  normalizeRole
} from "./roles";

export const PRIVATE_ROUTE_PERMISSIONS = {
  GENERAR_CARTA: [
    MAESTRO,
    TECNICO,
    TERAPEUTA
  ],
  PACIENTES: [
    MAESTRO,
    TECNICO,
    TERAPEUTA,
    AUXILIAR
  ],
  AGENDA: [
    MAESTRO,
    TECNICO,
    TERAPEUTA,
    AUXILIAR
  ],
  HISTORIAL: [
    MAESTRO,
    TECNICO,
    TERAPEUTA
  ],
  CONFIGURACION: [
    MAESTRO,
    TECNICO,
    TERAPEUTA
  ]
};

export const INTERNAL_ACTION_PERMISSIONS = {
  FINALIZAR_CITA: [
    MAESTRO,
    TECNICO,
    TERAPEUTA
  ],
  SEGUIMIENTO: [
    MAESTRO,
    TECNICO,
    TERAPEUTA
  ],
  PACIENTES_ARCHIVADOS: [
    MAESTRO,
    TECNICO,
    TERAPEUTA
  ],
  ARCHIVAR_PACIENTE: [
    MAESTRO,
    TECNICO,
    TERAPEUTA
  ],
  REACTIVAR_PACIENTE: [
    MAESTRO,
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
