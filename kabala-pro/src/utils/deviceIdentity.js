const DEVICE_ID_KEY = "kabala_device_id";
const DEVICE_SECRET_KEY = "kabala_device_secret";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getWebCrypto = () => {
  if (
    typeof crypto === "undefined" ||
    typeof crypto.getRandomValues !== "function"
  ) {
    throw new Error(
      "El navegador no permite generar una identidad segura."
    );
  }

  return crypto;
};

const generateUuid = () => {
  const webCrypto = getWebCrypto();

  if (typeof webCrypto.randomUUID === "function") {
    return webCrypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  webCrypto.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(
    bytes,
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join("-");
};

const generateSecret = () => {
  const bytes = new Uint8Array(32);

  getWebCrypto().getRandomValues(bytes);

  const binary = Array.from(
    bytes,
    (byte) => String.fromCharCode(byte)
  ).join("");

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const detectPlatform = () => {
  if (typeof navigator === "undefined") {
    return "Desconocida";
  }

  const userAgent = navigator.userAgent || "";
  const reportedPlatform =
    navigator.userAgentData?.platform ||
    navigator.platform ||
    "";

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "iOS";
  }

  if (/win/i.test(reportedPlatform)) {
    return "Windows";
  }

  if (/mac/i.test(reportedPlatform)) {
    return "macOS";
  }

  if (/linux/i.test(reportedPlatform)) {
    return "Linux";
  }

  return reportedPlatform || "Desconocida";
};

const detectBrowser = () => {
  if (typeof navigator === "undefined") {
    return "Navegador";
  }

  const userAgent = navigator.userAgent || "";

  if (/Edg\//i.test(userAgent)) {
    return "Edge";
  }

  if (/OPR\//i.test(userAgent)) {
    return "Opera";
  }

  if (/CriOS\//i.test(userAgent)) {
    return "Chrome";
  }

  if (/Chrome\//i.test(userAgent)) {
    return "Chrome";
  }

  if (/FxiOS\//i.test(userAgent)) {
    return "Firefox";
  }

  if (/Firefox\//i.test(userAgent)) {
    return "Firefox";
  }

  if (/Safari\//i.test(userAgent)) {
    return "Safari";
  }

  return "Navegador";
};

const detectPwaMode = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const standaloneDisplay =
    typeof window.matchMedia === "function" &&
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

  const iosStandalone =
    typeof navigator !== "undefined" &&
    navigator.standalone === true;

  return Boolean(
    standaloneDisplay ||
    iosStandalone
  );
};

export const getStoredDeviceCredentials = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const deviceId =
      window.localStorage.getItem(DEVICE_ID_KEY);
    const deviceSecret =
      window.localStorage.getItem(DEVICE_SECRET_KEY);

    if (
      !UUID_PATTERN.test(deviceId || "") ||
      typeof deviceSecret !== "string" ||
      deviceSecret.length === 0
    ) {
      return null;
    }

    return {
      deviceId,
      deviceSecret
    };
  } catch {
    return null;
  }
};

export const getOrCreateDeviceIdentity = () => {
  if (typeof window === "undefined") {
    throw new Error(
      "La identidad del dispositivo no esta disponible."
    );
  }

  let credentials = getStoredDeviceCredentials();

  if (!credentials) {
    credentials = {
      deviceId: generateUuid(),
      deviceSecret: generateSecret()
    };

    try {
      window.localStorage.setItem(
        DEVICE_ID_KEY,
        credentials.deviceId
      );

      window.localStorage.setItem(
        DEVICE_SECRET_KEY,
        credentials.deviceSecret
      );
    } catch {
      throw new Error(
        "No fue posible guardar la identidad del dispositivo."
      );
    }
  }

  const plataforma = detectPlatform();
  const navegador = detectBrowser();
  const shortId = credentials.deviceId
    .slice(-4)
    .toUpperCase();

  return {
    ...credentials,
    nombre:
      `${plataforma} - ${navegador} (${shortId})`,
    plataforma,
    navegador,
    esPwa: detectPwaMode()
  };
};

export const getDeviceHeaders = () => {
  const credentials = getStoredDeviceCredentials();

  if (!credentials) {
    return {};
  }

  return {
    "X-Kabala-Device-Id": credentials.deviceId,
    "X-Kabala-Device-Secret":
      credentials.deviceSecret
  };
};

export const getCurrentDeviceId = () =>
  getStoredDeviceCredentials()?.deviceId || null;
