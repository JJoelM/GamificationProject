import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork, Eye, EyeOff, Save, CheckCircle2, Clock, Swords,
  Compass, AlertTriangle, ArrowLeft, Plus, Check, Loader2, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useCaminoDocente,
  useDefinirSugeridas,
  useOcultarMision,
  useRepublicarMision,
} from '../../hooks/useCamino';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import { playSuccess, playParchment } from '../../utils/audio';

const TIPO_ICONOS = {
  OpcionMultiple: Compass,
  BatallaDeJefe: Swords,
  LineaTemporal: Clock,
};

const ESTADO_BADGES = {
  Validado: { variant: 'correcto', label: 'Activa en Aula' },
  Pendiente: { variant: 'racha', label: 'Borrador Pendiente' },
  Oculto: { variant: 'incorrecto', label: 'Oculta' },
};

function SecuenciaCurricularDocente() {
  const navigate = useNavigate();
  const { data: caminoData, isLoading, error } = useCaminoDocente();
  const { mutate: definirSugeridas, isPending: isGuardandoSugeridas } = useDefinirSugeridas();
  const { mutate: ocultarMision, isPending: isOcultando } = useOcultarMision();
  const { mutate: republicarMision, isPending: isRepublicando } = useRepublicarMision();

  const nodos = caminoData?.nodos || [];
  const aristas = caminoData?.aristas || [];

  const [nodoSeleccionado, setNodoSeleccionado] = useState(null);
  const [sugeridasSeleccionadas, setSugeridasSeleccionadas] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // Calcular posiciones del Grafo DAG
  const { columnas, posiciones, widthSvg, heightSvg } = useMemo(() => {
    if (!nodos.length) {
      return { columnas: {}, posiciones: {}, widthSvg: 700, heightSvg: 350 };
    }

    const cols = {};
    nodos.forEach((nodo) => {
      const niv = nodo.nivel || 0;
      if (!cols[niv]) cols[niv] = [];
      cols[niv].push(nodo);
    });

    const niveles = Object.keys(cols).map(Number).sort((a, b) => a - b);
    const maxNivel = niveles.length > 0 ? Math.max(...niveles) : 0;
    const maxFilas = Math.max(...Object.values(cols).map((c) => c.length), 1);

    const COL_WIDTH = 290;
    const ROW_HEIGHT = 150;
    const PADDING_X = 60;
    const PADDING_Y = 50;

    const totalWidth = Math.max(800, (maxNivel + 1) * COL_WIDTH + PADDING_X * 2);
    const totalHeight = Math.max(380, maxFilas * ROW_HEIGHT + PADDING_Y * 2);

    const pos = {};

    niveles.forEach((niv) => {
      const colItems = cols[niv];
      const colHeight = colItems.length * ROW_HEIGHT;
      const offsetY = (totalHeight - colHeight) / 2;

      colItems.forEach((nodo, rowIdx) => {
        const x = PADDING_X + niv * COL_WIDTH;
        const y = offsetY + rowIdx * ROW_HEIGHT;
        pos[nodo.misionId] = {
          x,
          y,
          width: 230,
          height: 105,
          anchorRight: { x: x + 230, y: y + 52 },
          anchorLeft: { x: x, y: y + 52 },
        };
      });
    });

    return { columnas: cols, posiciones: pos, widthSvg: totalWidth, heightSvg: totalHeight };
  }, [nodos]);

  // Al abrir edición de un nodo, inicializar las misiones sugeridas actuales (aristas salientes)
  const handleAbrirEdicion = (nodo) => {
    playParchment();
    setNodoSeleccionado(nodo);
    const sugeridasActuales = aristas
      .filter((a) => a.origen === nodo.misionId)
      .map((a) => a.destino);
    setSugeridasSeleccionadas(sugeridasActuales);
  };

  const handleToggleSugerida = (destinoMisionId) => {
    setSugeridasSeleccionadas((prev) => {
      if (prev.includes(destinoMisionId)) {
        return prev.filter((id) => id !== destinoMisionId);
      }
      if (prev.length >= 5) {
        setFeedback({
          tipo: 'error',
          texto: 'Solo puedes sugerir un máximo de 5 misiones consecutivas.',
        });
        return prev;
      }
      return [...prev, destinoMisionId];
    });
  };

  const handleGuardarSugerencias = () => {
    if (!nodoSeleccionado) return;
    definirSugeridas(
      {
        misionId: nodoSeleccionado.misionId,
        misionesSugeridas: sugeridasSeleccionadas,
      },
      {
        onSuccess: () => {
          playSuccess();
          setFeedback({
            tipo: 'exito',
            texto: '¡Secuencia de aprendizaje actualizada exitosamente!',
          });
          setNodoSeleccionado(null);
        },
        onError: (err) => {
          setFeedback({
            tipo: 'error',
            texto: err.mensajeAmigable || 'No se pudo guardar la secuencia.',
          });
        },
      }
    );
  };

  const handleOcultar = () => {
    if (!nodoSeleccionado) return;
    ocultarMision(nodoSeleccionado.misionId, {
      onSuccess: () => {
        playSuccess();
        setFeedback({
          tipo: 'exito',
          texto: 'Misión oculta para los alumnos.',
        });
        setNodoSeleccionado(null);
      },
      onError: (err) => {
        setFeedback({
          tipo: 'error',
          texto: err.mensajeAmigable || 'No se pudo ocultar la misión.',
        });
      },
    });
  };

  const handleRepublicar = () => {
    if (!nodoSeleccionado) return;
    republicarMision(nodoSeleccionado.misionId, {
      onSuccess: () => {
        playSuccess();
        setFeedback({
          tipo: 'exito',
          texto: 'Misión republicada y visible para los alumnos.',
        });
        setNodoSeleccionado(null);
      },
      onError: (err) => {
        setFeedback({
          tipo: 'error',
          texto: err.mensajeAmigable || 'No se pudo republicar la misión.',
        });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <button
              onClick={() => navigate('/docente/dashboard')}
              className="flex items-center gap-1 text-sm font-display font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <GitFork className="text-[var(--brand-primary)]" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Secuencia Curricular del Aula
            </h1>
            {nodos.length > 0 && (
              <Badge variant="nivel">{nodos.length} misiones</Badge>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Organiza las rutas sugeridas de aprendizaje conectando misiones. Haz clic en cualquier nodo para configurar sus sugerencias o alternar visibilidad.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={[
            'p-3.5 rounded-xl border-2 flex items-center justify-between text-xs font-semibold gap-3 shadow-sm',
            feedback.tipo === 'exito'
              ? 'bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-[var(--brand-emerald)] text-[var(--brand-emerald)]'
              : 'bg-[color-mix(in_oklch,var(--brand-crimson)_15%,var(--bg-panel))] border-[var(--brand-crimson)] text-[var(--brand-crimson)]',
          ].join(' ')}
        >
          <div className="flex items-center gap-2">
            {feedback.tipo === 'exito' ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.texto}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {error && <ErrorBanner error={error} />}

      {isLoading ? (
        <div className="py-24 flex justify-center items-center">
          <Spinner size="lg" label="Cargando el árbol de secuencia curricular..." />
        </div>
      ) : !nodos.length ? (
        <Card className="p-12 text-center flex flex-col items-center gap-3">
          <GitFork size={36} className="text-[var(--text-muted)]" />
          <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
            Sin misiones en esta aula
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md">
            Crea o valida misiones desde el Inbox de Borradores para empezar a trazar la ruta de aprendizaje.
          </p>
          <Button variant="primary" onClick={() => navigate('/docente/dashboard')}>
            Ir al Dashboard Docente
          </Button>
        </Card>
      ) : (
        /* ── Lienzo SVG del Grafo Curricular ── */
        <div className="relative w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-panel)] shadow-[var(--shadow-c)] overflow-x-auto">
          <div style={{ minWidth: widthSvg, minHeight: heightSvg }} className="relative select-none p-4">
            <svg
              width={widthSvg}
              height={heightSvg}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <defs>
                <linearGradient id="grad-docente-arista" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>

              {/* Trazado de aristas sugeridas */}
              {aristas.map((arista, idx) => {
                const posOrigen = posiciones[arista.origen];
                const posDestino = posiciones[arista.destino];

                if (!posOrigen || !posDestino) return null;

                const x1 = posOrigen.anchorRight.x;
                const y1 = posOrigen.anchorRight.y;
                const x2 = posDestino.anchorLeft.x;
                const y2 = posDestino.anchorLeft.y;

                const dx = Math.max(40, (x2 - x1) / 2);
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                return (
                  <g key={`arista-docente-${idx}`}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="4"
                      strokeOpacity="0.15"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#grad-docente-arista)"
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodos del Grafo */}
            {nodos.map((nodo) => {
              const pos = posiciones[nodo.misionId];
              if (!pos) return null;

              const Icono = TIPO_ICONOS[nodo.tipoPlantilla] || Compass;
              const estadoBadge = ESTADO_BADGES[nodo.estado] || { variant: 'info', label: nodo.estado };

              return (
                <motion.div
                  key={nodo.misionId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAbrirEdicion(nodo)}
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    width: pos.width,
                    height: pos.height,
                  }}
                  className={[
                    'rounded-[14px_18px_14px_16px] p-3.5 border-2 flex flex-col justify-between cursor-pointer transition-all duration-150 select-none',
                    nodo.estado === 'Oculto'
                      ? 'border-dashed border-[var(--border-muted)] bg-[var(--bg-muted)] opacity-60'
                      : 'border-[var(--border)] bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border)] bg-[var(--bg-accent)] text-[var(--brand-primary)]">
                        <Icono size={13} />
                      </div>
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-secondary)] truncate">
                        {nodo.tipoPlantilla}
                      </span>
                    </div>

                    <Badge variant={estadoBadge.variant} className="text-[9px] px-1.5 py-0">
                      {estadoBadge.label}
                    </Badge>
                  </div>

                  <h4 className="font-display font-bold text-xs text-[var(--text-primary)] line-clamp-2 leading-tight">
                    {nodo.temaCurricular || 'Misión sin título'}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] font-display font-semibold text-[var(--text-secondary)] pt-1 border-t border-[var(--border-muted)]">
                    <span>Nivel {nodo.nivel}</span>
                    <span className="text-[var(--brand-primary)] font-bold">Editar ruta →</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modal de Edición Rápida de Secuencia Curricular ── */}
      {nodoSeleccionado && (
        <Modal
          isOpen={Boolean(nodoSeleccionado)}
          onClose={() => setNodoSeleccionado(null)}
          title={`Configurar Ruta: ${nodoSeleccionado.temaCurricular}`}
          size="md"
        >
          <div className="flex flex-col gap-5 select-none">
            {/* Cabecera y Estado */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-muted)]">
              <div>
                <span className="text-xs font-display font-bold text-[var(--text-secondary)] block">
                  Estado actual de la misión:
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {nodoSeleccionado.estado === 'Validado'
                    ? 'Visible y activa para alumnos'
                    : nodoSeleccionado.estado === 'Oculto'
                      ? 'Oculta (no visible en tablero alumno)'
                      : nodoSeleccionado.estado}
                </span>
              </div>

              {/* Botón Ocultar / Republicar */}
              {nodoSeleccionado.estado === 'Validado' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleOcultar}
                  disabled={isOcultando}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold"
                >
                  <EyeOff size={14} />
                  <span>Ocultar Misión</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleRepublicar}
                  disabled={isRepublicando}
                  className="text-xs font-bold"
                >
                  <Eye size={14} />
                  <span>Hacer Visible</span>
                </Button>
              )}
            </div>

            {/* Selector de Misiones Sugeridas Consecutivas */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-display font-bold text-[var(--text-primary)] block">
                    Misiones Sugeridas a Continuación (Hasta 5):
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Selecciona qué misiones se desbloquean o resaltan tras completar esta.
                  </span>
                </div>
                <Badge variant={sugeridasSeleccionadas.length >= 5 ? 'racha' : 'nivel'}>
                  {sugeridasSeleccionadas.length} / 5 seleccionadas
                </Badge>
              </div>

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {nodos
                  .filter((n) => n.misionId !== nodoSeleccionado.misionId)
                  .map((otroNodo) => {
                    const isChecked = sugeridasSeleccionadas.includes(otroNodo.misionId);
                    const disabled = !isChecked && sugeridasSeleccionadas.length >= 5;

                    return (
                      <label
                        key={otroNodo.misionId}
                        className={[
                          'flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all',
                          isChecked
                            ? 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_10%,var(--bg-panel))] font-bold shadow-xs'
                            : disabled
                              ? 'opacity-40 cursor-not-allowed border-[var(--border-muted)] bg-[var(--bg-muted)]'
                              : 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--border)]',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={disabled}
                          onChange={() => handleToggleSugerida(otroNodo.misionId)}
                          className="rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="block truncate text-[var(--text-primary)]">
                            {otroNodo.temaCurricular}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)]">
                            {otroNodo.tipoPlantilla} • Nivel {otroNodo.nivel}
                          </span>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-muted)]">
              <Button
                variant="ghost"
                onClick={() => setNodoSeleccionado(null)}
                className="text-xs"
              >
                Cancelar
              </Button>

              <Button
                variant="primary"
                onClick={handleGuardarSugerencias}
                disabled={isGuardandoSugeridas}
                className="text-xs font-bold"
              >
                {isGuardandoSugeridas ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>Guardar Secuencia</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SecuenciaCurricularDocente;
