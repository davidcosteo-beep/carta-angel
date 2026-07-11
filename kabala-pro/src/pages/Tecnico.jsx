import { useEffect, useState } from "react";
import { HEALTH_URL } from "../config/api";
import {
  crearPrimerTerapeuta,
  crearUsuarioFuncional,
  obtenerEstadoTerapeuta
} from "../services/usuariosService";
import {
  FUNCTIONAL_USER_ROLE_OPTIONS,
  TERAPEUTA
} from "../utils/roles";
import UsuariosPendientesVerificacion from "../components/UsuariosPendientesVerificacion";
import "./Tecnico.css";

const initialFormState = {
  nombre: "",
  correo: "",
  password: "",
  confirmPassword: ""
};

function Tecnico({
  onLogout
}) {
  const [formInicial, setFormInicial] =
    useState(initialFormState);
  const [formUsuario, setFormUsuario] =
    useState({
      ...initialFormState,
      rol: TERAPEUTA
    });
  const [existeTerapeuta, setExisteTerapeuta] =
    useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [estadoServidor, setEstadoServidor] =
    useState(null);
  const [probandoServidor, setProbandoServidor] =
    useState(false);
  const [cargandoInicial, setCargandoInicial] =
    useState(false);
  const [cargandoUsuario, setCargandoUsuario] =
    useState(false);

  const currentOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "";

  const cargarEstado = async () => {
    try {
      const data = await obtenerEstadoTerapeuta();

      if (data.ok) {
        setExisteTerapeuta(data.existeTerapeuta);
      } else {
        setMensaje(data.message);
        setTipoMensaje("error");
      }
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo verificar el estado de usuarios.");
      setTipoMensaje("error");
    }
  };

  const probarServidor = async () => {
    setProbandoServidor(true);
    setEstadoServidor(null);

    try {
      const response = await fetch(
        HEALTH_URL,
        {
          cache: "no-store"
        }
      );

      const data = await response.json().catch(() => ({}));

      setEstadoServidor({
        ok: response.ok,
        message: response.ok
          ? "Servidor disponible."
          : `El servidor respondio con estado ${response.status}.`,
        detail: data.timestamp
          ? `Ultima respuesta: ${data.timestamp}`
          : ""
      });
    } catch {
      setEstadoServidor({
        ok: false,
        message: "No fue posible conectar con /health.",
        detail: "Revisa que el backend este activo en este origen."
      });
    } finally {
      setProbandoServidor(false);
    }
  };

  useEffect(() => {
    cargarEstado();
    probarServidor();
  }, []);

  const updateFormInicial = (field, value) => {
    setFormInicial((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateFormUsuario = (field, value) => {
    setFormUsuario((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleCrearTerapeuta = async (event) => {
    event.preventDefault();

    setCargandoInicial(true);
    setMensaje("");

    try {
      const data = await crearPrimerTerapeuta({
        correo: formInicial.correo,
        password: formInicial.password,
        confirmPassword: formInicial.confirmPassword
      });

      setMensaje(data.message);
      setTipoMensaje(data.ok ? "success" : "error");

      if (data.ok) {
        setFormInicial(initialFormState);
        await cargarEstado();
      }
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo crear el terapeuta principal.");
      setTipoMensaje("error");
    } finally {
      setCargandoInicial(false);
    }
  };

  const handleCrearUsuario = async (event) => {
    event.preventDefault();

    setCargandoUsuario(true);
    setMensaje("");

    try {
      const data = await crearUsuarioFuncional(formUsuario);

      setMensaje(data.message);
      setTipoMensaje(data.ok ? "success" : "error");

      if (data.ok) {
        setFormUsuario({
          ...initialFormState,
          rol: TERAPEUTA
        });
        await cargarEstado();
      }
    } catch (error) {
      console.error(error);
      setMensaje("No se pudo crear el usuario.");
      setTipoMensaje("error");
    } finally {
      setCargandoUsuario(false);
    }
  };

  return (
    <div className="tecnico-page page-transition">
      <section className="tecnico-panel">
        <p className="tecnico-eyebrow">
          Instalacion y soporte
        </p>

        <h1>
          Panel Técnico
        </h1>

        <p className="tecnico-text">
          Este usuario tecnico solo prepara la instalacion local.
          No tiene acceso a pacientes, agenda, cartas, historial ni
          configuracion funcional.
        </p>

        <div className="tecnico-grid">
          <section className="tecnico-section">
            <div className="tecnico-section-header">
              <h2>
                Estado del servidor
              </h2>
            </div>

            <div className="tecnico-meta">
              <span>
                Origen actual
              </span>
              <strong>
                {currentOrigin || "No disponible"}
              </strong>
            </div>

            <div className="tecnico-meta">
              <span>
                API
              </span>
              <strong>
                Mismo origen (/api)
              </strong>
            </div>

            <button
              type="button"
              className="tecnico-secondary-btn"
              onClick={probarServidor}
              disabled={probandoServidor}
            >
              {probandoServidor
                ? "Probando..."
                : "Probar /health"}
            </button>

            {estadoServidor && (
              <div
                className={
                  estadoServidor.ok
                    ? "tecnico-status success"
                    : "tecnico-status error"
                }
              >
                <strong>
                  {estadoServidor.message}
                </strong>
                {estadoServidor.detail && (
                  <span>
                    {estadoServidor.detail}
                  </span>
                )}
              </div>
            )}
          </section>

          <section className="tecnico-section">
            <div className="tecnico-section-header">
              <h2>
                Usuario terapeuta inicial
              </h2>
            </div>

            <div className="tecnico-status">
              {existeTerapeuta === null
                ? "Verificando terapeuta activo..."
                : existeTerapeuta
                ? "Ya existe un terapeuta activo"
                : "Aun no existe un terapeuta activo."}
            </div>

            {existeTerapeuta === false && (
              <form
                className="tecnico-form"
                onSubmit={handleCrearTerapeuta}
                autoComplete="off"
              >
                <label>
                  Correo
                </label>

                <input
                  name="terapeutaInicialCorreo"
                  type="email"
                  autoComplete="off"
                  value={formInicial.correo}
                  onChange={(event) =>
                    updateFormInicial(
                      "correo",
                      event.target.value
                    )
                  }
                  required
                />

                <label>
                  Contraseña
                </label>

                <input
                  name="terapeutaInicialContrasena"
                  type="password"
                  autoComplete="new-password"
                  value={formInicial.password}
                  onChange={(event) =>
                    updateFormInicial(
                      "password",
                      event.target.value
                    )
                  }
                  required
                />

                <label>
                  Confirmar contraseña
                </label>

                <input
                  name="confirmarTerapeutaInicialContrasena"
                  type="password"
                  autoComplete="new-password"
                  value={formInicial.confirmPassword}
                  onChange={(event) =>
                    updateFormInicial(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  required
                />

                <button
                  type="submit"
                  disabled={cargandoInicial}
                >
                  {cargandoInicial
                    ? "Creando..."
                    : "Crear terapeuta inicial"}
                </button>
              </form>
            )}
          </section>

          <section className="tecnico-section">
            <div className="tecnico-section-header">
              <h2>
                Gestión de usuarios
              </h2>
            </div>

            <form
              className="tecnico-form"
              onSubmit={handleCrearUsuario}
              autoComplete="off"
            >
                <label>
                  Rol
                </label>

                <select
                  name="nuevoUsuarioRol"
                  value={formUsuario.rol}
                  onChange={(event) =>
                    updateFormUsuario(
                      "rol",
                      event.target.value
                    )
                  }
                >
                  {FUNCTIONAL_USER_ROLE_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <label>
                  Nombre
                </label>

                <input
                  name="nuevoUsuarioNombre"
                  type="text"
                  autoComplete="off"
                  value={formUsuario.nombre}
                  onChange={(event) =>
                    updateFormUsuario(
                      "nombre",
                      event.target.value
                    )
                  }
                  placeholder="Usuario Auxiliar"
                />

                <label>
                  Correo
                </label>

                <input
                  name="nuevoUsuarioCorreo"
                  type="email"
                  autoComplete="off"
                  value={formUsuario.correo}
                  onChange={(event) =>
                    updateFormUsuario(
                      "correo",
                      event.target.value
                    )
                  }
                  required
                />

                <label>
                  Contraseña
                </label>

                <input
                  name="nuevaContrasenaUsuario"
                  type="password"
                  autoComplete="new-password"
                  value={formUsuario.password}
                  onChange={(event) =>
                    updateFormUsuario(
                      "password",
                      event.target.value
                    )
                  }
                  required
                />

                <label>
                  Confirmar contraseña
                </label>

                <input
                  name="confirmarNuevaContrasenaUsuario"
                  type="password"
                  autoComplete="new-password"
                  value={formUsuario.confirmPassword}
                  onChange={(event) =>
                    updateFormUsuario(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  required
                />

                <button
                  type="submit"
                  disabled={cargandoUsuario}
                >
                  {cargandoUsuario
                    ? "Creando..."
                    : "Crear usuario"}
                </button>
            </form>
          </section>

          <section className="tecnico-section">
            <div className="tecnico-section-header">
              <h2>
                Acciones
              </h2>
            </div>

            <button
              type="button"
              className="tecnico-secondary-btn"
              onClick={onLogout}
            >
              Cerrar sesión
            </button>
          </section>

          <section className="tecnico-section tecnico-section-wide">
            <div className="tecnico-section-header">
              <h2>
                Usuarios pendientes de verificacion
              </h2>
            </div>

            <UsuariosPendientesVerificacion
              onMessage={(message, type) => {
                setMensaje(message);
                setTipoMensaje(type);
              }}
            />
          </section>
        </div>

        {mensaje && (
          <div className={`login-message ${tipoMensaje}`}>
            {mensaje}
          </div>
        )}
      </section>
    </div>
  );
}

export default Tecnico;
