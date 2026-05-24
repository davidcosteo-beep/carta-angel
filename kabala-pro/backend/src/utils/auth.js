export const isTokenValid = () => {

  const token = localStorage.getItem('token');

  if (!token) {

    return false;

  }

  try {

    const payload = JSON.parse(

      atob(token.split('.')[1])

    );

    const now = Date.now() / 1000;

    return payload.exp > now;

  } catch (error) {

    return false;

  }

};