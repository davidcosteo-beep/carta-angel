import {
  useCallback,
  useEffect,
  useState
} from "react";
import {
  corregirCorreoPendiente,
  generarCodigoConfirmacionManual,
  listarPendientesVerificacion,
  reenviarConfirmacionUsuario
} from "../services/usuariosService";
import { getRoleLabel } from "../utils/roles";

export default function UsuariosPendientesVerificacion({
  onMessage
}) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [codigoManual, setCodigoManual] = useState(null);

  const notify = useCallback((message, type = "success") => {
    if (onMessage) {
      onMessage(message, type);
    }
  }, [onMessage]);

  const cargarPendientes = useCallback(async () => {
    setCargando(true);

    try {
      const data = await listarPendientesVerificacion();

      if (data.ok) {
        setUsuarios(data.usuarios || []);
      } else {
        notify(
          data.message || "No fue posible cargar usuarios pendientes.",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      notify("No fue posible cargar usuarios pendientes.", "error");
    } finally {
      setCargando(false);
    }
  }, [notify]);

  useEffect(() => {
    cargarPendientes();
  }, [cargarPendientes]);

  const handleReenviar = async (usuarioId) => {
    setCodigoManual(null);
    const data = await reenviarConfirmacionUsuario(usuarioId);

    notify(
      data.message || "Código reenviado.",
      data.ok ? "success" : "error"
    );

    if (data.ok) {
      cargarPendientes();
    }
  };

  const handleCorregirCorreo = async (usuario) => {
    const correo = window.prompt(
      "Nuevo correo del usuario pendiente:",
      usuario.correo
    );

    if (!correo) {
      return;
    }

    setCodigoManual(null);
    const data = await corregirCorreoPendiente({
      usuarioId: usuario.id,
      correo: correo.trim().toLowerCase()
    });

    notify(
      data.message || "Correo actualizado.",
      data.ok ? "success" : "error"
    );

    if (data.ok) {
      cargarPendientes();
    }
  };

  const handleCodigoManual = async (usuarioId) => {
    const data = await generarCodigoConfirmacionManual(usuarioId);

    if (data.ok) {
      setCodigoManual(data);
    }

    notify(
      data.message || "Código manual generado.",
      data.ok ? "success" : "error"
    );
  };

  return (
    <div className="usuarios-pendientes">
      {cargando ? (
        <p className="tecnico-text compact">
          Cargando usuarios pendientes...
        </p>
      ) : usuarios.length === 0 ? (
        <p className="tecnico-text compact">
          No hay usuarios pendientes de verificación.
        </p>
      ) : (
        <div className="usuarios-pendientes-list">
          {usuarios.map((usuario) => (
            <article
              key={usuario.id}
              className="usuario-pendiente-item"
            >
              <div>
                <strong>
                  {usuario.nombre || usuario.correo}
                </strong>
                <span>
                  {usuario.correo} - {getRoleLabel(usuario.rol)}
                </span>
                <small>
                  Estado: {usuario.activo ? "Activo" : "Inactivo"}
                </small>
              </div>

              <div className="usuario-pendiente-actions">
                <button
                  type="button"
                  onClick={() => handleReenviar(usuario.id)}
                >
                  Reenviar código
                </button>
                <button
                  type="button"
                  onClick={() => handleCorregirCorreo(usuario)}
                >
                  Corregir correo
                </button>
                <button
                  type="button"
                  onClick={() => handleCodigoManual(usuario.id)}
                >
                  Código manual
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {codigoManual && (
        <div className="tecnico-code-box">
          <strong>
            Código manual: {codigoManual.codigo}
          </strong>
          <span>
            Válido por {codigoManual.expiraEnMinutos} minutos
          </span>
        </div>
      )}
    </div>
  );
}
