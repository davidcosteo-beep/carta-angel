const origin =
  typeof window !== "undefined"
    ? window.location.origin
    : "";

export const SERVER_URL =
  origin;

export const API_URL = "/api";

export const HEALTH_URL = "/health";

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
    return `${origin}${parsedUrl.pathname}`;
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const getApiUrl = () => SERVER_URL;
