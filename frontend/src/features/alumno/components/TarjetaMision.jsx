import { Swords, Award, HelpCircle, Clock, RefreshCw, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import useSessionStore from '../../../store/useSessionStore';
import { playParchment } from '../../../utils/audio';

/**
 * TarjetaMision v3 — Tarjeta de misión con diferenciación inequívoca entre
 * "NUEVA A REALIZAR" y "DE REPASO" (con historial previo).
 */

const dificultadPorXp = (xp) => {
  if (xp >= 200) return { label: 'Épica', color: 'racha', stars: 3 };
  if (xp >= 120) return { label: 'Desafío', color: 'xp', stars: 2 };
  return { label: 'Exploración', color: 'info', stars: 1 };
};

function TarjetaMision({ mision, onResolver, index = 0 }) {
  const misionesResueltas = useSessionStore((s) => s.misionesResueltas) || {};
  const datosResolucion = misionesResueltas[mision.misionId];
  const esCompletada = Boolean(datosResolucion?.completada);

  let preguntas = [];
  try {
    const parsed = typeof mision.payloadJson === 'string'
      ? JSON.parse(mision.payloadJson)
      : mision.payloadJson;
    preguntas = parsed?.preguntas ?? [];
  } catch { /* empty */ }

  const preguntasCount = preguntas.length;
  const minutosEstimados = Math.max(2, Math.round(preguntasCount * 1.5));
  const dificultad = dificultadPorXp(mision.recompensaXp ?? 100);

  const handleClick = () => {
    playParchment();
    onResolver(mision);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: index * 0.04,
      }}
    >
      <Card
        hoverable
        className={[
          'flex flex-col justify-between gap-4 relative group h-full transition-all',
          esCompletada
            ? 'border-2 border-[var(--border-muted)] bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-muted)]'
            : 'border-2 border-[var(--border)] hover:border-[var(--brand-primary)] bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-accent)] shadow-[2px_2px_0px_var(--border)] hover:shadow-[3px_3px_0px_var(--brand-primary)]',
        ].join(' ')}
        onClick={handleClick}
      >
        {/* ── Barra Superior: Estado (NUEVA vs REPASO) + XP ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={[
                'w-9 h-9 rounded-[8px_12px_10px_10px] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_var(--border)]',
                esCompletada
                  ? 'bg-[var(--bg-accent)] text-[var(--brand-sky)]'
                  : 'bg-[var(--brand-primary)] text-[#FCD34D]',
              ].join(' ')}
            >
              {esCompletada ? <RefreshCw size={17} /> : <Swords size={17} />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {esCompletada ? (
                  <Badge variant="repaso" className="text-[10px] px-2 py-0.5">
                    <CheckCircle2 size={10} /> Repaso
                  </Badge>
                ) : (
                  <Badge variant="violet" glow className="text-[10px] px-2 py-0.5 font-medium">
                    <Sparkles size={10} /> Nueva
                  </Badge>
                )}
                <Badge variant={dificultad.color} className="text-[10px] px-2 py-0.5">
                  {'★'.repeat(dificultad.stars)}{'☆'.repeat(3 - dificultad.stars)} {dificultad.label}
                </Badge>
              </div>
              <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-primary)] line-clamp-1 mt-0.5">
                {mision.temaCurricular || 'Misión del Aula'}
              </span>
            </div>
          </div>

          <Badge variant="xp">
            <Award size={12} />
            {esCompletada
              ? `+${Math.round((mision.recompensaXp ?? 100) * 0.5)} XP`
              : `${mision.recompensaXp ?? 100} XP`}
          </Badge>
        </div>

        {/* ── Narrativa ── */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-sm text-[var(--text-primary)] font-medium line-clamp-3 leading-relaxed">
            {mision.narrativa || 'Explora este desafío interactivo y responde las preguntas para ganar puntos de experiencia.'}
          </p>
        </div>

        {/* ── Banner de Historial si ya fue resuelta ── */}
        {esCompletada && (
          <div className="p-2.5 rounded-lg bg-[color-mix(in_oklch,var(--brand-sky)_10%,var(--bg-base))] border border-[var(--brand-sky)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)] font-medium">
              Completada ({datosResolucion.intentos} {datosResolucion.intentos === 1 ? 'intento' : 'intentos'})
            </span>
            <span className="font-display font-bold text-[var(--brand-sky)]">
              Mejor: {datosResolucion.mejorPuntaje}%
            </span>
          </div>
        )}

        {/* ── Footer / Meta info ── */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-muted)] mt-auto text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HelpCircle size={13} />
              {preguntasCount} {preguntasCount === 1 ? 'pregunta' : 'preguntas'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              ~{minutosEstimados} min
            </span>
          </div>

          <span
            className={[
              'flex items-center gap-1 font-display font-semibold transition-all group-hover:gap-2',
              esCompletada ? 'text-[var(--brand-sky)]' : 'text-[var(--brand-primary)]',
            ].join(' ')}
          >
            {esCompletada ? 'Practicar Repaso' : 'Comenzar Desafío'}
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </motion.div>
  );
}

export default TarjetaMision;
