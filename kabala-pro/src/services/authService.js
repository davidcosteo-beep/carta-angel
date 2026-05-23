const API_URL = 'http://192.168.1.19:4000/api/auth';

export const loginRequest = async (correo, password) => {

  const response = await fetch(`${API_URL}/login`, {

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