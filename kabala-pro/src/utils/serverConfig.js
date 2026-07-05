const SERVER_URL_KEY = "kabala_api_url";

export const normalizeServerUrl = (url) =>
  String(url || "")
    .trim()
    .replace(/\/+$/, "");

const getFallbackServerUrl = () =>
  normalizeServerUrl(import.meta.env.VITE_API_URL) ||
  getSameOriginServerUrl();

const getSameOriginServerUrl = () => {

  if (typeof window === "undefined") {

    return "";

  }

  return normalizeServerUrl(
    window.location.origin
  );

};

const isLocalServerUrl = (url) => {

  try {

    const parsedUrl = new URL(url);

    return [
      "localhost",
      "127.0.0.1",
      "::1",
      "[::1]"
    ].includes(parsedUrl.hostname);

  } catch {

    return false;

  }

};

const isCurrentHostLocal = () => {

  if (typeof window === "undefined") {

    return false;

  }

  return [
    "localhost",
    "127.0.0.1",
    "::1",
    "[::1]"
  ].includes(window.location.hostname);

};

const getStoredServerUrl = () => {

  try {

    const savedUrl = normalizeServerUrl(
      localStorage.getItem(SERVER_URL_KEY)
    );

    if (
      savedUrl &&
      isLocalServerUrl(savedUrl) &&
      !isCurrentHostLocal()
    ) {

      return "";

    }

    return savedUrl;

  } catch {

    return "";

  }

};

export const getServerConfig = () => {

  const savedUrl = getStoredServerUrl();

  if (savedUrl) {

    return {
      apiUrl: savedUrl,
      source: "localStorage"
    };

  }

  return {
    apiUrl: getFallbackServerUrl(),
    source: "env"
  };

};

export const saveServerConfig = (url) => {

  const normalizedUrl = normalizeServerUrl(url);

  if (!normalizedUrl) {

    throw new Error("La URL del servidor no puede estar vacia.");

  }

  localStorage.setItem(
    SERVER_URL_KEY,
    normalizedUrl
  );

  return normalizedUrl;

};

export const clearServerConfig = () => {

  localStorage.removeItem(SERVER_URL_KEY);

};

export const hasServerConfig = () =>
  Boolean(getServerConfig().apiUrl);
