import { useState, useMemo } from 'react';
import {
  Download, Search, Sparkles, CheckSquare, Square,
  HelpCircle, Swords, Clock, AlertTriangle, GitFork,
  CheckCircle2, School, ArrowRight, Loader2
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import { useMisionesImportables, useImportarMisiones } from '../../../hooks/useMisiones';
import useSessionStore from '../../../store/useSessionStore';
import { playSuccess, playParchment } from '../../../utils/audio';

const PLANTILLA_ICONS = {
  OpcionMultiple: HelpCircle,
  BatallaDeJefe: Swords,
  LineaTemporal: Clock,
};

const PLANTILLA_LABELS = {
  OpcionMultiple: 'Quiz',
  BatallaDeJefe: 'Batalla de Jefe',
  LineaTemporal: 'Línea Temporal',
};

export default function ModalImportarMisiones({ isOpen, onClose, onImportada }) {
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const { data: misionesImportables, isLoading, error, refetch } = useMisionesImportables(aulaActivaId);
  const { mutate: importarMisiones, isPending: isImportando, error: errorImportar } = useImportarMisiones();

  const [busqueda, setBusqueda] = useState('');
  const [filtroAula, setFiltroAula] = useState('todas');
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [exitoInfo, setExitoInfo] = useState(null);

  // Aulas disponibles para filtrar
  const aulasDisponibles = useMemo(() => {
    if (!misionesImportables) return [];
    const map = new Map();
    misionesImportables.forEach((m) => {
      if (!map.has(m.aulaOrigenId)) {
        map.set(m.aulaOrigenId, m.aulaOrigenNombre);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [misionesImportables]);

  // Filtrado de misiones
  const misionesFiltradas = useMemo(() => {
    if (!misionesImportables) return [];
    let res = misionesImportables;

    if (filtroAula !== 'todas') {
      res = res.filter((m) => m.aulaOrigenId === filtroAula);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      res = res.filter(
        (m) =>
          m.temaCurricular?.toLowerCase().includes(q) ||
          m.narrativa?.toLowerCase().includes(q) ||
          m.aulaOrigenNombre?.toLowerCase().includes(q)
      );
    }

    return res;
  }, [misionesImportables, filtroAula, busqueda]);

  // Cálculo de conexiones del DAG que se conservarán entre las seleccionadas
  const conexionesPreservadas = useMemo(() => {
    if (seleccionadas.size <= 1 || !misionesImportables) return 0;
    let cant = 0;
    misionesImportables.forEach((m) => {
      if (seleccionadas.has(m.misionId) && m.misionesSugeridasIds?.length > 0) {
        m.misionesSugeridasIds.forEach((destId) => {
          if (seleccionadas.has(destId)) cant++;
        });
      }
    });
    return cant;
  }, [seleccionadas, misionesImportables]);

  const toggleSeleccion = (misionId) => {
    playParchment();
    setSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(misionId)) next.delete(misionId);
      else next.add(misionId);
      return next;
    });
  };

  const toggleTodas = () => {
    playParchment();
    if (seleccionadas.size === misionesFiltradas.length && misionesFiltradas.length > 0) {
      setSeleccionadas(new Set());
    } else {
      setSeleccionadas(new Set(misionesFiltradas.map((m) => m.misionId)));
    }
  };

  const handleImportar = () => {
    if (seleccionadas.size === 0 || !aulaActivaId) return;

    importarMisiones(
      {
        aulaDestinoId: aulaActivaId,
        misionesIds: Array.from(seleccionadas),
      },
      {
        onSuccess: (resultado) => {
          playSuccess();
          setExitoInfo(resultado);
          setSeleccionadas(new Set());
          setTimeout(() => {
            setExitoInfo(null);
            onImportada?.(resultado);
            onClose();
          }, 1500);
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Misiones entre Aulas"
      size="lg"
    >
      <div className="flex flex-col gap-4 max-h-[75vh]">
        {/* Descripción didáctica */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-muted)] flex items-start gap-3 text-xs leading-relaxed text-[var(--text-secondary)]">
          <Download size={20} className="text-[var(--brand-primary)] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-display font-bold text-[var(--text-primary)]">
              Copia independiente con remapeo de Camino (DAG)
            </span>
            <p>
              Las misiones importadas ingresan al aula activa como <strong>borradores por validar</strong> para respetar la supervisión pedagógica. Las conexiones curriculares entre las misiones que importes juntas se remapearán automáticamente hacia los nuevos identificadores.
            </p>
          </div>
        </div>

        {error && <ErrorBanner error={error} onRetry={() => refetch()} />}
        {errorImportar && <ErrorBanner error={errorImportar} />}

        {exitoInfo && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-display font-bold flex items-center gap-2 animate-scale-in">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>
              ¡Se importaron exitosamente {exitoInfo.totalImportadas} {exitoInfo.totalImportadas === 1 ? 'misión' : 'misiones'} ({exitoInfo.conexionesRemapeadas} conexiones del camino remapeadas)!
            </span>
          </div>
        )}

        {/* ── Filtros y Buscador ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Selector de Aula Origen */}
          {aulasDisponibles.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-muted)] overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setFiltroAula('todas')}
                className={[
                  'px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer whitespace-nowrap',
                  filtroAula === 'todas'
                    ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                Todas las Aulas
              </button>
              {aulasDisponibles.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setFiltroAula(a.id)}
                  className={[
                    'px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
                    filtroAula === a.id
                      ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  <School size={12} />
                  <span>{a.nombre}</span>
                </button>
              ))}
            </div>
          )}

          {/* Buscador */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por tema o narrativa..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        {/* Barra de Selección Masiva & Info de DAG */}
        <div className="flex items-center justify-between px-1 text-xs">
          <button
            type="button"
            onClick={toggleTodas}
            disabled={misionesFiltradas.length === 0}
            className="flex items-center gap-1.5 font-display font-bold text-[var(--brand-primary)] hover:underline cursor-pointer disabled:opacity-50"
          >
            {seleccionadas.size === misionesFiltradas.length && misionesFiltradas.length > 0 ? (
              <CheckSquare size={14} />
            ) : (
              <Square size={14} />
            )}
            <span>
              {seleccionadas.size === misionesFiltradas.length && misionesFiltradas.length > 0
                ? 'Deseleccionar todas'
                : `Seleccionar todas (${misionesFiltradas.length})`}
            </span>
          </button>

          {conexionesPreservadas > 0 && (
            <div className="flex items-center gap-1.5 font-display font-bold text-[var(--brand-violet)] text-[11px] bg-[var(--brand-violet)]/10 px-2 py-0.5 rounded-lg border border-[var(--brand-violet)]/20">
              <GitFork size={13} />
              <span>{conexionesPreservadas} conexiones DAG se enlazarán</span>
            </div>
          )}
        </div>

        {/* ── Lista de Misiones Disponibles ── */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[220px]">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Spinner size="md" />
              <span className="text-xs text-[var(--text-muted)] font-display">
                Buscando misiones en tus otras aulas...
              </span>
            </div>
          ) : misionesFiltradas.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-[var(--border-muted)] bg-[var(--bg-base)] gap-2">
              <School size={28} className="text-[var(--text-muted)]" />
              <p className="font-display font-bold text-sm text-[var(--text-primary)]">
                No hay misiones disponibles para importar
              </p>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                {misionesImportables?.length === 0
                  ? 'Aún no posees misiones validadas en otras aulas. Podés generar misiones nuevas en esta aula con el botón de IA.'
                  : 'Ninguna misión coincide con los filtros aplicados.'}
              </p>
            </div>
          ) : (
            misionesFiltradas.map((m) => {
              const isSelected = seleccionadas.has(m.misionId);
              const IconPlantilla = PLANTILLA_ICONS[m.tipoPlantilla] || HelpCircle;
              const plantillaLabel = PLANTILLA_LABELS[m.tipoPlantilla] || m.tipoPlantilla;

              return (
                <div
                  key={m.misionId}
                  onClick={() => toggleSeleccion(m.misionId)}
                  className={[
                    'p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none',
                    isSelected
                      ? 'bg-[color-mix(in_oklch,var(--brand-primary)_8%,var(--bg-panel))] border-[var(--brand-primary)] shadow-xs'
                      : 'bg-[var(--bg-panel)] border-[var(--border-muted)] hover:border-[var(--border)]',
                  ].join(' ')}
                >
                  {/* Checkbox */}
                  <div className="mt-0.5 shrink-0 text-[var(--brand-primary)]">
                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-[var(--text-muted)]" />}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                        {m.temaCurricular}
                      </span>
                      <Badge variant="info" className="text-[10px]">
                        <IconPlantilla size={11} className="mr-1 inline" />
                        {plantillaLabel}
                      </Badge>
                      <Badge variant="xp" className="text-[10px]">
                        +{m.recompensaXpSugerida} XP
                      </Badge>
                      {m.yaImportada && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                          <AlertTriangle size={11} />
                          Ya importada en esta aula
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {m.narrativa}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-[var(--brand-primary)]">
                        <School size={11} />
                        Origen: {m.aulaOrigenNombre}
                      </span>
                      {m.misionesSugeridasIds?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <GitFork size={11} />
                          {m.misionesSugeridasIds.length} conexión(es) saliente(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer / Acciones ── */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-muted)]">
          <span className="text-xs font-display font-semibold text-[var(--text-muted)]">
            {seleccionadas.size} de {misionesFiltradas.length} seleccionadas
          </span>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isImportando}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleImportar}
              disabled={seleccionadas.size === 0 || isImportando}
            >
              {isImportando ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>
                    Importar {seleccionadas.size > 0 ? `(${seleccionadas.size})` : ''}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
