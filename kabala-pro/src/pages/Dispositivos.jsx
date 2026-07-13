import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  Ban,
  KeyRound,
  MonitorSmartphone,
  Power,
  RefreshCw,
  ShieldCheck,
  X
} from "lucide-react";

import {
  obtenerDispositivos,
  reactivarDispositivo,
  revocarDispositivo
} from "../services/dispositivosService";
import {
  getTokenPayload,
  getUserRole
} from "../utils/auth";
import {
  isTecnico,
  isTerapeuta
} from "../utils/roles";

import "./Dispositivos.css";

const SESSION_ERROR_CODES = [
  "TOKEN_INVALID",
  "DEVICE_REVOKED",
  "DEVICE_SESSION_REQUIRED",
  "DEVICE_SECRET_INVALID"
];

const formatDate = (value) => {
  if (!value) {
    return "No registrada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No registrada";
  }

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(date);
};

function Dispositivos({
  onLogout
}) {
  const userRole = getUserRole();
  const tecnico = isTecnico(userRole);
  const terapeuta = isTerapeuta(userRole);
  const currentDeviceId = String(
    getTokenPayload()?.deviceId || ""
  ).toLowerCase();

  const [data, setData] = useState({
    maxDevices: 0,
    activeDevices: 0,
    availableSlots: 0,
    devices: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] =
    useState("");
  const [
    accionPendiente,
    setAccionPendiente
  ] = useState(null);
  const [password, setPassword] =
    useState("");
  const [
    cargandoAccion,
    setCargandoAccion
  ] = useState(false);
  const [mensajeModal, setMensajeModal] =
    useState("");
  const [tipoMensajeModal, setTipoMensajeModal] =
    useState("");
  const mountedRef = useRef(true);
  const actionTimerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
      }
    };
  }, []);

  const handleSessionError = useCallback(
    (result) => {
      if (
        SESSION_ERROR_CODES.includes(
          result?.code
        )
      ) {
        localStorage.removeItem("token");
        onLogout?.();
        return true;
      }

      return false;
    },
    [onLogout]
  );

  const cargarDispositivos = useCallback(
    async ({
      manual = false
    } = {}) => {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result =
          await obtenerDispositivos();

        if (!mountedRef.current) {
          return;
        }

        if (handleSessionError(result)) {
          return;
        }

        if (!result.ok) {
          setMensaje(
            result.message ||
            "No fue posible consultar los dispositivos."
          );
          setTipoMensaje("error");
          return;
        }

        setData({
          maxDevices:
            Number(result.maxDevices) || 0,
          activeDevices:
            Number(result.activeDevices) || 0,
          availableSlots:
            Number(result.availableSlots) || 0,
          devices:
            Array.isArray(result.devices)
              ? result.devices
              : []
        });

        if (manual) {
          setMensaje(
            "Listado actualizado correctamente."
          );
          setTipoMensaje("success");
        }
      } catch (error) {
        console.error(error);

        if (!mountedRef.current) {
          return;
        }

        setMensaje(
          "No fue posible conectar con el servidor."
        );
        setTipoMensaje("error");
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [handleSessionError]
  );

  useEffect(() => {
    cargarDispositivos();
  }, [cargarDispositivos]);

  const cerrarModal = useCallback(() => {
    if (
      cargandoAccion ||
      tipoMensajeModal === "success"
    ) {
      return;
    }

    setAccionPendiente(null);
    setPassword("");
    setMensajeModal("");
    setTipoMensajeModal("");
  }, [cargandoAccion, tipoMensajeModal]);

  useEffect(() => {
    if (!accionPendiente) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();

      cerrarModal();
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [accionPendiente, cerrarModal]);

  const solicitarRevocacion = (
    dispositivo
  ) => {
    setMensaje("");
    setTipoMensaje("");
    setPassword("");
    setMensajeModal("");
    setTipoMensajeModal("");

    setAccionPendiente({
      tipo: "revocar",
      dispositivo
    });
  };

  const solicitarReactivacion = (
    dispositivo
  ) => {
    setMensaje("");
    setTipoMensaje("");
    setPassword("");
    setMensajeModal("");
    setTipoMensajeModal("");

    setAccionPendiente({
      tipo: "reactivar",
      dispositivo
    });
  };

  const confirmarAccion = async () => {
    if (!accionPendiente) {
      return;
    }

    if (
      accionPendiente.tipo === "revocar" &&
      terapeuta &&
      !password
    ) {
      setMensajeModal(
        "Confirma tu contrase\u00F1a para revocar el dispositivo."
      );
      setTipoMensajeModal("error");
      return;
    }

    setCargandoAccion(true);
    setMensajeModal("");
    setTipoMensajeModal("");

    try {
      let result;

      if (
        accionPendiente.tipo === "revocar"
      ) {
        result = await revocarDispositivo({
          id:
            accionPendiente.dispositivo.id,
          password:
            terapeuta
              ? password
              : undefined
        });
      } else {
        result =
          await reactivarDispositivo(
            accionPendiente.dispositivo.id
          );
      }

      if (!mountedRef.current) {
        return;
      }

      if (handleSessionError(result)) {
        return;
      }

      if (!result.ok) {
        setMensajeModal(
          result.message ||
          "No fue posible completar la acci\u00F3n."
        );
        setTipoMensajeModal("error");
        setPassword("");
        return;
      }

      setMensajeModal(
        result.message ||
        "La acci\u00F3n se complet\u00F3 correctamente."
      );
      setTipoMensajeModal("success");

      const currentDeviceRevoked =
        result.currentDeviceRevoked === true;

      setPassword("");

      if (currentDeviceRevoked) {
        actionTimerRef.current = setTimeout(() => {
          localStorage.removeItem("token");
          onLogout?.();
        }, 1400);

        return;
      }

      await cargarDispositivos();

      if (!mountedRef.current) {
        return;
      }

      actionTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        setAccionPendiente(null);
        setMensajeModal("");
        setTipoMensajeModal("");
      }, 900);
    } catch (error) {
      console.error(error);

      if (!mountedRef.current) {
        return;
      }

      setMensajeModal(
        "No fue posible conectar con el servidor."
      );
      setTipoMensajeModal("error");
      setPassword("");
    } finally {
      if (mountedRef.current) {
        setCargandoAccion(false);
      }
    }
  };

  const isCurrentDevice = (
    dispositivo
  ) =>
    Boolean(
      currentDeviceId &&
      String(dispositivo.deviceId || "")
        .toLowerCase() ===
        currentDeviceId
    );

  return (
    <div className="dispositivos-page page-transition">
      <section className="dispositivos-panel">
        <div className="dispositivos-header">
          <div>
            <p className="dispositivos-eyebrow">
              Seguridad de acceso
            </p>

            <h1>
              Dispositivos autorizados
            </h1>

            <p className="dispositivos-description">
              Administra los dispositivos autorizados para ingresar a Kabala Pro. Al revocar uno, su acceso se bloquea inmediatamente.
            </p>
          </div>

          <button
            type="button"
            className="dispositivos-refresh"
            onClick={() =>
              cargarDispositivos({
                manual: true
              })
            }
            disabled={
              loading ||
              refreshing
            }
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "dispositivos-spinning"
                  : ""
              }
            />

            {refreshing
              ? "Actualizando..."
              : "Actualizar"}
          </button>
        </div>

        <div className="dispositivos-summary">
          <article>
            <span>{"L\u00EDmite de dispositivos"}</span>
            <strong>
              {data.maxDevices}
            </strong>
          </article>

          <article>
            <span>
              Dispositivos activos
            </span>
            <strong>
              {data.activeDevices}
            </strong>
          </article>

          <article>
            <span>
              Cupos disponibles
            </span>
            <strong>
              {data.availableSlots}
            </strong>
          </article>
        </div>

        {mensaje && (
          <div
            className={`dispositivos-message ${tipoMensaje}`}
          >
            {mensaje}
          </div>
        )}

        {loading ? (
          <div className="dispositivos-empty">
            <RefreshCw
              size={28}
              className="dispositivos-spinning"
            />
            <span>
              Consultando dispositivos...
            </span>
          </div>
        ) : data.devices.length === 0 ? (
          <div className="dispositivos-empty">
            <MonitorSmartphone size={34} />
            <strong>
              No hay dispositivos registrados
            </strong>
            <span>
              {"El primer dispositivo se registrar\u00E1 al iniciar sesi\u00F3n como angel\u00F3logo o auxiliar."}
            </span>
          </div>
        ) : (
          <div className="dispositivos-list">
            {data.devices.map(
              (dispositivo) => {
                const current =
                  isCurrentDevice(
                    dispositivo
                  );

                return (
                  <article
                    key={dispositivo.id}
                    className={
                      dispositivo.activo
                        ? "dispositivo-card"
                        : "dispositivo-card revoked"
                    }
                  >
                    <div className="dispositivo-icon">
                      <MonitorSmartphone
                        size={28}
                      />
                    </div>

                    <div className="dispositivo-content">
                      <div className="dispositivo-title-row">
                        <div>
                          <h2>
                            {dispositivo.nombre ||
                              "Dispositivo sin nombre"}
                          </h2>

                          <div className="dispositivo-badges">
                            <span
                              className={
                                dispositivo.activo
                                  ? "dispositivo-badge active"
                                  : "dispositivo-badge inactive"
                              }
                            >
                              {dispositivo.activo
                                ? "Activo"
                                : "Revocado"}
                            </span>

                            {current && (
                              <span className="dispositivo-badge current">
                                <ShieldCheck
                                  size={14}
                                />
                                Este dispositivo
                              </span>
                            )}

                            {dispositivo.esPwa && (
                              <span className="dispositivo-badge pwa">
                                PWA
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="dispositivo-actions">
                          {dispositivo.activo ? (
                            <button
                              type="button"
                              className="dispositivo-btn danger"
                              onClick={() =>
                                solicitarRevocacion(
                                  dispositivo
                                )
                              }
                            >
                              <Ban size={17} />
                              Revocar
                            </button>
                          ) : tecnico ? (
                            <button
                              type="button"
                              className="dispositivo-btn success"
                              onClick={() =>
                                solicitarReactivacion(
                                  dispositivo
                                )
                              }
                            >
                              <Power size={17} />
                              Reactivar
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="dispositivo-meta-grid">
                        <div>
                          <span>
                            Plataforma
                          </span>
                          <strong>
                            {dispositivo.plataforma ||
                              "No identificada"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Navegador
                          </span>
                          <strong>
                            {dispositivo.navegador ||
                              "No identificado"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Fecha de registro
                          </span>
                          <strong>
                            {formatDate(
                              dispositivo.fechaRegistro
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>{"\u00DAltimo acceso"}</span>
                          <strong>
                            {formatDate(
                              dispositivo.fechaUltimoAcceso
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>{"\u00DAltimo usuario que ingres\u00F3"}</span>
                          <strong>
                            {dispositivo.ultimoUsuarioCorreo ||
                              "No registrado"}
                          </strong>
                        </div>

                        {tecnico &&
                          dispositivo.fechaRevocacion && (
                            <div>
                              <span>
                                Revocado
                              </span>
                              <strong>
                                {formatDate(
                                  dispositivo.fechaRevocacion
                                )}
                              </strong>
                            </div>
                          )}

                        {tecnico &&
                          dispositivo.fechaReactivacion && (
                            <div>
                              <span>
                                Reactivado
                              </span>
                              <strong>
                                {formatDate(
                                  dispositivo.fechaReactivacion
                                )}
                              </strong>
                            </div>
                          )}
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {accionPendiente && (
        <div
          className="dispositivos-modal-overlay"
          role="presentation"
        >
          <div
            className="dispositivos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dispositivos-modal-title"
          >
            <button
              type="button"
              className="dispositivos-modal-close"
              onClick={cerrarModal}
              disabled={
                cargandoAccion ||
                tipoMensajeModal === "success"
              }
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="dispositivos-modal-icon">
              {accionPendiente.tipo ===
              "revocar" ? (
                <Ban size={30} />
              ) : (
                <Power size={30} />
              )}
            </div>

            <h2 id="dispositivos-modal-title">
              {accionPendiente.tipo ===
              "revocar"
                ? "Revocar dispositivo"
                : "Reactivar dispositivo"}
            </h2>

            <p>
              {accionPendiente.tipo ===
              "revocar"
                ? "El dispositivo perder\u00E1 acceso inmediatamente."
                : "El dispositivo volver\u00E1 a ocupar uno de los cupos disponibles."}
            </p>

            <strong className="dispositivos-modal-device">
              {
                accionPendiente.dispositivo
                  .nombre
              }
            </strong>

            {accionPendiente.tipo ===
              "revocar" &&
              terapeuta && (
                <label className="dispositivos-password">
                  <span>
                    {"Confirma tu contrase\u00F1a"}
                  </span>

                  <div>
                    <KeyRound size={18} />

                    <input
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      autoComplete="current-password"
                      disabled={
                        cargandoAccion ||
                        tipoMensajeModal === "success"
                      }
                      autoFocus
                    />
                  </div>
                </label>
              )}

            {mensajeModal && (
              <div
                className={
                  "dispositivos-modal-message " +
                  tipoMensajeModal
                }
                role={
                  tipoMensajeModal === "error"
                    ? "alert"
                    : "status"
                }
                aria-live="polite"
              >
                {mensajeModal}
              </div>
            )}

            <div className="dispositivos-modal-actions">
              <button
                type="button"
                className="dispositivo-btn secondary"
                onClick={cerrarModal}
                disabled={
                  cargandoAccion ||
                  tipoMensajeModal === "success"
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className={
                  accionPendiente.tipo ===
                  "revocar"
                    ? "dispositivo-btn danger"
                    : "dispositivo-btn success"
                }
                onClick={confirmarAccion}
                disabled={
                  cargandoAccion ||
                  tipoMensajeModal === "success"
                }
              >
                {cargandoAccion
                  ? "Procesando..."
                  : accionPendiente.tipo ===
                    "revocar"
                  ? "Revocar ahora"
                  : "Reactivar ahora"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dispositivos;
