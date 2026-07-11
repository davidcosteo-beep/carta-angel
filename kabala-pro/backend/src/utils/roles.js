const ROLES = {
  TECNICO: 'TECNICO',
  TERAPEUTA: 'TERAPEUTA',
  AUXILIAR: 'AUXILIAR'
};

const LEGACY_ROLE_MAP = {
  ANGEOLOGO: ROLES.TERAPEUTA,
  MAESTRO: ROLES.TERAPEUTA
};

const normalizeRole = (rol, fallback = ROLES.TERAPEUTA) => {
  const normalizedRole = String(rol || '')
    .trim()
    .toUpperCase();

  if (LEGACY_ROLE_MAP[normalizedRole]) {
    return LEGACY_ROLE_MAP[normalizedRole];
  }

  return Object.values(ROLES).includes(normalizedRole)
    ? normalizedRole
    : fallback;
};

module.exports = {
  ROLES,
  normalizeRole
};
