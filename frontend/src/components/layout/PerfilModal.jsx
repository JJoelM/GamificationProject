import { useState } from 'react';
import {
  User, KeyRound, AlertTriangle, Check, Loader2,
  Shield, Calendar, Mail, ShieldAlert, AlertCircle
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import PasswordStrengthIndicator, { isPasswordSecure } from '../ui/PasswordStrengthIndicator';
import {
  useMisDatos,
  useActualizarMisDatos,
  useCambiarPassword,
  useEliminarMiCuenta
} from '../../hooks/usePerfilUsuario';
import { playSuccess, playParchment } from '../../utils/audio';

function FormularioDatosPersonales({ misDatos, onGuardar, isGuardando, errorDatos }) {
  const [nombreCompleto, setNombreCompleto] = useState(misDatos?.nombreCompleto || '');
  const [aceptaInvestigacion, setAceptaInvestigacion] = useState(Boolean(misDatos?.aceptaUsoInvestigacion));
  const [modalRevocarOpen, setModalRevocarOpen] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreCompleto.trim()) return;

    onGuardar(
      {
        nombreCompleto: nombreCompleto.trim(),
        aceptaUsoInvestigacion: aceptaInvestigacion,
      },
      {
        onSuccess: () => {
          playSuccess();
          setExito(true);
          setTimeout(() => setExito(false), 3000);
        },
      }
    );
  };

  const handleCheckboxChange = (e) => {
    // Si estaba activado y el usuario desmarca, mostrar advertencia previa
    if (!e.target.checked && aceptaInvestigacion) {
      setModalRevocarOpen(true);
    } else {
      setAceptaInvestigacion(e.target.checked);
    }
  };

  const confirmarRevocacion = () => {
    setAceptaInvestigacion(false);
    setModalRevocarOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorDatos && (
          <div className="p-3 rounded-xl bg-[var(--brand-crimson)]/10 border border-[var(--brand-crimson)]/30 text-[var(--brand-crimson)] text-xs font-display font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorDatos.detail || errorDatos.title || errorDatos.message || 'Error al actualizar los datos.'}</span>
          </div>
        )}
        {exito && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-display font-bold flex items-center gap-2">
            <Check size={16} />
            <span>¡Tus datos han sido actualizados con éxito!</span>
          </div>
        )}

        {/* Resumen de Cuenta (Read-only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mail size={16} className="text-[var(--text-muted)] shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-display font-bold uppercase text-[var(--text-muted)]">Email</span>
              <span className="text-xs text-[var(--text-primary)] font-semibold truncate" title={misDatos.email}>{misDatos.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 min-w-0">
            <Shield size={16} className="text-[var(--text-muted)] shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-display font-bold uppercase text-[var(--text-muted)]">Rol y Estado</span>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <Badge variant="info">{misDatos.rol}</Badge>
                <Badge variant={misDatos.estadoCuenta === 'Activa' ? 'correcto' : 'xp'}>
                  {misDatos.estadoCuenta}
                </Badge>
              </div>
            </div>
          </div>

          {misDatos.fechaNacimiento && (
            <div className="flex items-center gap-2.5 sm:col-span-2 min-w-0">
              <Calendar size={16} className="text-[var(--text-muted)] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-display font-bold uppercase text-[var(--text-muted)]">Fecha de Nacimiento</span>
                <span className="text-xs text-[var(--text-primary)] font-semibold">{misDatos.fechaNacimiento}</span>
              </div>
            </div>
          )}
        </div>

        {/* Campo Editable: Nombre Completo */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombreCompleto" className="text-xs font-display font-bold text-[var(--text-primary)]">
            Nombre Completo
          </label>
          <input
            id="nombreCompleto"
            type="text"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border-2 border-[var(--border-muted)] bg-[var(--bg-panel)] text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
          />
        </div>

        {/* Consentimiento de Investigación con advertencia */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-base)]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aceptaInvestigacion}
              onChange={handleCheckboxChange}
              className="mt-0.5 w-4 h-4 rounded text-[var(--brand-primary)] border-[var(--border-muted)] focus:ring-[var(--brand-primary)] shrink-0"
            />
            <div className="flex flex-col text-xs leading-relaxed min-w-0">
              <span className="font-display font-bold text-[var(--text-primary)]">
                Consentimiento para Investigación Académica (UNNE)
              </span>
              <span className="text-[var(--text-secondary)] text-[11px] mt-0.5">
                Autorizo el uso anónimo de mis estadísticas de aprendizaje para fines de investigación en el Proyecto Final de Carrera.
              </span>
            </div>
          </label>

          {!aceptaInvestigacion && (
            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              <span>Consentimiento revocado. Tus métricas no se incluirán en el estudio de investigación del PFC.</span>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isGuardando || !nombreCompleto.trim()}
            className="w-full sm:w-auto justify-center"
          >
            {isGuardando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span>{isGuardando ? 'Guardando...' : 'Guardar Cambios'}</span>
          </Button>
        </div>
      </form>

      {/* Modal de Advertencia Previa para Revocar Consentimiento */}
      <Modal
        isOpen={modalRevocarOpen}
        onClose={() => setModalRevocarOpen(false)}
        title="Revocar Consentimiento"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)]">
                ¿Estás seguro de que deseas retirar tu consentimiento?
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Al desmarcar esta opción, tus métricas de resolución y progreso dejarán de formar parte de los análisis estadísticos del Proyecto Final de Carrera de la UNNE. Podrás volver a otorgar tu consentimiento en cualquier momento.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-[var(--border-muted)]">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalRevocarOpen(false)}
              className="w-full sm:w-auto justify-center"
            >
              Mantener Consentimiento
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmarRevocacion}
              className="w-full sm:w-auto justify-center"
            >
              Confirmar Revocación
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function PerfilModal({ isOpen, onClose }) {
  const { data: misDatos, isLoading, isError, error, refetch } = useMisDatos();
  const { mutate: actualizarDatos, isPending: isGuardandoDatos, error: errorDatos } = useActualizarMisDatos();
  const { mutate: cambiarPassword, isPending: isCambiandoPass, error: errorPass } = useCambiarPassword();
  const { mutate: eliminarCuenta, isPending: isEliminando, error: errorEliminar } = useEliminarMiCuenta();

  const [tabActiva, setTabActiva] = useState('datos'); // 'datos' | 'seguridad' | 'peligro'

  // Formulario de contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errorLocalPass, setErrorLocalPass] = useState(null);
  const [exitoPass, setExitoPass] = useState(false);

  // Confirmación de eliminación
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const handleCambiarPassword = (e) => {
    e.preventDefault();
    setErrorLocalPass(null);

    if (!isPasswordSecure(passwordNueva)) {
      setErrorLocalPass('La nueva contraseña no cumple los requisitos de seguridad (mín. 8 caracteres, mayúscula, minúscula, número y símbolo).');
      return;
    }

    if (passwordNueva !== confirmarPassword) {
      setErrorLocalPass('Las contraseñas no coinciden.');
      return;
    }

    cambiarPassword(
      { passwordActual, passwordNueva },
      {
        onSuccess: () => {
          playSuccess();
          setExitoPass(true);
          setPasswordActual('');
          setPasswordNueva('');
          setConfirmarPassword('');
          setTimeout(() => setExitoPass(false), 3000);
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mi Perfil & Configuración"
      size="lg"
    >
      <div className="flex flex-col gap-5">
        {/* ── Tabs de Navegación Responsive ── */}
        <div className="flex border-b-2 border-[var(--border-muted)] gap-1 sm:gap-2 pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => { playParchment(); setTabActiva('datos'); }}
            className={[
              'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-t-xl text-xs font-display font-bold transition-all cursor-pointer border-b-2 -mb-[6px] shrink-0 whitespace-nowrap',
              tabActiva === 'datos'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            <User size={15} />
            <span>Datos Personales</span>
          </button>

          <button
            type="button"
            onClick={() => { playParchment(); setTabActiva('seguridad'); }}
            className={[
              'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-t-xl text-xs font-display font-bold transition-all cursor-pointer border-b-2 -mb-[6px] shrink-0 whitespace-nowrap',
              tabActiva === 'seguridad'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            <KeyRound size={15} />
            <span>Seguridad & Clave</span>
          </button>

          <button
            type="button"
            onClick={() => { playParchment(); setTabActiva('peligro'); }}
            className={[
              'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-t-xl text-xs font-display font-bold transition-all cursor-pointer border-b-2 -mb-[6px] shrink-0 whitespace-nowrap sm:ml-auto',
              tabActiva === 'peligro'
                ? 'border-[var(--brand-crimson)] text-[var(--brand-crimson)] bg-[var(--brand-crimson)]/10'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--brand-crimson)]',
            ].join(' ')}
          >
            <AlertTriangle size={15} />
            <span>Baja</span>
          </button>
        </div>

        {/* ── Contenido según Tab ── */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Spinner size="md" />
            <span className="text-xs text-[var(--text-secondary)] font-display">
              Cargando información de cuenta...
            </span>
          </div>
        )}

        {isError && (
          <ErrorBanner
            error={error}
            title="Error al consultar los datos"
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && misDatos && (
          <>
            {/* ── TAB 1: DATOS PERSONALES ── */}
            {tabActiva === 'datos' && (
              <FormularioDatosPersonales
                key={misDatos.usuarioId}
                misDatos={misDatos}
                onGuardar={actualizarDatos}
                isGuardando={isGuardandoDatos}
                errorDatos={errorDatos}
              />
            )}

            {/* ── TAB 2: SEGURIDAD & CONTRASEÑA ── */}
            {tabActiva === 'seguridad' && (
              <form onSubmit={handleCambiarPassword} className="flex flex-col gap-4">
                {errorPass && (
                  <div className="p-3 rounded-xl bg-[var(--brand-crimson)]/10 border border-[var(--brand-crimson)]/30 text-[var(--brand-crimson)] text-xs font-display font-semibold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorPass.detail || errorPass.title || errorPass.message || 'La contraseña actual no es correcta.'}</span>
                  </div>
                )}
                {errorLocalPass && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-display font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{errorLocalPass}</span>
                  </div>
                )}
                {exitoPass && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-display font-bold flex items-center gap-2">
                    <Check size={16} />
                    <span>¡Contraseña actualizada correctamente!</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="passActual" className="text-xs font-display font-bold text-[var(--text-primary)]">
                    Contraseña Actual
                  </label>
                  <input
                    id="passActual"
                    type="password"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border-2 border-[var(--border-muted)] bg-[var(--bg-panel)] text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="passNueva" className="text-xs font-display font-bold text-[var(--text-primary)]">
                    Nueva Contraseña
                  </label>
                  <input
                    id="passNueva"
                    type="password"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    required
                    placeholder="Mín. 8 caracteres, mayúscula, minúscula, número y símbolo"
                    className="w-full px-3 py-2 rounded-xl border-2 border-[var(--border-muted)] bg-[var(--bg-panel)] text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
                  />
                  <PasswordStrengthIndicator password={passwordNueva} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="passConfirm" className="text-xs font-display font-bold text-[var(--text-primary)]">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="passConfirm"
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border-2 border-[var(--border-muted)] bg-[var(--bg-panel)] text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none transition-colors"
                  />
                  {confirmarPassword && (
                    <span className={`text-[11px] font-semibold ${passwordNueva === confirmarPassword ? 'text-[var(--brand-emerald)]' : 'text-[var(--brand-crimson)]'}`}>
                      {passwordNueva === confirmarPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                    </span>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isCambiandoPass || !passwordActual || !passwordNueva}
                    className="w-full sm:w-auto justify-center"
                  >
                    {isCambiandoPass ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                    <span>{isCambiandoPass ? 'Actualizando...' : 'Cambiar Contraseña'}</span>
                  </Button>
                </div>
              </form>
            )}

            {/* ── TAB 3: ZONA DE PELIGRO (ELIMINAR CUENTA) ── */}
            {tabActiva === 'peligro' && (
              <div className="flex flex-col gap-4">
                {errorEliminar && (
                  <div className="p-3 rounded-xl bg-[var(--brand-crimson)]/10 border border-[var(--brand-crimson)]/30 text-[var(--brand-crimson)] text-xs font-display font-semibold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorEliminar.detail || errorEliminar.title || errorEliminar.message || 'No se pudo dar de baja la cuenta.'}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl border-2 border-[var(--brand-crimson)]/30 bg-[var(--brand-crimson)]/5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[var(--brand-crimson)] font-display font-bold text-sm">
                    <AlertTriangle size={18} />
                    <span>Eliminación y Anonimización de Cuenta</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Al solicitar la baja, tu cuenta será disociada y tus datos personales serán anonimizados de acuerdo a las políticas de privacidad. Tu progreso registrado en misiones pasará a un estado anónimo para conservar la integridad del historial académico.
                  </p>
                  <p className="text-xs text-[var(--brand-crimson)] font-display font-semibold mt-1">
                    ⚠️ Si tienes el rol Docente y posees aulas activas con alumnos matriculados, el sistema no permitirá la baja automática para no dejar cursos sin tutor.
                  </p>
                </div>

                {!confirmarEliminar ? (
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmarEliminar(true)}
                    className="self-start text-xs text-[var(--brand-crimson)] hover:bg-[var(--brand-crimson)]/10 border border-[var(--brand-crimson)]/40 w-full sm:w-auto justify-center"
                  >
                    Quiero dar de baja mi cuenta
                  </Button>
                ) : (
                  <div className="p-4 rounded-xl border-2 border-[var(--brand-crimson)] bg-[var(--bg-base)] flex flex-col gap-3">
                    <span className="text-xs font-display font-bold text-[var(--brand-crimson)]">
                      ¿Estás totalmente seguro? Esta acción es irreversible.
                    </span>
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmarEliminar(false)}
                        className="w-full sm:w-auto justify-center"
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarCuenta()}
                        disabled={isEliminando}
                        className="w-full sm:w-auto justify-center"
                      >
                        {isEliminando ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                        <span>{isEliminando ? 'Eliminando...' : 'Sí, dar de baja definitivamente'}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
