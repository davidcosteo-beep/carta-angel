import {
  useState,
  useRef,
  useEffect
} from 'react';

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

  const [mensaje, setMensaje] = useState("");

  const [tipoMensaje, setTipoMensaje] = useState("");

  const [correo, setCorreo] = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [fadeOut, setFadeOut] = useState(false);

  const correoRef = useRef(null);

  const passwordRef = useRef(null);

  const ingresarRef = useRef(null);

  const handleLogin = async (e) => {

  e.preventDefault();

  try {

    setLoading(true);

    setMensaje('');

    const data = await loginRequest(
      correo,
      password
    );

    console.log(data);

    if (data.ok) {

      setMensaje('✦ Acceso concedido ✦');

      setTipoMensaje('success');

      localStorage.setItem(
        'token',
        data.token
      );

      setTimeout(() => {

  setFadeOut(true);

}, 500);

setTimeout(() => {

  onLogin(true);

}, 500);

    } else {

      setMensaje(data.message);

      setTipoMensaje('error');

    }

  } catch (error) {

    console.error(error);

    setMensaje('Error de conexión');

    setTipoMensaje('error');

  } finally {

    setLoading(false);

  }

};

  useEffect(() => {

  correoRef.current?.focus();

}, []);

  return (

    <div
  className={
    fadeOut
      ? "login-container login-fade-out"
      : "login-container login-enter"
  }
>
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

  ref={correoRef}

  autoFocus

  type="email"

  autoComplete="email"

  inputMode="email"

  placeholder="Ingresa tu correo"

  value={correo}

  onChange={(e) =>
    setCorreo(e.target.value)
  }

  onKeyDown={(e) => {

    if(e.key === "Enter"){

      e.preventDefault();

      passwordRef.current?.focus();

    }

  }}

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

              ref={passwordRef}

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

              onKeyDown={(e) => {

                if(e.key === "Enter"){

                  e.preventDefault();

                  ingresarRef.current?.click();

                }

              }}

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
          ref={ingresarRef}
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

        {
  mensaje && (

    <div
      className={`login-message ${tipoMensaje}`}
    >

      {mensaje}

    </div>

  )
}

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