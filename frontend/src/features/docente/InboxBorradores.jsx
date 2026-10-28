import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Sparkles, Plus, PartyPopper, CheckCircle2, EyeOff, BookOpen, Clock, AlertTriangle, Download
} from 'lucide-react';

import { useBorradoresDocente } from '../../hooks/useMisiones';
import { useValidarMision, useRechazarMision } from '../../hooks/useMisionMutations';
import { useOcultarMision, useRepublicarMision } from '../../hooks/useCamino';
import TarjetaBorrador from './components/TarjetaBorrador';
import FormGenerarMision from './components/FormGenerarMision';
import ModalPreviewAlumno from './components/ModalPreviewAlumno';
import ModalImportarMisiones from './components/ModalImportarMisiones';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Modal from '../../components/ui/Modal';
import { playParchment, playSuccess } from '../../utils/audio';

/**
 * InboxBorradores v4 — Bandeja de entrada de misiones y gestión curricular para Docentes.
 * - Subpestañas claras: Por Validar (Borradores IA) | Validadas (Activas en Aula) | Ocultas
 * - Misiones filtradas por el aula activa seleccionada
 * - Importación de misiones entre aulas propias con remapeo de DAG
 * - Previsualizador interactivo de misiones como alumno
 * - Acciones de ciclo de vida: Validar, Rechazar, Editar, Ocultar, Republicar
 */
