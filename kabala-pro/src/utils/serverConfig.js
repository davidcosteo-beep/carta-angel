const SERVER_URL_KEY = "kabala_api_url";

export const normalizeServerUrl = (url) =>
  String(url || "")
    .trim()
    .replace(/\/+$/, "");

const getFallbackServerUrl = () =>
  normalizeServerUrl(import.meta.env.VITE_API_URL);

const getStoredServerUrl = () => {

  try {

    return normalizeServerUrl(
      localStorage.getItem(SERVER_URL_KEY)
    );

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
