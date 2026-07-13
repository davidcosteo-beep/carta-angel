import {
  getToken,
  getTokenPayload
} from "../utils/auth";
import {
  getDeviceHeaders
} from "../utils/deviceIdentity";

export const apiFetch = (url, options = {}) => {
  const token = getToken();
  const tokenPayload = getTokenPayload();
  const headers = new Headers(
    options.headers || {}
  );

  if (
    token &&
    !headers.has("Authorization")
  ) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  if (tokenPayload?.deviceId) {
    const deviceHeaders = getDeviceHeaders();

    Object.entries(deviceHeaders).forEach(
      ([name, value]) => {
        if (
          value &&
          !headers.has(name)
        ) {
          headers.set(name, value);
        }
      }
    );
  }

  return fetch(url, {
    ...options,
    headers
  });
};
