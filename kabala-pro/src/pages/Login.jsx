import { useState } from 'react';

import { loginRequest } from '../services/authService';

export default function Login({onLogin}) {

  const [correo, setCorreo] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const data = await loginRequest(
        correo,
        password
      );

      console.log(data);

      if (data.ok) {

        localStorage.setItem(
          'token',
          data.token
        );

        onLogin(true);

        alert('Login correcto');

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.error(error);

      alert('Error conexión');

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f1115'
      }}
    >

      <form
        onSubmit={handleLogin}
        style={{
          width: '320px',
          background: '#1b1f27',
          padding: '30px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >

        <h2
          style={{
            color: 'white',
            textAlign: 'center'
          }}
        >
          Kabala Pro
        </h2>

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) =>
            setCorreo(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
        >
          {
            loading
              ? 'Ingresando...'
              : 'Ingresar'
          }
        </button>

      </form>

    </div>

  );

}