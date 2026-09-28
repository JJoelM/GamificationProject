import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Sparkles, Plus, PartyPopper, Swords } from 'lucide-react';

import { useBorradoresDocente } from '../../hooks/useMisiones';
import { useValidarMision, useRechazarMision } from '../../hooks/useMisionMutations';
import TarjetaBorrador from './components/TarjetaBorrador';
import FormGenerarMision from './components/FormGenerarMision';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Modal from '../../components/ui/Modal';

/**
 * InboxBorradores v2 — Bandeja de entrada de misiones HITL para el Docente.
 *
 * Mejoras:
 * - Estado vacío enriquecido con animación celebratoria
 * - Ordenado por confianza IA ascendente (las menos confiables primero, necesitan más atención)
 * - Header con contador vivo
 */
function InboxBorradores() {
  const { data: borradores, isLoading, error, refetch } = useBorradoresDocente();
  const { mutate: validar, isPending: isValidating, error: errorValidar, reset: resetValidar } = useValidarMision();
  const { mutate: rechazar, isPending: isRejecting, error: errorRechazar, reset: resetRechazar } = useRechazarMision();

  const [isGenerarOpen, setIsGenerarOpen] = useState(false);
  const [misionARechazar, setMisionARechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [actionMisionId, setActionMisionId] = useState(null);

  const handleAprobar = (misionId) => {
    setActionMisionId(misionId);
    validar(misionId, {
      onSettled: () => setActionMisionId(null),
    });
  };

  const handleOpenRechazar = (borrador) => {
    setMisionARechazar(borrador);
    setMotivoRechazo('');
  };

  const handleConfirmRechazar = (e) => {
    e.preventDefault();
    if (!misionARechazar || !motivoRechazo.trim()) return;

    setActionMisionId(misionARechazar.misionId);
    rechazar(
      { misionId: misionARechazar.misionId, motivo: motivoRechazo.trim() },
      {
        onSuccess: () => {
          setMisionARechazar(null);
          setMotivoRechazo('');
        },
        onSettled: () => setActionMisionId(null),
      }
    );
  };

  const currentError = error || errorValidar || errorRechazar;
  const dismissError = () => {
    resetValidar();
    resetRechazar();
  };

  // Ordenar: menor confianza IA primero (necesitan más revisión)
  const borradoresOrdenados = borradores
    ? [...borradores].sort((a, b) => (a.nivelConfianzaIA ?? 1) - (b.nivelConfianzaIA ?? 1))
    : [];

  const cantTotal = borradoresOrdenados.length;
  const cantBajaConfianza = borradoresOrdenados.filter((b) => (b.nivelConfianzaIA ?? 1) < 0.7).length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Inbox className="text-[var(--brand-primary)]" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Inbox de Misiones
            </h1>
            {cantTotal > 0 && (
              <motion.span
                key={cantTotal}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2 py-0.5 rounded-full bg-[var(--brand-primary)] text-white text-xs font-display font-bold"
              >
                {cantTotal}
              </motion.span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Revisión Humana (HITL): Evaluá, editá o descartá las propuestas de la IA antes de publicarlas.
          </p>
          {cantBajaConfianza > 0 && (
            <p className="text-xs text-[var(--brand-gold)] font-display font-semibold mt-1">
              ⚠ {cantBajaConfianza} {cantBajaConfianza === 1 ? 'misión tiene' : 'misiones tienen'} baja confianza IA — revisión recomendada
            </p>
          )}
        </div>

        <Button variant="primary" onClick={() => setIsGenerarOpen(true)} className="whitespace-nowrap">
          <Sparkles size={16} className="text-[#FCD34D]" />
          Generar con IA
        </Button>
      </div>

      {currentError && <ErrorBanner error={currentError} onDismiss={dismissError} />}

      {/* Contenido principal */}
      {isLoading ? (
        <div className="py-24 flex justify-center items-center">
          <Spinner size="lg" label="Cargando borradores pendientes..." />
        </div>
      ) : borradoresOrdenados.length === 0 ? (
        /* ── Estado vacío enriquecido ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="flex flex-col items-center justify-center text-center p-12 gap-5 rounded-[16px_20px_18px_18px] border-2 border-dashed border-[var(--border)] bg-[var(--bg-panel)]"
        >
          {/* Ícono celebratorio */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-2 border-[var(--brand-emerald)] flex items-center justify-center">
              <PartyPopper size={34} className="text-[var(--brand-emerald)]" />
            </div>
            {/* Destellos */}
            {['top-0 right-0', 'bottom-1 left-0', 'top-2 left-[-4px]'].map((pos, i) => (
              <motion.div
                key={i}
                className={`absolute ${pos} w-3 h-3 rounded-full bg-[var(--brand-gold)]`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </div>

          <div className="max-w-sm">
            <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">
              ¡Bandeja al día! 🎉
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              No hay misiones pendientes de revisión. Tu criterio pedagógico está al día. Podés pedirle a la IA que genere un nuevo borrador a partir de material educativo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" onClick={() => setIsGenerarOpen(true)}>
              <Plus size={16} />
              Crear nueva misión
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {borradoresOrdenados.map((borrador) => (
              <TarjetaBorrador
                key={borrador.misionId}
                borrador={borrador}
                onAprobar={handleAprobar}
                onRechazar={handleOpenRechazar}
                isApproving={isValidating && actionMisionId === borrador.misionId}
                isRejecting={isRejecting && actionMisionId === borrador.misionId}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal de Generar con IA */}
      <FormGenerarMision
        isOpen={isGenerarOpen}
        onClose={() => setIsGenerarOpen(false)}
      />

      {/* Modal de Rechazo */}
      <Modal
        isOpen={Boolean(misionARechazar)}
        onClose={() => setMisionARechazar(null)}
        title="Rechazar Borrador de Misión"
        size="md"
      >
        <form onSubmit={handleConfirmRechazar} className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Indicá el motivo del rechazo. Esto le permite al sistema mejorar los prompts de generación con el tiempo.
          </p>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="motivo"
              className="text-xs font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider"
            >
              Motivo de rechazo
            </label>
            <textarea
              id="motivo"
              required
              rows={3}
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: El contenido no corresponde al nivel pedagógico de este grado..."
              className="px-3.5 py-2.5 rounded-[8px_12px_10px_10px] border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--brand-crimson)] outline-none text-sm font-sans placeholder:text-[var(--text-muted)] resize-y"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[var(--border-muted)]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMisionARechazar(null)}
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

export default InboxBorradores;
