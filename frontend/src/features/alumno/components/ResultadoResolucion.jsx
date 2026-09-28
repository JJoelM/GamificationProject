import { useState } from 'react';
import { CheckCircle, XCircle, Award, RefreshCw, Sparkles, ArrowRight, Zap, Heart, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import XpParticleBurst from '../../../components/ui/XpParticleBurst';
import AnimatedCounter from '../../../components/ui/AnimatedCounter';
import { playSuccess } from '../../../utils/audio';

/**
 * Mensajes motivacionales diferenciados según performance
 */
const getMensaje = (porcentaje, esRepaso) => {
  if (esRepaso) return { emoji: '🔁', texto: 'Reforzaste tu aprendizaje con este repaso. ¡El conocimiento se consolida con la práctica!' };
  if (porcentaje === 100) return { emoji: '🏆', texto: '¡Perfección total! Cada pregunta resuelta con maestría. ¡Sos una leyenda!' };
  if (porcentaje >= 80) return { emoji: '🌟', texto: '¡Rendimiento excelente! Dominás el tema con claridad y confianza.' };
  if (porcentaje >= 60) return { emoji: '💪', texto: '¡Buen trabajo! Aprobaste la misión. Repasá las que fallaste para mejorar aún más.' };
  if (porcentaje >= 40) return { emoji: '📚', texto: 'Hay margen de mejora. Revisá el feedback pedagógico y volvé a intentar cuando quieras.' };
  return { emoji: '🌱', texto: 'Cada intento es aprendizaje. Leé las explicaciones y ¡volvé con todo!' };
};

/**
 * ResultadoResolucion v2 — Feedback inmediato tras completar una misión.
 *
 * Mejoras:
 * - Mensajes motivacionales contextuales (nunca punitivos)
 * - Desglose colapsable/expandible con enunciado, respuesta dada y correcta
 * - Animación escalonada de las tarjetas de feedback
 * - Diferenciación visual más fuerte entre correcto/incorrecto
 * - Separación de stats (porcentaje / XP / AP) con animaciones independientes
 */
function ResultadoResolucion({ resultado, preguntasOriginales = [], onCerrar }) {
  const {
    porcentajeCorrecto = 0,
    xpGanado = 0,
    apGanado = 0,
    esRepaso = false,
    feedback = [],
  } = resultado;

  const esPerfecto = porcentajeCorrecto === 100;
  const esAprobado = porcentajeCorrecto >= 60;
  const [showBurst, setShowBurst] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const mensaje = getMensaje(porcentajeCorrecto, esRepaso);

  const aciertos = feedback.filter((f) => f.esCorrecta).length;
  const errores = feedback.length - aciertos;

  // Accessible summary
  const accessibleSummary = `Misión completada. ${porcentajeCorrecto}% de aciertos, ${aciertos} correctas y ${errores} incorrectas. Ganaste ${xpGanado} puntos de experiencia.`;

  return (
    <div className="relative flex flex-col gap-6 max-w-2xl mx-auto">
      {/* ARIA live */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {accessibleSummary}
      </div>

      {/* Partículas */}
      {showBurst && <XpParticleBurst onComplete={() => setShowBurst(false)} />}

      {/* ── Banner principal ── */}
      <Card
        variant={esAprobado ? 'emerald' : 'default'}
        className="relative overflow-hidden flex flex-col items-center text-center p-6 gap-4"
      >
        {/* Fondo decorativo */}
        {esPerfecto && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[var(--brand-gold)]"
                style={{
                  top: `${15 + Math.random() * 70}%`,
                  left: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Badges de estado */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {esRepaso && (
            <Badge variant="repaso">
              <RefreshCw size={12} /> Repaso
            </Badge>
          )}
          <Badge
            variant={esPerfecto ? 'racha' : esAprobado ? 'correcto' : 'pendiente'}
            glow={esPerfecto}
          >
            {esPerfecto ? <Trophy size={12} /> : <Star size={12} />}
            {esPerfecto ? '¡Misión Impecable!' : esAprobado ? '¡Misión Cumplida!' : 'Buen intento'}
          </Badge>
        </div>

        {/* Porcentaje animado */}
        <div>
          <span className="font-display font-black text-6xl text-[var(--text-primary)] tracking-tight block">
            <AnimatedCounter value={porcentajeCorrecto} suffix="%" duration={1200} />
          </span>
          <p className="text-xs font-display font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">
            {aciertos} de {feedback.length} correctas
          </p>
        </div>

        {/* Recompensas */}
        <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[var(--bg-accent)] border-2 border-[var(--brand-gold)] shadow-[3px_3px_0px_var(--border)]"
          >
            <Award size={24} className="text-[var(--brand-gold)] shrink-0" />
            <div className="text-left">
              <span className="font-display font-black text-xl text-[var(--text-primary)] block leading-tight">
                +<AnimatedCounter value={xpGanado} duration={1400} />
              </span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                XP Ganado
              </span>
            </div>
          </motion.div>

          {apGanado > 0 && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[color-mix(in_oklch,var(--brand-primary)_15%,var(--bg-panel))] border-2 border-[var(--border-accent)] shadow-[3px_3px_0px_var(--border)]"
            >
              <Zap size={22} className="text-[var(--brand-primary)] shrink-0" />
              <div className="text-left">
                <span className="font-display font-black text-xl text-[var(--text-primary)] block leading-tight">
                  +<AnimatedCounter value={apGanado} duration={1400} />
                </span>
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  AP de Habilidad
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Mensaje motivacional */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-start gap-2.5 mt-2 p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-muted)] max-w-md text-left"
        >
          <span className="text-xl shrink-0">{mensaje.emoji}</span>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {mensaje.texto}
          </p>
        </motion.div>
      </Card>

      {/* ── Desglose pedagógico ── */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
          Revisión Pedagógica
        </h3>

        {feedback.map((item, idx) => {
          const preguntaOrig = preguntasOriginales[item.indicePregunta ?? idx];
          const isExpanded = expandedIdx === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * idx }}
            >
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className={[
                  'w-full p-4 rounded-[12px_16px_14px_14px] border-2 bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)] text-left transition-all',
                  item.esCorrecta ? 'border-[var(--brand-emerald)]' : 'border-[var(--brand-crimson)]',
                  'hover:-translate-y-0.5 cursor-pointer',
                ].join(' ')}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.esCorrecta ? (
                      <CheckCircle className="text-[var(--brand-emerald)] shrink-0" size={18} />
                    ) : (
                      <XCircle className="text-[var(--brand-crimson)] shrink-0" size={18} />
                    )}
                    <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                      Pregunta {(item.indicePregunta ?? idx) + 1}
                    </span>
                    {preguntaOrig?.enunciado && (
                      <span className="text-xs text-[var(--text-muted)] line-clamp-1 hidden sm:inline">
                        — {preguntaOrig.enunciado}
                      </span>
                    )}
                  </div>
                  <Badge variant={item.esCorrecta ? 'correcto' : 'incorrecto'}>
                    {item.esCorrecta ? 'Correcta' : 'Para revisar'}
                  </Badge>
                </div>

                {/* Contenido expandible */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-[var(--border-muted)]">
                        {preguntaOrig?.enunciado && (
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {preguntaOrig.enunciado}
                          </p>
                        )}

                        {!item.esCorrecta && item.respuestaCorrecta && (
                          <div className="text-xs p-2.5 rounded-lg bg-[color-mix(in_oklch,var(--brand-emerald)_10%,var(--bg-base))] border border-[var(--brand-emerald)] text-[var(--text-primary)]">
                            <span className="font-bold text-[var(--brand-emerald)]">Respuesta correcta: </span>
                            {item.respuestaCorrecta}
                          </div>
                        )}

                        {item.explicacion && (
                          <p className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-base)] p-2.5 rounded-lg border border-[var(--border-muted)]">
                            💡 {item.explicacion}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={onCerrar}>
          <span>Volver al Tablero</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}

export default ResultadoResolucion;
