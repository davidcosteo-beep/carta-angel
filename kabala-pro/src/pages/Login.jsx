import { useState } from 'react';

import { loginRequest } from '../services/authService';

import './Login.css';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ScanFace,
  Shield
} from 'lucide-react';

export default function Login({ onLogin }) {

  const [correo, setCorreo] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

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

    <div className="login-container login-enter">

      {/* BACKGROUND SYMBOL */}

      <svg
        className="bg-symbol"
        viewBox="0 0 200 200"
      >

        <path
          d="
          M100 60
          C120 60 135 80 100 100
          C65 80 80 60 100 60

          M140 100
          C140 120 120 135 100 100
          C120 65 140 80 140 100

          M100 140
          C80 140 65 120 100 100
          C135 120 120 140 100 140

          M60 100
          C60 80 80 65 100 100
          C80 135 60 120 60 100
          "
        />

      </svg>

      {/* LOGIN CARD */}

      <div className="login-card">

        <h1 className="login-title">
          Kabala Pro
        </h1>

        <div className="title-divider">

          <div className="divider-line" />

          <div className="divider-ornament">
            ❀
          </div>

          <div className="divider-line" />

        </div>

        <p className="login-subtitle">
          ACCESO PREMIUM
        </p>

        {/* EMAIL */}

        <label className="login-label">
          Correo
        </label>

        <div className="input-group">

          <Mail
            className="input-icon"
            size={20}
          />

          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={correo}
            onChange={(e) =>
              setCorreo(e.target.value)
            }
            className="login-input"
          />

        </div>

        {/* PASSWORD */}

        <label className="login-label">
          Contraseña
        </label>

        <div className="input-group">

          <Lock
            className="input-icon"
            size={20}
          />

          <input
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="login-input"
          />

          <button
            type="button"
            className="eye-btn"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >

            {
              showPassword
                ? <EyeOff size={20}/>
                : <Eye size={20}/>
            }

          </button>

        </div>

        {/* LOGIN BUTTON */}

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >

          {
            loading
              ? 'Ingresando...'
              : '✦ Ingresar ✦'
          }

        </button>

        {/* DIVIDER */}

        <div className="face-divider">

          <div className="line" />

          <div className="flower">
            ❀
          </div>

          <div className="line" />

        </div>

        {/* FACE ID */}

        <button className="faceid-btn">

          <div className="face-icon">

            <ScanFace
              size={34}
              strokeWidth={1.6}
            />

          </div>

          <span>
            Ingresar con Face ID
          </span>

        </button>

        {/* FOOTER */}

        <div className="login-protect">

          <Shield
            size={16}
            strokeWidth={1.8}
          />

          <span>
            Tu información está protegida
          </span>

        </div>

      </div>

    </div>
  );
}