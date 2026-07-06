const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

const normalizePatientName = (nombre) => {
  const normalizedName = String(nombre || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(INVALID_FILENAME_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  return normalizedName || "PACIENTE";
};

const formatBirthDate = (fechaNacimiento) => {
  const value = String(fechaNacimiento || "")
    .trim();

  const isoMatch =
    value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
  }

  const localMatch =
    value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (localMatch) {
    return [
      localMatch[1].padStart(2, "0"),
      localMatch[2].padStart(2, "0"),
      localMatch[3]
    ].join("-");
  }

  return "SIN FECHA";
};

export const buildCartaPdfFileName = (
  nombre,
  fechaNacimiento
) => {
  const patientName =
    normalizePatientName(nombre);

  const birthDate =
    formatBirthDate(fechaNacimiento);

  return `${patientName} ${birthDate}.pdf`;
};
