const hostname =
  typeof window !== "undefined"
    ? window.location.hostname
    : "localhost";

export const SERVER_URL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "http://localhost:4000"
    : window.location.origin;

export const API_URL = `${SERVER_URL}/api`;

export const HEALTH_URL = `${SERVER_URL}/health`;

export const construirUrlPublica = (url) => {
  if (!url) return "";

  if (
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (
    url.startsWith("http://localhost") ||
    url.startsWith("https://localhost") ||
    url.startsWith("http://127.0.0.1") ||
    url.startsWith("https://127.0.0.1")
  ) {
    const parsedUrl = new URL(url);
    return `${SERVER_URL}${parsedUrl.pathname}`;
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${SERVER_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const getApiUrl = () => SERVER_URL;
