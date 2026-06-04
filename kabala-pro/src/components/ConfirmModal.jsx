import "./ConfirmModal.css";

function ConfirmModal({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
  onCerrar
}) {

  if (!abierto) return null;

  return (

    <div className="kp-modal-overlay">

      <div className="kp-confirm-modal">

        <h2>{titulo}</h2>

        <p>{mensaje}</p>

        <div className="kp-confirm-botones">

          <button
            className="kp-btn-cancelar"
            onClick={onCancelar || onCerrar}
          >
            {textoCancelar}
          </button>

          <button
            className="kp-btn-confirmar"
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>

        </div>

      </div>

    </div>

  );

}

export default ConfirmModal;