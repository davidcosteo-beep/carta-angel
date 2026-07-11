import {
  useState,
  useRef,
  useEffect
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  loginRequest
} from '../services/authService';
import VerificarCorreo from '../components/VerificarCorreo';
import { getCurrentUser } from '../utils/auth';
import { getSafeRouteForRole } from '../utils/permissions';

import './Login.css';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';

export default function Login({
  onLogin
}) {
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [modoVerificacionCorreo, setModoVerificacionCorreo] =
    useState(false);
  const [correoVerificacion, setCorreoVerificacion] =
    useState("");

  const correoRef = useRef(null);
  const passwordRef = useRef(null);
  const ingresarRef = useRef(null);
  const navigate = useNavigate();

  const getLoginMessage = (data) => {
    if (data?.code === "USER_INACTIVE") {
      return "Usuario inactivo. Solicita la reactivación de tu cuenta.";
    }

    if (data?.code === "SERVER_UNAVAILABLE") {
      return "Servidor no disponible. Revisa tu conexion e intenta nuevamente.";
    }

    if (data?.code === "INVALID_CREDENTIALS") {
      return "Correo o contraseña incorrectos.";
    }

    return data?.message || "No fue posible iniciar sesión.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMensaje('');

      const data = await loginRequest(
        correo,
        password
      );

      if (data.ok) {
        setMensaje('Acceso concedido');
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
          navigate(
            getSafeRouteForRole(getCurrentUser()?.rol),
            { replace: true }
          );
        }, 500);
      } else {
        if (data.requiresEmailVerification) {
          setCorreoVerificacion(
            data.correo || correo.trim().toLowerCase()
          );
          setModoVerificacionCorreo(true);
        }

        setMensaje(getLoginMessage(data));
        setTipoMensaje('error');
      }
    } catch (error) {
      console.error(error);
      setMensaje(
        'Servidor no disponible. Revisa tu conexion e intenta nuevamente.'
      );
      setTipoMensaje('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    correoRef.current?.focus();
  }, []);

  const renderLoginForm = () => (
    <>
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

      <label className="login-label">
        Contrasena
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
          placeholder="Contrasena"
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

      <button
        ref={ingresarRef}
        className="login-btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {
          loading
            ? 'Ingresando...'
            : 'Ingresar'
        }
      </button>
    </>
  );

  const renderEmailVerificationForm = () => (
    <VerificarCorreo
      initialCorreo={correoVerificacion}
      loading={loading}
      setLoading={setLoading}
      setMensaje={setMensaje}
      setTipoMensaje={setTipoMensaje}
      onBack={() => {
        setModoVerificacionCorreo(false);
        setMensaje("");
        setTipoMensaje("");
      }}
    />
  );

  return (
    <div
      className={
        fadeOut
          ? "login-container login-fade-out"
          : "login-container login-enter"
      }
    >
      <div className="login-card">
        <h1 className="login-title">
          Kabala Pro
        </h1>

        <div className="title-divider">
          <div className="divider-line" />
          <div className="divider-ornament">
            *
          </div>
          <div className="divider-line" />
        </div>

        <p className="login-subtitle">
          {modoVerificacionCorreo
            ? "VERIFICACION DE CORREO"
            : "ACCESO PREMIUM"}
        </p>

        {modoVerificacionCorreo
          ? renderEmailVerificationForm()
          : renderLoginForm()}

        {mensaje && (
          <div
            className={`login-message ${tipoMensaje}`}
          >
            {mensaje}
          </div>
        )}

        <div className="face-divider">
          <div className="line" />
          <div className="flower">
            *
          </div>
          <div className="line" />
        </div>

        <div className="login-protect">
          <Shield
            size={16}
            strokeWidth={1.8}
          />

          <span>
            Tu informacion esta protegida
          </span>
        </div>
      </div>
    </div>
  );
}
