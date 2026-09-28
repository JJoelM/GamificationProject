import { useState, useCallback } from 'react';
import { Swords, Send, CheckCircle2, ChevronRight, ChevronLeft, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResolverMision } from '../../../hooks/useMisionMutations';
import ResultadoResolucion from './ResultadoResolucion';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import { playParchment, playChime } from '../../../utils/audio';

/**
 * ResolverMision v2 — Experiencia de quiz inmersiva pregunta por pregunta.
 *
 * Cambios respecto a v1:
 * - UNA pregunta a la vez (en vez de scroll con todas) — más foco, menos overwhelm
 * - Transiciones animadas entre preguntas (slide horizontal)
 * - Barra de progreso con indicadores de punto por pregunta
 * - Confirmación visual de selección con efecto de carta
 * - Resumen de respuestas antes de enviar con posibilidad de revisar
 * - Accesibilidad: radiogroup, keyboard nav, ARIA live
 */
function ResolverMision({ mision, isOpen, onClose }) {
  const { mutate: resolver, isPending, data: resultadoData, error, reset } = useResolverMision();

  let preguntas = [];
  try {
    const parsed = typeof mision?.payloadJson === 'string'
      ? JSON.parse(mision.payloadJson)
      : mision?.payloadJson;
    preguntas = parsed?.preguntas ?? [];
  } catch { /* empty */ }

  const [respuestas, setRespuestas] = useState({});
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [fase, setFase] = useState('narrativa'); // 'narrativa' | 'quiz' | 'revision'
  const [direccion, setDireccion] = useState(1); // 1=next, -1=prev for animation

  const total = preguntas.length;
  const pregunta = preguntas[preguntaIdx];
  const cantRespondidas = Object.keys(respuestas).length;
  const todasRespondidas = total > 0 && cantRespondidas === total;

  const handleSelectOpcion = useCallback((opcion) => {
    playParchment();
    setRespuestas((prev) => ({ ...prev, [preguntaIdx]: opcion }));
  }, [preguntaIdx]);

  const handleSiguiente = () => {
    setDireccion(1);
    if (preguntaIdx < total - 1) {
      setPreguntaIdx((i) => i + 1);
    } else {
      setFase('revision');
    }
  };

  const handleAnterior = () => {
    setDireccion(-1);
    setPreguntaIdx((i) => Math.max(0, i - 1));
  };

  const handleIrAPregunta = (idx) => {
    setDireccion(idx > preguntaIdx ? 1 : -1);
    setPreguntaIdx(idx);
    setFase('quiz');
  };

  const handleComenzar = () => {
    playChime();
    setFase('quiz');
  };

  const handleClose = () => {
    reset();
    setRespuestas({});
    setPreguntaIdx(0);
    setFase('narrativa');
    setDireccion(1);
    onClose();
  };

  const handleEnviar = () => {
    if (!mision?.misionId) return;
    const respuestasArray = preguntas.map((_, idx) => ({
      indicePregunta: idx,
      opcionElegida: respuestas[idx] || '',
    }));
    resolver({
      misionId: mision.misionId,
      respuestas: respuestasArray,
      preguntasOriginales: preguntas,
    });
  };

  const handleOptionKeyDown = (e, opcion, oIndex) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectOpcion(opcion);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (oIndex + 1) % pregunta.opciones.length;
      document.getElementById(`opt-${preguntaIdx}-${next}`)?.focus();
      handleSelectOpcion(pregunta.opciones[next]);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (oIndex - 1 + pregunta.opciones.length) % pregunta.opciones.length;
      document.getElementById(`opt-${preguntaIdx}-${prev}`)?.focus();
      handleSelectOpcion(pregunta.opciones[prev]);
    }
  };

  // Slide animation variants
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? undefined : handleClose}
      title={resultadoData ? 'Resultado de la Misión' : fase === 'revision' ? 'Revisar y Entregar' : 'Resolver Misión'}
      size="lg"
    >
      {resultadoData ? (
        <ResultadoResolucion
          resultado={resultadoData}
          preguntasOriginales={preguntas}
          onCerrar={handleClose}
        />
      ) : (
        <div className="flex flex-col gap-5">

          {/* ── Fase: Narrativa introductoria ── */}
          {fase === 'narrativa' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-5"
            >
              <div className="p-5 rounded-[12px_16px_14px_14px] bg-[var(--bg-accent)] border-2 border-[var(--border-muted)] shadow-[3px_3px_0px_var(--border)]">
                <div className="flex items-center gap-2 mb-3">
                  <Swords size={16} className="text-[var(--brand-primary)]" />
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                    Desafío de la Misión
                  </span>
                </div>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                  "{mision?.narrativa || 'Respondé las preguntas para completar tu misión y ganar puntos de experiencia.'}"
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-muted)]">
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Shield size={13} className="text-[var(--brand-primary)]" />
                    {total} {total === 1 ? 'pregunta' : 'preguntas'}
                  </span>
                  <Badge variant="xp">
                    {mision?.recompensaXp ?? 100} XP
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={handleClose}>
                  Volver
                </Button>
                <Button variant="primary" onClick={handleComenzar}>
                  <Swords size={14} />
                  ¡Comenzar Misión!
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Fase: Quiz pregunta por pregunta ── */}
          {fase === 'quiz' && pregunta && (
            <div className="flex flex-col gap-4">
              {/* Indicadores de progreso por puntos */}
              <div className="flex items-center gap-1.5 justify-center">
                {preguntas.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleIrAPregunta(i)}
                    className={[
                      'w-3 h-3 rounded-full transition-all duration-200 cursor-pointer',
                      i === preguntaIdx
                        ? 'bg-[var(--brand-primary)] scale-125 shadow-[0_0_8px_var(--brand-primary)]'
                        : respuestas[i]
                          ? 'bg-[var(--brand-emerald)]'
                          : 'bg-[var(--border-muted)]',
                    ].join(' ')}
                    aria-label={`Ir a pregunta ${i + 1}${respuestas[i] ? ' (respondida)' : ''}`}
                    title={`Pregunta ${i + 1}`}
                  />
                ))}
              </div>

              {/* Barra de progreso */}
              <div className="flex items-center justify-between text-xs font-display text-[var(--text-muted)]">
                <span>Pregunta {preguntaIdx + 1} de {total}</span>
                <span className="font-bold text-[var(--brand-primary)]">
                  {cantRespondidas} respondidas
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-muted)] border border-[var(--border-muted)] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-primary)]"
                  animate={{ width: `${total > 0 ? ((preguntaIdx + 1) / total) * 100 : 0}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>

              {error && <ErrorBanner error={error} onDismiss={reset} />}

              {/* Pregunta con animación de slide */}
              <AnimatePresence mode="wait" custom={direccion}>
                <motion.div
                  key={preguntaIdx}
                  custom={direccion}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <div
                    role="radiogroup"
                    aria-labelledby={`q-title-${preguntaIdx}`}
                    className="p-5 rounded-[12px_16px_14px_14px] border-2 border-[var(--border)] bg-[var(--bg-panel)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-white text-xs font-display font-bold flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        {preguntaIdx + 1}
                      </span>
                      <p
                        id={`q-title-${preguntaIdx}`}
                        className="font-display font-bold text-base text-[var(--text-primary)] leading-snug"
                      >
                        {pregunta.enunciado}
                      </p>
                    </div>

                    {/* Opciones */}
                    <div className="flex flex-col gap-2.5">
                      {pregunta.opciones?.map((opcion, oIndex) => {
                        const isSelected = respuestas[preguntaIdx] === opcion;
                        return (
                          <button
                            key={oIndex}
                            id={`opt-${preguntaIdx}-${oIndex}`}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={isSelected || (!respuestas[preguntaIdx] && oIndex === 0) ? 0 : -1}
                            onClick={() => handleSelectOpcion(opcion)}
                            onKeyDown={(e) => handleOptionKeyDown(e, opcion, oIndex)}
                            className={[
                              'flex items-center gap-3 p-3.5 rounded-[10px_14px_10px_12px] border-2 text-left text-sm transition-all duration-150 cursor-pointer outline-none',
                              'focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2',
                              isSelected
                                ? 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-primary)] text-[var(--brand-primary)] font-semibold -translate-y-0.5'
                                : 'border-[var(--border-muted)] bg-[var(--bg-base)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)] hover:-translate-y-0.5',
                            ].join(' ')}
                          >
                            <div
                              className={[
                                'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                                isSelected
                                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white scale-110'
                                  : 'border-[var(--border-muted)] bg-[var(--bg-panel)] text-transparent',
                              ].join(' ')}
                              aria-hidden="true"
                            >
                              <CheckCircle2 size={14} className={isSelected ? 'block' : 'opacity-0'} />
                            </div>
                            <span className="flex-1 leading-snug">{opcion}</span>
                            <span className="text-[10px] font-display font-bold text-[var(--text-muted)] opacity-60 shrink-0">
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navegación */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAnterior}
                  disabled={preguntaIdx === 0}
                >
                  <ChevronLeft size={14} />
                  Anterior
                </Button>

                <div className="flex gap-2">
                  {preguntaIdx < total - 1 ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSiguiente}
                      disabled={!respuestas[preguntaIdx]}
                    >
                      Siguiente
                      <ChevronRight size={14} />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setFase('revision')}
                      disabled={!respuestas[preguntaIdx]}
                    >
                      Revisar respuestas
                      <ChevronRight size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Fase: Revisión antes de enviar ── */}
          {fase === 'revision' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                Revisá tus respuestas antes de entregar. Podés hacer click en cualquier pregunta para volver a editarla.
              </p>

              <div className="flex flex-col gap-2.5">
                {preguntas.map((p, idx) => {
                  const resp = respuestas[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => handleIrAPregunta(idx)}
                      className={[
                        'flex items-center gap-3 p-3 rounded-[10px_14px_10px_12px] border text-left text-sm transition-all cursor-pointer',
                        resp
                          ? 'border-[var(--brand-emerald)] bg-[color-mix(in_oklch,var(--brand-emerald)_8%,var(--bg-panel))]'
                          : 'border-[var(--brand-crimson)] bg-[color-mix(in_oklch,var(--brand-crimson)_8%,var(--bg-panel))]',
                        'hover:shadow-[2px_2px_0px_var(--border)] hover:-translate-y-0.5',
                      ].join(' ')}
                    >
                      <span className="w-6 h-6 rounded-full bg-[var(--brand-primary)] text-white text-xs font-display font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] line-clamp-1">
                          {p.enunciado}
                        </p>
                        <p className={`text-xs mt-0.5 ${resp ? 'text-[var(--brand-emerald)]' : 'text-[var(--brand-crimson)]'}`}>
                          {resp ? `→ ${resp}` : 'Sin respuesta'}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-[var(--text-muted)] shrink-0" />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-muted)]">
                <span className="text-xs text-[var(--text-muted)] font-display">
                  {cantRespondidas} de {total} respondidas
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFase('quiz');
                      setPreguntaIdx(0);
                    }}
                  >
                    Volver al quiz
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleEnviar}
                    loading={isPending}
                    disabled={!todasRespondidas}
                  >
                    <Send size={14} />
                    Entregar Misión
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default ResolverMision;
