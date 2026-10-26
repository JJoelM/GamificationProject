import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Compass, Map, ArrowLeft, Sparkles, RefreshCw, CheckCircle2,
  LayoutGrid, GitFork, HelpCircle, Clock, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMisionesActivas } from '../../hooks/useMisiones';
import useSessionStore from '../../store/useSessionStore';
import TarjetaMision from './components/TarjetaMision';
import ResolverMision from './components/ResolverMision';
import CaminoMisiones from './components/CaminoMisiones';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ArtFrame from '../../components/ui/ArtFrame';
import { playParchment } from '../../utils/audio';

/**
 * TableroMisiones v4 — Soporta toggle dual:
 * - Vista Cartas (grid con filtros pedagógicos Todas/Nuevas/Repaso + filtro por Tipo de Minijuego)
 * - Mapa de Aventura (Grafo Acíclico Dirigido DAG con Bézier SVG)
 */
function TableroMisiones() {
  const navigate = useNavigate();
  const { data: misiones, isLoading, error } = useMisionesActivas();
  const [misionSeleccionada, setMisionSeleccionada] = useState(null);
  const [modoVista, setModoVista] = useState('cartas'); // 'cartas' | 'mapa'
  const [tabFiltro, setTabFiltro] = useState('todas'); // 'todas' | 'nuevas' | 'repaso'
  const [tipoFiltro, setTipoFiltro] = useState('todos'); // 'todos' | 'OpcionMultiple' | 'BatallaDeJefe' | 'LineaTemporal'

  const misionesResueltas = useSessionStore((s) => s.misionesResueltas) || {};

  const { todas, nuevas, repaso } = useMemo(() => {
    if (!misiones) return { todas: [], nuevas: [], repaso: [] };
    const n = [];
    const r = [];

    misiones.forEach((m) => {
      if (misionesResueltas[m.misionId]?.completada) {
        r.push(m);
      } else {
        n.push(m);
      }
    });

    return { todas: misiones, nuevas: n, repaso: r };
  }, [misiones, misionesResueltas]);

  const misionesPorEstado = tabFiltro === 'nuevas' ? nuevas : tabFiltro === 'repaso' ? repaso : todas;

  const misionesAMostrar = useMemo(() => {
    if (tipoFiltro === 'todos') return misionesPorEstado;
    return misionesPorEstado.filter((m) => (m.tipoPlantilla || 'OpcionMultiple') === tipoFiltro);
  }, [misionesPorEstado, tipoFiltro]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* ── Header con Toggle de Modo Vista ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <button
              onClick={() => navigate('/alumno/dashboard')}
              className="flex items-center gap-1 text-sm font-display font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <Compass className="text-[var(--brand-primary)]" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Tablero de Misiones
            </h1>
            {todas.length > 0 && (
              <Badge variant="nivel">{todas.length} activas</Badge>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Elegí libremente qué desafío resolver. Explora el mapa de aventura o el listado de cartas.
          </p>
        </div>

        {/* Selector de Modo Vista (Cartas vs Mapa de Aventura) */}
        <div className="flex p-1 rounded-2xl bg-[var(--bg-panel)] border-2 border-[var(--border)] gap-1 shadow-[2px_2px_0px_var(--border)] shrink-0">
          <button
            type="button"
            onClick={() => {
              playParchment();
              setModoVista('cartas');
            }}
            className={[
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer',
              modoVista === 'cartas'
                ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
            ].join(' ')}
          >
            <LayoutGrid size={14} />
            <span>Vista Cartas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playParchment();
              setModoVista('mapa');
            }}
            className={[
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer',
              modoVista === 'mapa'
                ? 'bg-[var(--brand-violet)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--brand-violet)] hover:bg-[var(--bg-accent)]',
            ].join(' ')}
          >
            <GitFork size={14} />
            <span>Mapa de Aventura</span>
          </button>
        </div>
      </div>

      {error && <ErrorBanner error={error} />}

      {/* Contenido principal según modo de vista */}
      {modoVista === 'mapa' ? (
        <CaminoMisiones
          misionesActivas={todas}
          onSelectMision={setMisionSeleccionada}
        />
      ) : (
        <>
          {/* ── Tabs de Filtro de Misiones (Todas / Nuevas / Repaso + Formato) ── */}
          {!isLoading && todas.length > 0 && (
            <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-[var(--bg-panel)] border-2 border-[var(--border)] shadow-[var(--shadow-c)]">
              {/* Fila 1: Filtro de Progreso Pedagógico */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-muted)] gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playParchment();
                      setTabFiltro('todas');
                    }}
                    className={[
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer',
                      tabFiltro === 'todas'
                        ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)]',
                    ].join(' ')}
                  >
                    <Compass size={13} />
                    Todas ({todas.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playParchment();
                      setTabFiltro('nuevas');
                    }}
                    className={[
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer',
                      tabFiltro === 'nuevas'
                        ? 'bg-[var(--brand-violet)] text-white shadow-sm'
                        : 'text-[var(--brand-violet)] hover:bg-[color-mix(in_oklch,var(--brand-violet)_10%,transparent)]',
                    ].join(' ')}
                  >
                    <Sparkles size={13} />
                    Nuevas ({nuevas.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playParchment();
                      setTabFiltro('repaso');
                    }}
                    className={[
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer',
                      tabFiltro === 'repaso'
                        ? 'bg-[var(--brand-sky)] text-white shadow-sm'
                        : 'text-[var(--brand-sky)] hover:bg-[color-mix(in_oklch,var(--brand-sky)_10%,transparent)]',
                    ].join(' ')}
                  >
                    <RefreshCw size={13} />
                    De Repaso ({repaso.length})
                  </button>
                </div>

                <div className="flex items-center gap-2 px-3 text-xs font-display text-[var(--text-muted)]">
                  <span>
                    {nuevas.length > 0 ? (
                      <strong className="text-[var(--brand-violet)] font-bold">✨ {nuevas.length} {nuevas.length === 1 ? 'misión nueva' : 'misiones nuevas'}</strong>
                    ) : (
                      <span className="text-[var(--brand-emerald)] font-bold">¡Estás al día con tus misiones nuevas!</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Fila 2: Filtro Secundario por Tipo de Minijuego */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-muted)]">
                <span className="text-[11px] font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-1">
                  Formato:
                </span>
                {[
                  { id: 'todos', label: 'Todos', Icon: Layers, color: 'text-[var(--text-primary)]' },
                  { id: 'OpcionMultiple', label: 'Quizzes', Icon: HelpCircle, color: 'text-[var(--brand-primary)]' },
                  { id: 'BatallaDeJefe', label: 'Batallas de Jefe', Icon: Swords, color: 'text-[var(--brand-crimson)]' },
                  { id: 'LineaTemporal', label: 'Líneas Temporales', Icon: Clock, color: 'text-[var(--brand-violet)]' },
                ].map((f) => {
                  const isSelected = tipoFiltro === f.id;
                  const Icon = f.Icon;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        playParchment();
                        setTipoFiltro(f.id);
                      }}
                      className={[
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-display font-semibold transition-all cursor-pointer',
                        isSelected
                          ? 'bg-[var(--bg-accent)] text-[var(--text-primary)] border border-[var(--border-hover)] shadow-xs font-bold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
                      ].join(' ')}
                    >
                      <Icon size={12} className={isSelected ? f.color : 'text-[var(--text-muted)]'} />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-24 flex justify-center items-center">
              <Spinner size="lg" label="Consultando el tablero de misiones..." />
            </div>
          ) : todas.length === 0 ? (
            /* Estado vacío narrativo */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <Card className="flex flex-col items-center justify-center text-center p-12 gap-5">
                <ArtFrame
                  label="Ilustración: Mapa de aventuras en espera"
                  shape="scroll"
                  aspectRatio="16/9"
                  className="w-full max-w-xs"
                />
                <div className="max-w-md">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Map size={20} className="text-[var(--brand-gold)]" />
                    <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
                      Tablero en espera
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Tu docente aún no ha publicado misiones activas para tu aula. Cuando lo haga, aparecerán aquí como tarjetas de desafío.
                    ¡Volvé pronto para descubrir nuevas aventuras!
                  </p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/alumno/dashboard')}>
                  <ArrowLeft size={14} />
                  Volver al Dashboard
                </Button>
              </Card>
            </motion.div>
          ) : misionesAMostrar.length === 0 ? (
            /* Estado vacío de filtro */
            <Card className="p-8 text-center flex flex-col items-center gap-3">
              <p className="text-sm text-[var(--text-secondary)]">
                {tipoFiltro !== 'todos'
                  ? `No hay misiones de este formato en la categoría seleccionada (${tabFiltro === 'nuevas' ? 'Nuevas' : tabFiltro === 'repaso' ? 'De Repaso' : 'Todas'}).`
                  : tabFiltro === 'nuevas'
                  ? '¡Felicitaciones! Has completado todas las misiones del aula. Puedes practicar en modo repaso para consolidar.'
                  : 'Aún no tienes misiones completadas para repasar. ¡Comienza resolviendo las misiones nuevas!'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {tipoFiltro !== 'todos' && (
                  <Button variant="ghost" size="sm" onClick={() => setTipoFiltro('todos')}>
                    Ver todos los formatos
                  </Button>
                )}
                {tabFiltro !== 'todas' && (
                  <Button variant="ghost" size="sm" onClick={() => setTabFiltro('todas')}>
                    Ver todas las misiones
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {misionesAMostrar.map((mision, i) => (
                  <TarjetaMision
                    key={mision.misionId}
                    mision={mision}
                    onResolver={setMisionSeleccionada}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Modal de resolución */}
      <ResolverMision
        mision={misionSeleccionada}
        isOpen={Boolean(misionSeleccionada)}
        onClose={() => setMisionSeleccionada(null)}
      />
    </div>
  );
}

export default TableroMisiones;
