import { useState, useEffect, useMemo } from 'react';
import { Reorder, motion, useReducedMotion } from 'framer-motion';
import { GitCommit, Clock, AlertCircle, Target, CheckCircle2, XCircle, ArrowRight, Award, Zap } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import AnimatedCounter from '../../../components/ui/AnimatedCounter';
import XpParticleBurst from '../../../components/ui/XpParticleBurst';
import { useResolverMisionOrdenTemporal } from '../../../hooks/useMisionMutations';
import { playParchment, playChime, playSuccess } from '../../../utils/audio';

/**
 * LineaTemporal — Experiencia interactiva de reconstrucción temporal y análisis de causa raíz.
 *
 * Cumplimiento estricto de AGENTS_SKILL_animation-library-boundary.MD:
 * - 100% Framer Motion (Reorder.Group / Reorder.Item / layout / useReducedMotion).
 * - Cero Anime.js en este componente para evitar colisiones de transform.
 * - Animación de diff de layout tras calificar: reordena los ítems según ordenCorrecto
 *   devuelto por el backend y Framer Motion anima la migración con prop layout.
 * - Señales estáticas (colores, íconos, textos) para que el movimiento no sea la única fuente de información.
 */

// Función utilitaria para mezclar aleatoriamente el array inicial (Fisher-Yates)
function mezclarEventos(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function LineaTemporal({ mision, isOpen, onClose }) {
  const { mutate: resolver, isPending, data: resultadoData, error, reset } = useResolverMisionOrdenTemporal();
  const shouldReduceMotion = useReducedMotion();

  // Parseo defensivo y memoizado del payload sanitizado
  const { estadoErroneo, eventosIniciales } = useMemo(() => {
    let desc = 'Se detectó una falla en la secuencia de eventos.';
    let items = [];

    try {
      const parsed = typeof mision?.payloadJson === 'string'
        ? JSON.parse(mision.payloadJson)
        : mision?.payloadJson;

      if (parsed) {
        desc = parsed.estadoErroneoDescripcion || desc;
        items = Array.isArray(parsed.eventosDesordenados) ? parsed.eventosDesordenados : [];
      }
    } catch {
      /* payload malformado */
    }

    return { estadoErroneo: desc, eventosIniciales: items };
  }, [mision?.payloadJson]);

  // Estado local
  const [eventos, setEventos] = useState(() => mezclarEventos(eventosIniciales));
  const [culpableElegido, setCulpableElegido] = useState(null);
  const [fase, setFase] = useState('intro'); // 'intro' | 'reordenar' | 'resultado'
  const [showBurst, setShowBurst] = useState(false);
  const [ordenInicialEstudiante, setOrdenInicialEstudiante] = useState([]);

  // Sincronizar eventos si cambia la misión
  useEffect(() => {
    setEventos(mezclarEventos(eventosIniciales));
    setCulpableElegido(null);
    setFase('intro');
    setShowBurst(false);
    setOrdenInicialEstudiante([]);
    reset();
  }, [mision?.misionId, eventosIniciales, reset]);

  const handleClose = () => {
    reset();
    setFase('intro');
    setCulpableElegido(null);
    setShowBurst(false);
    onClose();
  };

  const handleComenzar = () => {
    playChime();
    setFase('reordenar');
  };

  const handleSelectCulpable = (id) => {
    playParchment();
    setCulpableElegido(id);
  };

  // Enviar resolución al backend
  const handleEnviar = () => {
    if (!mision?.misionId || !culpableElegido) return;
    playChime();

    const ordenPropuesto = eventos.map((e) => e.id);
    setOrdenInicialEstudiante(ordenPropuesto);

    resolver(
      {
        misionId: mision.misionId,
        ordenPropuesto,
        eventoCulpableElegido: culpableElegido,
        eventosOriginales: eventos,
      },
      {
        onSuccess: (data) => {
          playSuccess();
          setShowBurst(true);
          setFase('resultado');

          // Animación de diff de layout con Framer Motion:
          // Reordenamos el array de estado al ordenCorrecto que entregó el backend.
          if (Array.isArray(data.ordenCorrecto) && data.ordenCorrecto.length > 0) {
            setTimeout(() => {
              setEventos((prevEventos) => {
                const ordenReal = [...prevEventos].sort((a, b) => {
                  const idxA = data.ordenCorrecto.indexOf(a.id);
                  const idxB = data.ordenCorrecto.indexOf(b.id);
                  return idxA - idxB;
                });
                return ordenReal;
              });
            }, shouldReduceMotion ? 0 : 350);
          }
        },
      }
    );
  };

  const totalEventos = eventos.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? undefined : handleClose}
      title={
        fase === 'resultado'
          ? 'Resultado de la Línea Temporal'
          : 'Línea Temporal Forense'
      }
      size="lg"
    >
      <div className="flex flex-col gap-5">
        {showBurst && <XpParticleBurst onComplete={() => setShowBurst(false)} />}

        {/* ── Banner de Anomalía Detectada ── */}
        <div className="p-4 rounded-[12px_16px_14px_14px] bg-[color-mix(in_oklch,var(--brand-crimson)_10%,var(--bg-panel))] border-2 border-[var(--brand-crimson)] shadow-[3px_3px_0px_var(--border)] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-crimson)] text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={18} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-display font-black tracking-widest uppercase text-[var(--brand-crimson)] block">
              Anomalía Forense
            </span>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
              {estadoErroneo}
            </p>
          </div>
        </div>

        {error && <ErrorBanner error={error} onDismiss={reset} />}

        {/* ── 1. Fase: INTRODUCCIÓN NARRATIVA ── */}
        {fase === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <Card className="p-5 border-2 border-[var(--border)] bg-[var(--bg-accent)] flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[var(--brand-primary)]">
                <Clock size={18} className="text-[var(--brand-violet)]" />
                <span className="text-xs font-display font-bold uppercase tracking-wider">
                  Misión de Reconstrucción Causal
                </span>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                "{mision?.narrativa || 'Los eventos registrados en este proceso ocurrieron en una secuencia desordenada que provocó la anomalía. Tu labor consiste en arrastrar cada evento a su orden cronológico correcto y señalar cuál causó el fallo.'}"
              </p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <span>Arrastrá verticalmente las tarjetas para ordenar la secuencia cronológica.</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <span>Tocá sobre la tarjeta que representa la causa raíz que desató la anomalía.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={handleClose}>
                Volver al Tablero
              </Button>
              <Button variant="primary" onClick={handleComenzar}>
                <GitCommit size={15} />
                Comenzar Reconstrucción
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── 2. Fase: REORDENAR Y ACUSAR AL CULPABLE ── */}
        {fase === 'reordenar' && (
          <div className="flex flex-col gap-5">
            {/* Indicador de pasos */}
            <div className="flex items-center justify-between text-xs font-display text-[var(--text-muted)] border-b border-[var(--border-muted)] pb-2">
              <span>Arrastrá para ordenar ({totalEventos} eventos)</span>
              <span>
                {culpableElegido ? (
                  <span className="text-amber-500 font-bold flex items-center gap-1">
                    <Target size={13} /> Causa raíz seleccionada
                  </span>
                ) : (
                  <span className="text-[var(--brand-crimson)]">Seleccioná la causa raíz</span>
                )}
              </span>
            </div>

            {/* Lista Reordenable con Framer Motion (100% Framer Motion) */}
            <Reorder.Group
              axis="y"
              values={eventos}
              onReorder={setEventos}
              className="flex flex-col gap-3"
            >
              {eventos.map((evento, index) => {
                const esCulpable = culpableElegido === evento.id;

                return (
                  <Reorder.Item
                    key={evento.id}
                    value={evento}
                    layout={!shouldReduceMotion}
                    transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
                    whileDrag={
                      shouldReduceMotion
                        ? {}
                        : { scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 50 }
                    }
                    className={[
                      'group relative flex items-start gap-3.5 p-4 rounded-[12px_16px_14px_14px] border-2 transition-all cursor-grab active:cursor-grabbing select-none',
                      'bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)]',
                      esCulpable
                        ? 'border-amber-500 ring-2 ring-amber-400 bg-[color-mix(in_oklch,var(--color-amber-500,#f59e0b)_12%,var(--bg-panel))]'
                        : 'border-[var(--border)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
                    ].join(' ')}
                  >
                    {/* Badge de orden cronológico */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-white text-xs font-display font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] opacity-60">
                        Paso
                      </span>
                    </div>

                    {/* Descripción del evento */}
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                        {evento.descripcion}
                      </p>
                    </div>

                    {/* Botón para acusar / marcar culpable */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCulpable(evento.id);
                      }}
                      className={[
                        'px-2.5 py-1.5 rounded-lg text-xs font-display font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer',
                        esCulpable
                          ? 'bg-amber-500 text-black shadow-sm ring-1 ring-amber-600'
                          : 'bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-amber-500 hover:bg-[color-mix(in_oklch,var(--color-amber-500,#f59e0b)_15%,var(--bg-muted))]',
                      ].join(' ')}
                      title="Marcar este evento como la causa raíz del error"
                    >
                      <Target size={14} className={esCulpable ? 'animate-spin' : ''} />
                      <span>{esCulpable ? 'Causante' : 'Acusar'}</span>
                    </button>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

            {/* Acciones */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-muted)]">
              <Button
                variant="ghost"
                onClick={() => setEventos(mezclarEventos(eventosIniciales))}
                disabled={isPending}
              >
                Reordenar al Azar
              </Button>

              <Button
                variant="primary"
                onClick={handleEnviar}
                loading={isPending}
                disabled={!culpableElegido}
                className="font-bold"
              >
                <GitCommit size={15} />
                Verificar Línea Temporal
              </Button>
            </div>
          </div>
        )}

        {/* ── 3. Fase: RESULTADO & ANIMACIÓN DE DIFF DE LAYOUT ── */}
        {fase === 'resultado' && resultadoData && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Banner de Calificación */}
            <Card
              variant={resultadoData.porcentajeCorrecto >= 60 ? 'emerald' : 'default'}
              className="p-5 flex flex-col items-center text-center gap-3 relative overflow-hidden"
            >
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Badge
                  variant={
                    resultadoData.porcentajeCorrecto === 100
                      ? 'racha'
                      : resultadoData.porcentajeCorrecto >= 60
                        ? 'correcto'
                        : 'pendiente'
                  }
                  glow={resultadoData.porcentajeCorrecto === 100}
                >
                  {resultadoData.porcentajeCorrecto === 100 ? '¡Secuencia Perfecta!' : 'Línea Temporal Calificada'}
                </Badge>
                {resultadoData.culpableIdentificadoCorrectamente ? (
                  <Badge variant="correcto">
                    <CheckCircle2 size={12} /> Causa Raíz Identificada
                  </Badge>
                ) : (
                  <Badge variant="incorrecto">
                    <XCircle size={12} /> Causa Raíz No Coincide
                  </Badge>
                )}
              </div>

              <div>
                <span className="font-display font-black text-5xl text-[var(--text-primary)] block">
                  <AnimatedCounter value={resultadoData.porcentajeCorrecto} suffix="%" duration={1200} />
                </span>
                <p className="text-xs font-display text-[var(--text-muted)] mt-1">
                  Precisión cronológica y diagnóstico forense
                </p>
              </div>

              {/* Recompensas */}
              <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-accent)] border border-[var(--brand-gold)] shadow-sm">
                  <Award size={20} className="text-[var(--brand-gold)]" />
                  <span className="font-display font-bold text-base text-[var(--text-primary)]">
                    +{resultadoData.xpGanado || 0} XP
                  </span>
                </div>
                {resultadoData.apGanado > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color-mix(in_oklch,var(--brand-primary)_15%,var(--bg-panel))] border border-[var(--border-accent)] shadow-sm">
                    <Zap size={18} className="text-[var(--brand-primary)]" />
                    <span className="font-display font-bold text-base text-[var(--text-primary)]">
                      +{resultadoData.apGanado} AP
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Secuencia Final Ordenada con Animación de Diff Framer Motion */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-display text-[var(--text-muted)]">
                <span className="font-bold text-[var(--text-primary)]">Secuencia Correcta Reconstruida:</span>
                <span>(Los ítems migraron a su lugar correcto)</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {eventos.map((evento, posFinal) => {
                  const idCulpableReal = resultadoData.eventoCulpableId;
                  const esCulpableReal = evento.id === idCulpableReal;
                  const eraCulpableElegidoPorAlumno = culpableElegido === evento.id;

                  // Verificamos si el alumno lo puso originalmente en esta misma posición
                  const posOriginalAlumno = ordenInicialEstudiante.indexOf(evento.id);
                  const estabaBienUbicado = posOriginalAlumno === posFinal;

                  return (
                    <motion.div
                      key={evento.id}
                      layout={!shouldReduceMotion}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 220, damping: 22 }
                      }
                      className={[
                        'p-3.5 rounded-[10px_14px_10px_12px] border-2 flex items-center justify-between gap-3 text-sm transition-all',
                        'bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)]',
                        esCulpableReal
                          ? 'border-amber-500 bg-[color-mix(in_oklch,var(--color-amber-500,#f59e0b)_10%,var(--bg-panel))]'
                          : estabaBienUbicado
                            ? 'border-[var(--brand-emerald)]'
                            : 'border-[var(--brand-crimson)]',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[var(--brand-primary)] text-white text-xs font-display font-bold flex items-center justify-center shrink-0">
                          {posFinal + 1}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)] line-clamp-2">
                          {evento.descripcion}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {esCulpableReal && (
                          <Badge variant="racha" className="text-[10px] px-2 py-0.5">
                            <Target size={10} /> Causa Raíz Real
                          </Badge>
                        )}
                        {!esCulpableReal && eraCulpableElegidoPorAlumno && (
                          <Badge variant="incorrecto" className="text-[10px] px-2 py-0.5">
                            Sospecha Errónea
                          </Badge>
                        )}
                        {estabaBienUbicado ? (
                          <span className="text-xs text-[var(--brand-emerald)] font-display font-bold flex items-center gap-1">
                            <CheckCircle2 size={14} /> Correcto
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--brand-crimson)] font-display font-bold flex items-center gap-1">
                            <XCircle size={14} /> Reubicado
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Explicación didáctica del backend */}
            {resultadoData.explicacionCorrecta && (
              <div className="p-4 rounded-[12px_16px_14px_14px] bg-[var(--bg-accent)] border border-[var(--border-muted)] flex flex-col gap-1.5 text-xs">
                <span className="font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                  💡 Análisis Pedagógico de la Secuencia
                </span>
                <p className="text-[var(--text-secondary)] leading-relaxed italic">
                  {resultadoData.explicacionCorrecta}
                </p>
              </div>
            )}

            {/* Botón para volver */}
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleClose}>
                <span>Volver al Tablero</span>
                <ArrowRight size={15} />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}

export default LineaTemporal;
