import { useState } from "react";
import { Mail } from "lucide-react";
import {
  confirmarCorreo,
  reenviarConfirmacionCorreo
} from "../services/authService";

const isValidEmail = (correo) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

export default function VerificarCorreo({
  initialCorreo = "",
  loading,
  setLoading,
  setMensaje,
  setTipoMensaje,
  onBack
}) {
  const [correo, setCorreo] = useState(initialCorreo);
  const [codigo, setCodigo] = useState("");

  const handleConfirmar = async (event) => {
    event.preventDefault();

    const correoNormalizado = correo.trim().toLowerCase();

    if (!isValidEmail(correoNormalizado)) {
      setMensaje("Ingresa un correo válido.");
      setTipoMensaje("error");
      return;
    }

    if (!/^\d{6}$/.test(codigo.trim())) {
      setMensaje("Ingresa el código de 6 dígitos.");
      setTipoMensaje("error");
      return;
    }

    setLoading(true);
    setMensaje("");

    const data = await confirmarCorreo({
      correo: correoNormalizado,
      codigo: codigo.trim()
    });

    setLoading(false);
    setMensaje(
      data.message ||
        "Correo verificado correctamente. Ya puedes iniciar sesión."
    );
    setTipoMensaje(data.ok ? "success" : "error");

    if (data.ok) {
      setCodigo("");
    }
  };

  const handleReenviar = async () => {
    const correoNormalizado = correo.trim().toLowerCase();

    if (!isValidEmail(correoNormalizado)) {
      setMensaje("Ingresa un correo válido.");
      setTipoMensaje("error");
      return;
    }

    setLoading(true);
    setMensaje("");

    const data = await reenviarConfirmacionCorreo(
      correoNormalizado
    );

    setLoading(false);
    setMensaje(
      data.message || "Si el correo está pendiente, recibirás un nuevo código."
    );
    setTipoMensaje(data.ok ? "success" : "error");
  };

  return (
    <>
      <form onSubmit={handleConfirmar}>
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
            autoComplete="email"
            inputMode="email"
            value={correo}
            onChange={(event) =>
              setCorreo(event.target.value)
            }
            className="login-input"
          />
        </div>

        <label className="login-label">
          Código de confirmación
        </label>

        <div className="input-group">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={codigo}
            onChange={(event) =>
              setCodigo(event.target.value.replace(/\D/g, ""))
            }
            className="login-input recovery-code-input"
          />
        </div>

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? "Verificando..." : "Confirmar código"}
        </button>
      </form>

      <button
        type="button"
        className="login-link-btn"
        onClick={handleReenviar}
        disabled={loading}
      >
        Reenviar código
      </button>

      <button
        type="button"
        className="login-link-btn"
        onClick={onBack}
      >
        Volver al login
      </button>
    </>
  );
}
