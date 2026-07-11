import {
  AUXILIAR,
  TECNICO,
  TERAPEUTA,
  normalizeRole
} from "./roles";

export const PRIVATE_ROUTE_PERMISSIONS = {
  GENERAR_CARTA: [
    TERAPEUTA
  ],
  PACIENTES: [
    TERAPEUTA,
    AUXILIAR
  ],
  AGENDA: [
    TERAPEUTA,
    AUXILIAR
  ],
  HISTORIAL: [
    TERAPEUTA
  ],
  CONFIGURACION: [
    TERAPEUTA
  ],
  USUARIOS: [
    TERAPEUTA
  ],
  TECNICO: [
    TECNICO
  ]
};

export const INTERNAL_ACTION_PERMISSIONS = {
  FINALIZAR_CITA: [
    TERAPEUTA
  ],
  SEGUIMIENTO: [
    TERAPEUTA
  ],
  PACIENTES_ARCHIVADOS: [
    TERAPEUTA
  ],
  ARCHIVAR_PACIENTE: [
    TERAPEUTA
  ],
  REACTIVAR_PACIENTE: [
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
    normalizeRole(rol, "")
  );

};

export const getSafeRouteForRole = (rol) => {

  const normalizedRole = normalizeRole(rol);

  if (normalizedRole === AUXILIAR) {

    return "/agenda";

  }

  if (normalizedRole === TECNICO) {

    return "/tecnico";

  }

  return "/generar-carta";

};
