import { API_URL } from "../config/api";

export const loginRequest = async (correo, password) => {

  const response = await fetch(`${API_URL}/auth/login`, {

    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      correo,
      password
    })

  });

  const data = await response.json();

  return data;

};
