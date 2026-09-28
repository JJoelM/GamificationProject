import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check, X, Award, Sparkles, Eye, EyeOff, AlertTriangle, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBorradoresDocente } from '../../hooks/useMisiones';
import { useEditarMision, useValidarMision, useRechazarMision } from '../../hooks/useMisionMutations';
import EditorPayload from './components/EditorPayload';
import PreviewAlumno from './components/PreviewAlumno';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Modal from '../../components/ui/Modal';
import { playSuccess, playParchment } from '../../utils/audio';

/**
 * ValidadorMision — Editor/Validador HITL completo para una misión específica.
 *
 * Mejoras v2:
 * - Sticky toolbar de acciones con sombra al hacer scroll
 * - Indicador de cambios sin guardar (dirty state)
 * - Panel de vista previa del alumno (toggle)
 * - Feedback contextual de la confianza IA con interpretación
 */
function ValidadorMision() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: borradores, isLoading } = useBorradoresDocente();
  const borrador = borradores?.find((b) => b.misionId === id);

  const { mutate: editar, isPending: isSaving, error: errorEditar, reset: resetEditar } = useEditarMision();
  const { mutate: validar, isPending: isValidating, error: errorValidar, reset: resetValidar } = useValidarMision();
  const { mutate: rechazar, isPending: isRejecting, error: errorRechazar, reset: resetRechazar } = useRechazarMision();

  // Estado local del formulario
  const [narrativa, setNarrativa] = useState('');
  const [recompensaXp, setRecompensaXp] = useState(100);
  const [payload, setPayload] = useState({ preguntas: [] });
  const [isRechazarOpen, setIsRechazarOpen] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  const toolbarRef = useRef(null);

  // Snap del estado original para detectar cambios
  const originalRef = useRef(null);

  // Inicializar estado cuando cargan los datos
  useEffect(() => {
    if (borrador && !originalRef.current) {
      const narrativaInit = borrador.narrativa || '';
      const xpInit = borrador.recompensaXpSugerida || 100;
      let payloadInit = { preguntas: [] };
      try {
        payloadInit = typeof borrador.payloadJson === 'string'
          ? JSON.parse(borrador.payloadJson)
          : (borrador.payloadJson || { preguntas: [] });
      } catch { /* keep default */ }

      setNarrativa(narrativaInit);
      setRecompensaXp(xpInit);
      setPayload(payloadInit);
      originalRef.current = { narrativa: narrativaInit, recompensaXp: xpInit, payload: JSON.stringify(payloadInit) };
    }
  }, [borrador]);

  // Detectar cambios (dirty)
  useEffect(() => {
    if (!originalRef.current) return;
    const curr = { narrativa, recompensaXp, payload: JSON.stringify(payload) };
    const orig = originalRef.current;
    const dirty = curr.narrativa !== orig.narrativa
      || curr.recompensaXp !== orig.recompensaXp
      || curr.payload !== orig.payload;
    setIsDirty(dirty);
  }, [narrativa, recompensaXp, payload]);

  // Sticky toolbar al scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsToolbarSticky(!entry.isIntersecting),
      { threshold: 1, rootMargin: '-1px 0px 0px 0px' }
    );
    const sentinel = document.getElementById('toolbar-sentinel');
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [borrador]);

  const handleGuardarCambios = (e) => {
    e?.preventDefault();
    editar(
      { misionId: id, narrativa, payloadJson: JSON.stringify(payload), recompensaXp },
      {
        onSuccess: () => {
          setSuccessMessage('Cambios guardados correctamente.');
          setIsDirty(false);
          // Actualizar snapshot
          originalRef.current = { narrativa, recompensaXp, payload: JSON.stringify(payload) };
          setTimeout(() => setSuccessMessage(null), 3000);
        },
      }
    );
  };

  const handleAprobarYPublicar = () => {
    // Si hay cambios sin guardar, guardar primero, luego validar
    const doValidar = () => {
      validar(id, {
        onSuccess: () => {
          playSuccess();
          navigate('/docente/misiones/pendientes');
        },
      });
    };

    if (isDirty) {
      editar(
        { misionId: id, narrativa, payloadJson: JSON.stringify(payload), recompensaXp },
        { onSuccess: doValidar }
      );
    } else {
      doValidar();
    }
  };

  const handleConfirmRechazar = (e) => {
    e.preventDefault();
    if (!motivoRechazo.trim()) return;
    rechazar(
      { misionId: id, motivo: motivoRechazo.trim() },
      {
        onSuccess: () => {
          navigate('/docente/misiones/pendientes');
        },
      }
    );
  };

  const handleTogglePreview = () => {
    setShowPreview((p) => !p);
    playParchment();
  };

  const currentError = errorEditar || errorValidar || errorRechazar;
  const dismissError = () => {
    resetEditar(); resetValidar(); resetRechazar();
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Spinner size="lg" label="Cargando misión..." />
      </div>
    );
  }

  if (!borrador) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <ErrorBanner
          error={{
            status: 404,
            isApiError: true,
            title: 'Misión no encontrada o ya validada',
            detail: 'Este borrador no existe o ya fue aprobado/rechazado previamente.',
          }}
          onDismiss={() => navigate('/docente/misiones/pendientes')}
        />
      </div>
    );
  }

  const confianza = borrador.nivelConfianzaIA != null ? Math.round(borrador.nivelConfianzaIA * 100) : null;
  const confianzaLabel = confianza == null ? null
    : confianza >= 85 ? { label: 'Alta confianza IA', variant: 'correcto' }
    : confianza >= 60 ? { label: 'Confianza media — revisa', variant: 'xp' }
    : { label: 'Baja confianza — edición recomendada', variant: 'racha' };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      {/* Sentinel invisible para detectar scroll de la toolbar */}
      <div id="toolbar-sentinel" aria-hidden="true" />

      {/* Toolbar sticky */}
      <div
        ref={toolbarRef}
        className={[
          'sticky top-0 z-30 transition-all duration-200',
          isToolbarSticky
            ? 'bg-[var(--bg-panel)]/95 backdrop-blur-sm shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)] border-b border-[var(--border-muted)] -mx-4 px-4 py-3'
            : 'py-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/docente/misiones/pendientes')}
            className="flex items-center gap-2 text-sm font-display font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Pendientes
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Indicador de cambios sin guardar */}
            <AnimatePresence>
              {isDirty && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 text-xs font-display font-semibold text-[var(--brand-gold)] bg-[color-mix(in_oklch,var(--brand-gold)_12%,var(--bg-panel))] px-2.5 py-1 rounded-full border border-[color-mix(in_oklch,var(--brand-gold)_35%,transparent)]"
                >
                  <AlertTriangle size={12} />
                  Cambios sin guardar
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleTogglePreview}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Cerrar vista alumno' : 'Ver como alumno'}
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setIsRechazarOpen(true)}
              disabled={isSaving || isValidating}
            >
              <X size={14} />
              Rechazar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGuardarCambios}
              loading={isSaving}
              disabled={isValidating || !isDirty}
            >
              <Save size={14} />
              Guardar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAprobarYPublicar}
              loading={isValidating}
              disabled={isSaving}
            >
              <Check size={14} />
              Aprobar y publicar
            </Button>
          </div>
        </div>
      </div>

      {currentError && <ErrorBanner error={currentError} onDismiss={dismissError} />}

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-2 border-[var(--brand-emerald)] text-[var(--brand-emerald)] rounded-[10px_14px_12px_12px] font-semibold text-sm flex items-center gap-2"
          >
            <Check size={16} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout: editor a la izquierda, preview a la derecha (si está activo) */}
      <div className={['grid gap-6 transition-all duration-300', showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'].join(' ')}>
        {/* Columna izquierda — editor */}
        <div className="flex flex-col gap-6">
          {/* Tarjeta de Información General */}
          <Card className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                  Tema Curricular
                </span>
                <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mt-0.5">
                  {borrador.temaCurricular}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {confianzaLabel && (
                  <Badge variant={confianzaLabel.variant}>
                    <Sparkles size={11} className="text-[#FCD34D]" />
                    {confianzaLabel.label} {confianza != null ? `(${confianza}%)` : ''}
                  </Badge>
                )}
              </div>
            </div>

            {/* Narrativa */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 size={13} className="text-[var(--brand-primary)]" />
                Narrativa (visible para el alumno)
              </label>
              <textarea
                rows={4}
                value={narrativa}
                onChange={(e) => setNarrativa(e.target.value)}
                placeholder="Escribe o ajusta la narrativa inmersiva de la misión..."
                className="px-3.5 py-2.5 rounded-[8px_12px_10px_10px] border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] outline-none text-sm font-sans placeholder:text-[var(--text-muted)] resize-y transition-colors"
              />
            </div>

            {/* Recompensa XP */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-[var(--bg-accent)] border border-[var(--border-muted)]">
              <label className="text-xs font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                <Award size={14} className="text-[var(--brand-gold)]" />
                Recompensa XP
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={recompensaXp}
                  onChange={(e) => setRecompensaXp(Number(e.target.value))}
                  className="flex-1 accent-[var(--brand-primary)] cursor-pointer"
                />
                <input
                  type="number"
                  min={10}
                  max={5000}
                  step={10}
                  value={recompensaXp}
                  onChange={(e) => setRecompensaXp(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 rounded-lg border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] font-display font-bold text-sm outline-none focus:border-[var(--brand-primary)] text-center"
                />
                <span className="text-xs font-display font-bold text-[var(--brand-gold)]">XP</span>
              </div>
            </div>
          </Card>

          {/* Editor interactivo de preguntas */}
          <EditorPayload payload={payload} onChange={setPayload} />
        </div>

        {/* Columna derecha — vista previa del alumno (condicional) */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[color-mix(in_oklch,var(--brand-secondary)_10%,var(--bg-panel))] border border-[color-mix(in_oklch,var(--brand-secondary)_25%,transparent)]">
                <Eye size={15} className="text-[var(--brand-secondary)] shrink-0" />
                <p className="text-xs text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Vista previa del alumno.</strong>{' '}
                  Así verá esta misión. Los cambios que hagas en el editor se reflejan aquí en tiempo real.
                </p>
              </div>
              <PreviewAlumno
                narrativa={narrativa}
                payload={payload}
                recompensaXp={recompensaXp}
                temaCurricular={borrador.temaCurricular}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Rechazo */}
      <Modal
        isOpen={isRechazarOpen}
        onClose={() => setIsRechazarOpen(false)}
        title="Rechazar Borrador de Misión"
        size="md"
      >
        <form onSubmit={handleConfirmRechazar} className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Indica el motivo del rechazo. Esto permite mejorar los prompts de la IA con el tiempo.
          </p>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="motivoValidador"
              className="text-xs font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider"
            >
              Motivo de rechazo
            </label>
            <textarea
              id="motivoValidador"
              required
              rows={3}
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: Las preguntas contienen errores conceptuales en la sección de opciones..."
              className="px-3.5 py-2.5 rounded-[8px_12px_10px_10px] border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--brand-crimson)] outline-none text-sm font-sans placeholder:text-[var(--text-muted)] resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[var(--border-muted)]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsRechazarOpen(false)}
              disabled={isRejecting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={isRejecting}
              disabled={!motivoRechazo.trim()}
            >
              Confirmar Rechazo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ValidadorMision;