function InboxBorradores() {
  const { data: borradores, isLoading, error, refetch } = useBorradoresDocente();
  const { mutate: validar, isPending: isValidating, error: errorValidar, reset: resetValidar } = useValidarMision();
  const { mutate: rechazar, isPending: isRejecting, error: errorRechazar, reset: resetRechazar } = useRechazarMision();
  const { mutate: ocultar, isPending: isHiding, error: errorOcultar, reset: resetOcultar } = useOcultarMision();
  const { mutate: republicar, isPending: isRepublicating, error: errorRepublicar, reset: resetRepublicar } = useRepublicarMision();

  const [tabActiva, setTabActiva] = useState('Pendiente'); // 'Pendiente' | 'Validado' | 'Oculto'
  const [isGenerarOpen, setIsGenerarOpen] = useState(false);
  const [isImportarOpen, setIsImportarOpen] = useState(false);
  const [misionARechazar, setMisionARechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [actionMisionId, setActionMisionId] = useState(null);
  const [misionParaPreview, setMisionParaPreview] = useState(null);

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

  const handleOcultar = (misionId) => {
    setActionMisionId(misionId);
    ocultar(misionId, {
      onSettled: () => setActionMisionId(null),
    });
  };

  const handleRepublicar = (misionId) => {
    setActionMisionId(misionId);
    republicar(misionId, {
      onSettled: () => setActionMisionId(null),
    });
  };

  const handleCambiarTab = (tab) => {
    playParchment();
    setTabActiva(tab);
  };

  const currentError = error || errorValidar || errorRechazar || errorOcultar || errorRepublicar;
  const dismissError = () => {
    resetValidar();
    resetRechazar();
    resetOcultar();
    resetRepublicar();
  };

  const todos = borradores || [];
  const pendientes = todos.filter((b) => (b.estadoValidacion || 'Pendiente') === 'Pendiente');
  const validadas = todos.filter((b) => b.estadoValidacion === 'Validado');
  const ocultas = todos.filter((b) => b.estadoValidacion === 'Oculto');

  const parseConfianza = (val) => {
    if (val == null) return 100;
    return val <= 1 ? Math.round(val * 100) : Math.round(val);
  };

  const listaFiltrada = tabActiva === 'Pendiente'
    ? [...pendientes].sort((a, b) => parseConfianza(a.nivelConfianzaIA) - parseConfianza(b.nivelConfianzaIA))
    : tabActiva === 'Validado'
    ? validadas
    : ocultas;

  const cantBajaConfianza = pendientes.filter((b) => parseConfianza(b.nivelConfianzaIA) < 70).length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <Inbox className="text-[var(--brand-primary)] shrink-0" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Inbox de Misiones
            </h1>
            <Badge variant="info">
              {todos.length} {todos.length === 1 ? 'misión en total' : 'misiones en total'}
            </Badge>
            {pendientes.length > 0 ? (
              <Badge variant="racha" glow>
                {pendientes.length} {pendientes.length === 1 ? 'por validar' : 'por validar'}
              </Badge>
            ) : (
              <Badge variant="correcto">Al día</Badge>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {pendientes.length > 0
              ? `Tenés ${todos.length} ${todos.length === 1 ? 'misión registrada' : 'misiones registradas'} en este aula (${pendientes.length} ${pendientes.length === 1 ? 'borrador pendiente de validación' : 'borradores pendientes de validación'}).`
              : `Tenés ${todos.length} ${todos.length === 1 ? 'misión registrada' : 'misiones registradas'} en este aula. Todas las misiones están al día.`}
          </p>
          {tabActiva === 'Pendiente' && cantBajaConfianza > 0 && (
            <p className="text-xs text-[var(--brand-gold)] font-display font-semibold mt-1">
              ⚠ {cantBajaConfianza} {cantBajaConfianza === 1 ? 'misión tiene' : 'misiones tienen'} baja confianza IA — revisión recomendada
            </p>
          )}
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2.5 self-start sm:self-auto shrink-0">
          <Button
            variant="ghost"
            onClick={() => {
              playParchment();
              setIsImportarOpen(true);
            }}
            className="w-full sm:w-auto whitespace-nowrap justify-center"
          >
            <Download size={16} />
            <span>Importar Misiones</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              playParchment();
              setIsGenerarOpen(true);
            }}
            className="w-full sm:w-auto whitespace-nowrap justify-center"
          >
            <Sparkles size={16} className="text-[#FCD34D]" />
            <span>Generar con IA</span>
          </Button>
        </div>
      </div>

      {currentError && <ErrorBanner error={currentError} onDismiss={dismissError} />}

      {/* Selector de subpestañas */}
      <div className="flex items-center gap-2 border-b-2 border-[var(--border-muted)] pb-2 overflow-x-auto">
        <button
          onClick={() => handleCambiarTab('Pendiente')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tabActiva === 'Pendiente'
              ? 'bg-[var(--brand-primary)] text-white shadow-[0_2px_8px_rgba(230,81,0,0.3)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
          }`}
        >
          <Sparkles size={16} className={tabActiva === 'Pendiente' ? 'text-amber-300' : 'text-amber-500'} />
          <span>Por Validar (IA)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              tabActiva === 'Pendiente'
                ? 'bg-black/30 text-white font-extrabold'
                : 'bg-[var(--bg-panel)] text-[var(--text-muted)] border border-[var(--border-muted)]'
            }`}
          >
            {pendientes.length}
          </span>
        </button>

        <button
          onClick={() => handleCambiarTab('Validado')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tabActiva === 'Validado'
              ? 'bg-[var(--brand-emerald)] text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Validadas en Aula</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              tabActiva === 'Validado'
                ? 'bg-black/30 text-white font-extrabold'
                : 'bg-[var(--bg-panel)] text-[var(--text-muted)] border border-[var(--border-muted)]'
            }`}
          >
            {validadas.length}
          </span>
        </button>

        <button
          onClick={() => handleCambiarTab('Oculto')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tabActiva === 'Oculto'
              ? 'bg-slate-700 text-white shadow-[0_2px_8px_rgba(71,85,105,0.3)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
          }`}
        >
          <EyeOff size={16} />
          <span>Ocultas</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              tabActiva === 'Oculto'
                ? 'bg-black/30 text-white font-extrabold'
                : 'bg-[var(--bg-panel)] text-[var(--text-muted)] border border-[var(--border-muted)]'
            }`}
          >
            {ocultas.length}
          </span>
        </button>
      </div>

      {/* Contenido principal */}
      {isLoading ? (
        <div className="py-24 flex justify-center items-center">
          <Spinner size="lg" label="Cargando misiones..." />
        </div>
      ) : listaFiltrada.length === 0 ? (
        /* Estados vacíos según pestaña */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center p-12 text-center rounded-[24px_32px_26px_30px] border-2 border-dashed border-[var(--border-muted)] bg-[var(--bg-panel)] mt-2"
        >
          {tabActiva === 'Pendiente' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] flex items-center justify-center mb-4 text-[var(--brand-emerald)]">
                <PartyPopper size={32} />
              </div>

              <div className="max-w-sm">
                <h3 className="font-display font-bold text-xl text-[var(--text-primary)] mb-2">
                  ¡Bandeja al día! 🎉
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  No hay misiones pendientes de revisión en este aula. Podés pedirle a la IA que genere un nuevo borrador o importar misiones ya validadas de tus otras aulas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="ghost" onClick={() => setIsImportarOpen(true)}>
                  <Download size={16} />
                  Importar misiones
                </Button>
                <Button variant="primary" onClick={() => setIsGenerarOpen(true)}>
                  <Plus size={16} />
                  Crear nueva misión
                </Button>
              </div>
            </>
          ) : tabActiva === 'Validado' ? (
            <div className="max-w-sm py-6">
              <CheckCircle2 size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">
                No hay misiones activas en esta sección
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Aprobá borradores pendientes para publicarlos en el aula y ponerlos a disposición de los alumnos.
              </p>
            </div>
          ) : (
            <div className="max-w-sm py-6">
              <EyeOff size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-1">
                No hay misiones ocultas
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Las misiones que ocultes temporalmente de tus alumnos aparecerán aquí para que puedas republicarlas cuando desees.
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {listaFiltrada.map((borrador) => (
              <TarjetaBorrador
                key={borrador.misionId}
                borrador={borrador}
                onAprobar={handleAprobar}
                onRechazar={handleOpenRechazar}
                onOcultar={handleOcultar}
                onRepublicar={handleRepublicar}
                onPrevisualizar={(m) => setMisionParaPreview(m)}
                isApproving={isValidating && actionMisionId === borrador.misionId}
                isRejecting={isRejecting && actionMisionId === borrador.misionId}
                isHiding={isHiding && actionMisionId === borrador.misionId}
                isRepublicating={isRepublicating && actionMisionId === borrador.misionId}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal interactivo de Previsualización como Alumno */}
      <ModalPreviewAlumno
        mision={misionParaPreview}
        isOpen={Boolean(misionParaPreview)}
        onClose={() => setMisionParaPreview(null)}
      />

      {/* Modal de Generar con IA */}
      <FormGenerarMision
        isOpen={isGenerarOpen}
        onClose={() => setIsGenerarOpen(false)}
      />

      {/* Modal de Importar Misiones entre Aulas */}
      <ModalImportarMisiones
        isOpen={isImportarOpen}
        onClose={() => setIsImportarOpen(false)}
        onImportada={() => {
          setTabActiva('Pendiente');
          refetch();
        }}
      />

      {/* Modal de Rechazo */}
      <Modal
        isOpen={Boolean(misionARechazar)}
        onClose={() => setMisionARechazar(null)}
        title="Rechazar Borrador de Misión"
        size="md"
      >
        <form onSubmit={handleConfirmRechazar} className="flex flex-col gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Al rechazar este borrador, dejará de figurar en tu bandeja y quedará registrado el motivo en el Ledger de auditoría HITL.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo" className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Motivo del rechazo
            </label>
            <textarea
              id="motivo"
              rows={3}
              required
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
