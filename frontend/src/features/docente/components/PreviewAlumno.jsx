import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

/**
 * PreviewAlumno — Simulador de cómo el alumno experimentaría esta misión.
 * Puramente visual/local, sin llamadas a API.
 * Se muestra/oculta en el ValidadorMision con un toggle.
 */
function PreviewAlumno({ narrativa, payload, recompensaXp, temaCurricular }) {
  const preguntas = payload?.preguntas ?? [];
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [selecciones, setSelecciones] = useState({});
  const [mostrarFeedback, setMostrarFeedback] = useState(false);

  const total = preguntas.length;
  const progreso = total > 0 ? ((preguntaActual + 1) / total) * 100 : 0;
  const pregunta = preguntas[preguntaActual];
  const seleccionActual = selecciones[preguntaActual];

  const handleSeleccionar = (opcion) => {
    if (mostrarFeedback) return;
    setSelecciones((prev) => ({ ...prev, [preguntaActual]: opcion }));
  };

  const handleResponder = () => {
    if (!seleccionActual) return;
    setMostrarFeedback(true);
  };

  const handleSiguiente = () => {
    setMostrarFeedback(false);
    setPreguntaActual((p) => Math.min(p + 1, total - 1));
  };

  const handleAnterior = () => {
    setMostrarFeedback(false);
    setPreguntaActual((p) => Math.max(p - 1, 0));
  };

  const handleReset = () => {
    setSelecciones({});
    setMostrarFeedback(false);
    setPreguntaActual(0);
  };

  if (!pregunta) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] font-display text-sm">
        No hay preguntas para previsualizar aún.
      </div>
    );
  }

  const esCorrecta = seleccionActual === pregunta.respuestaCorrecta;

  return (
    <div className="flex flex-col gap-4">
      {/* Cabecera de contexto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="info">Vista Alumno (simulación)</Badge>
          <span className="text-xs text-[var(--text-muted)]">
            Pregunta {preguntaActual + 1} / {total}
          </span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-display font-semibold text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
        >
          ↺ Reiniciar
        </button>
      </div>

      {/* Barra de progreso */}
      <div
        className="h-2 rounded-full bg-[var(--bg-accent)] overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progreso)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        />
      </div>

      {/* Narrativa (solo en pregunta 0) */}
      {preguntaActual === 0 && narrativa && (
        <div className="p-4 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-primary)_8%,var(--bg-panel))] border border-[var(--border-muted)] italic text-sm text-[var(--text-secondary)] leading-relaxed">
          "{narrativa}"
        </div>
      )}

      {/* Tarjeta de pregunta */}
      <AnimatePresence mode="wait">
        <motion.div
          key={preguntaActual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
        >
          <Card className="flex flex-col gap-4">
            <p className="font-display font-bold text-[var(--text-primary)] text-base leading-snug">
              {pregunta.enunciado}
            </p>

            <div className="flex flex-col gap-2">
              {pregunta.opciones?.map((opcion, i) => {
                const seleccionada = seleccionActual === opcion;
                const correcta = opcion === pregunta.respuestaCorrecta;
                let colorClass = 'border-[var(--border)] bg-[var(--bg-base)]';

                if (mostrarFeedback && seleccionada) {
                  colorClass = esCorrecta
                    ? 'border-[var(--brand-emerald)] bg-[color-mix(in_oklch,var(--brand-emerald)_12%,var(--bg-panel))]'
                    : 'border-[var(--brand-crimson)] bg-[color-mix(in_oklch,var(--brand-crimson)_10%,var(--bg-panel))]';
                } else if (mostrarFeedback && correcta) {
                  colorClass = 'border-[var(--brand-emerald)] bg-[color-mix(in_oklch,var(--brand-emerald)_8%,var(--bg-panel))]';
                } else if (seleccionada) {
                  colorClass = 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_10%,var(--bg-panel))]';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSeleccionar(opcion)}
                    disabled={mostrarFeedback}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-[8px_12px_10px_10px] border-2 text-left text-sm font-sans transition-all duration-150',
                      colorClass,
                      mostrarFeedback ? 'cursor-default' : 'hover:border-[var(--brand-primary)] hover:shadow-[2px_2px_0px_var(--brand-primary)]',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold',
                        seleccionada && !mostrarFeedback ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--border)] text-[var(--text-muted)]',
                        mostrarFeedback && correcta ? 'border-[var(--brand-emerald)] bg-[var(--brand-emerald)] text-white' : '',
                        mostrarFeedback && seleccionada && !esCorrecta ? 'border-[var(--brand-crimson)] bg-[var(--brand-crimson)] text-white' : '',
                      ].join(' ')}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={seleccionada ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>
                      {opcion}
                    </span>
                    {mostrarFeedback && correcta && (
                      <CheckCircle2 size={16} className="ml-auto text-[var(--brand-emerald)] shrink-0" />
                    )}
                    {mostrarFeedback && seleccionada && !esCorrecta && (
                      <XCircle size={16} className="ml-auto text-[var(--brand-crimson)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback explicación */}
            <AnimatePresence>
              {mostrarFeedback && pregunta.explicacion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={[
                    'p-3 rounded-lg border text-xs leading-relaxed',
                    esCorrecta
                      ? 'border-[var(--brand-emerald)] bg-[color-mix(in_oklch,var(--brand-emerald)_10%,var(--bg-panel))] text-[var(--text-secondary)]'
                      : 'border-[var(--brand-gold)] bg-[color-mix(in_oklch,var(--brand-gold)_10%,var(--bg-panel))] text-[var(--text-secondary)]',
                  ].join(' ')}>
                    <span className="font-semibold font-display">
                      {esCorrecta ? '¡Correcto! ' : 'Respuesta incorrecta. '}
                    </span>
                    {pregunta.explicacion}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recompensa XP mini */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-muted)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Award size={13} className="text-[var(--brand-gold)]" />
                <span>{recompensaXp ?? 100} XP al completar</span>
              </div>

              {/* Botones navegación */}
              <div className="flex items-center gap-2">
                {preguntaActual > 0 && (
                  <Button size="sm" variant="ghost" onClick={handleAnterior}>
                    <ChevronLeft size={14} />
                  </Button>
                )}
                {!mostrarFeedback ? (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!seleccionActual}
                    onClick={handleResponder}
                  >
                    Responder
                  </Button>
                ) : preguntaActual < total - 1 ? (
                  <Button size="sm" variant="primary" onClick={handleSiguiente}>
                    Siguiente
                    <ChevronRight size={14} />
                  </Button>
                ) : (
                  <Badge variant="correcto">Misión Completada ✓</Badge>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default PreviewAlumno;
