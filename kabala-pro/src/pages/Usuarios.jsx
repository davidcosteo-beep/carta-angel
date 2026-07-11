import { useState } from "react";
import UsuariosPendientesVerificacion from "../components/UsuariosPendientesVerificacion";
import { crearUsuarioFuncional } from "../services/usuariosService";
import {
  AUXILIAR,
  FUNCTIONAL_USER_ROLE_OPTIONS,
  TERAPEUTA
} from "../utils/roles";
import "./Usuarios.css";

const initialForm = {
  nombre: "",
  correo: "",
  password: "",
  confirmPassword: "",
  rol: TERAPEUTA,
  activo: true
};

const isValidEmail = (correo) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

function Usuarios() {
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) {
      return "El nombre es obligatorio.";
    }

    if (!isValidEmail(form.correo.trim())) {
      return "Ingresa un correo valido.";
    }

    if (!form.password) {
      return "La contrasena es obligatoria.";
    }

    if (form.password !== form.confirmPassword) {
      return "La confirmacion de contrasena no coincide.";
    }

    if (
      form.rol !== TERAPEUTA &&
      form.rol !== AUXILIAR
    ) {
      return "No tienes permisos para crear este usuario.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensaje(errorValidacion);
      setTipoMensaje("error");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const data = await crearUsuarioFuncional({
        ...form,
        nombre: form.nombre.trim(),
        correo: form.correo.trim()
      });

      setMensaje(
        data.ok
          ? "Usuario creado correctamente."
          : data.message || "No fue posible crear el usuario."
      );
      setTipoMensaje(data.ok ? "success" : "error");

      if (data.ok) {
        setForm(initialForm);
      }
    } catch (error) {
      console.error(error);
      setMensaje("No fue posible crear el usuario.");
      setTipoMensaje("error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="usuarios-page page-transition">
      <section className="usuarios-panel">
        <p className="usuarios-eyebrow">
          Administración
        </p>

        <h1>
          Gestión de usuarios
        </h1>

        <p className="usuarios-text">
          Crea usuarios funcionales para Kabala Pro. Desde esta
          opción no se pueden crear usuarios técnicos.
        </p>

        <form
          className="usuarios-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <label>
            Nombre
          </label>

          <input
            name="nuevoUsuarioNombre"
            type="text"
            autoComplete="off"
            value={form.nombre}
            onChange={(event) =>
              updateForm("nombre", event.target.value)
            }
            required
          />

          <label>
            Correo
          </label>

          <input
            name="nuevoUsuarioCorreo"
            type="email"
            autoComplete="off"
            value={form.correo}
            onChange={(event) =>
              updateForm("correo", event.target.value)
            }
            required
          />

          <label>
            Rol
          </label>

          <select
            name="nuevoUsuarioRol"
            value={form.rol}
            onChange={(event) =>
              updateForm("rol", event.target.value)
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

          <label className="usuarios-check">
            <input
              name="nuevoUsuarioActivo"
              type="checkbox"
              checked={form.activo}
              onChange={(event) =>
                updateForm("activo", event.target.checked)
              }
            />
            Activo
          </label>

          <label>
            Contraseña
          </label>

          <input
            name="nuevaContrasenaUsuario"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              updateForm("password", event.target.value)
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
            value={form.confirmPassword}
            onChange={(event) =>
              updateForm(
                "confirmPassword",
                event.target.value
              )
            }
            required
          />

          <button
            type="submit"
            disabled={guardando}
          >
            {guardando
              ? "Creando..."
              : "Crear usuario"}
          </button>
        </form>

        {mensaje && (
          <div className={`login-message ${tipoMensaje}`}>
            {mensaje}
          </div>
        )}

        <section className="usuarios-subsection">
          <h2>
            Usuarios pendientes de verificacion
          </h2>

          <UsuariosPendientesVerificacion
            onMessage={(message, type) => {
              setMensaje(message);
              setTipoMensaje(type);
            }}
          />
        </section>
      </section>
    </div>
  );
}

export default Usuarios;
