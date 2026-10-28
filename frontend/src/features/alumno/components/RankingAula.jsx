import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Crown, Medal, Loader2, Sparkles, Flame, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { useRankingAula } from '../../../hooks/useRankingAula';
import useSessionStore from '../../../store/useSessionStore';
import { playParchment } from '../../../utils/audio';

/**
 * RankingAula v3 — Ranking del aula conectado al backend real CQRS,
 * medallas para el top 3, e integrado con el progreso pedagógico personal (progresoPropio).
 *
 * REGLA PEDAGÓGICA (Spec 3.B):
 * El ranking SIEMPRE se presenta junto al avance personal propio,
 * para evitar la desmotivación por comparación social aislada.
 * Tono de celebración y superación individual, NUNCA de advertencia.
 */

const MEDALLAS_TOP3 = [
  { icon: Crown, color: '#FCD34D', bg: 'bg-[var(--brand-gold)]', label: 'Oro' },
  { icon: Medal, color: '#C0C0C0', bg: 'bg-[#94A3B8]', label: 'Plata' },
  { icon: Medal, color: '#CD7F32', bg: 'bg-[#B45309]', label: 'Bronce' },
  { icon: Medal, color: '#CD7F32', bg: 'bg-[#B45309]', label: 'Bronce' },
];

function RankingAula() {
  const { data, isLoading, isError } = useRankingAula();
  const usuario = useSessionStore((s) => s.usuario);
  const xpTotal = useSessionStore((s) => s.xpTotal);
  const rachaDias = useSessionStore((s) => s.rachaDias);

  const ranking = data?.ranking || [];
  const progresoPropio = data?.progresoPropio || {
    xpEstasSemana: xpTotal || 0,
    xpSemanaAnterior: 0,
    porcentajeMejora: 100,
    misionesCompletadas: 1,
    rachaDiasActivos: rachaDias || 0,
  };

  const miPosicionIdx = ranking.findIndex((r) => r.esYo);
  const miPosicion = miPosicionIdx >= 0 ? miPosicionIdx + 1 : '—';

  return (
    <Card className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px_10px_8px_8px] bg-[var(--brand-gold)] flex items-center justify-center text-[#1C0A00] shadow-sm">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
              Ranking del Aula
            </h3>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              Tu posición: <strong className="text-[var(--brand-primary)]">#{miPosicion}</strong>
            </span>
          </div>
        </div>
        <Badge variant="xp">Temporada Activa</Badge>
      </div>

      {/* Progreso personal pedagógico (anti-desmotivación) */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[color-mix(in_oklch,var(--brand-emerald)_12%,var(--bg-panel))] to-[var(--bg-accent)] border border-[var(--brand-emerald)] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--brand-emerald)] shrink-0" />
          <p className="text-xs text-[var(--text-primary)] font-medium">
            <strong className="font-bold text-[var(--brand-emerald)]">Tu avance pedagógico:</strong>{' '}
            {progresoPropio.porcentajeMejora >= 0 ? (
              <>
                Superaste tu récord con un{' '}
                <strong className="text-[var(--brand-emerald)] font-bold">
                  +{progresoPropio.porcentajeMejora}%
                </strong>{' '}
                esta semana.
              </>
            ) : (
              <>
                Llevas sumados <strong className="font-bold">{progresoPropio.xpEstasSemana} XP</strong> esta semana.
              </>
            )}
          </p>
        </div>

        {/* Micro-stats de superación propia */}
        <div className="flex items-center gap-3 pt-1 text-[11px] font-display font-semibold text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-[var(--brand-emerald)]" />
            {progresoPropio.misionesCompletadas} {progresoPropio.misionesCompletadas === 1 ? 'misión resuelta' : 'misiones resueltas'}
          </span>
          <span className="flex items-center gap-1">
            <Flame size={12} className="text-[var(--brand-secondary)]" />
            {progresoPropio.rachaDiasActivos} {progresoPropio.rachaDiasActivos === 1 ? 'día racha' : 'días racha'}
          </span>
        </div>
      </div>

      {/* Lista de posiciones animada */}
      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)]">
          <Loader2 size={24} className="animate-spin text-[var(--brand-primary)]" />
          <span className="text-xs font-display">Cargando clasificación del aula...</span>
        </div>
      ) : ranking.length === 0 ? (
        <div className="p-6 text-center text-xs text-[var(--text-secondary)] font-medium">
          Aún no hay registros de misiones resueltas en esta aula. ¡Sé el primero en participar!
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {ranking.map((alumno, idx) => {
            const medallaInfo = idx < 3 ? MEDALLAS_TOP3[idx] : null;
            const MedalIcon = medallaInfo?.icon;

            return (
              <motion.div
                key={alumno.nombreCompleto + idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200, damping: 22 }}
                className={[
                  'flex items-center justify-between p-2.5 rounded-[8px_12px_10px_10px] border transition-all text-xs',
                  alumno.esYo
                    ? 'bg-[color-mix(in_oklch,var(--brand-primary)_14%,var(--bg-panel))] border-[var(--brand-primary)] font-bold text-[var(--brand-primary)] shadow-[2px_2px_0px_var(--border-accent)]'
                    : 'bg-[var(--bg-base)] border-[var(--border-muted)] text-[var(--text-primary)]',
                ].join(' ')}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Posición con medalla o número */}
                  {medallaInfo ? (
                    <div
                      className={`w-6 h-6 rounded-full ${medallaInfo.bg} flex items-center justify-center shadow-sm shrink-0`}
                      title={`Puesto ${medallaInfo.label}`}
                    >
                      <MedalIcon size={13} style={{ color: '#FFF' }} />
                    </div>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-[var(--bg-panel)] border border-[var(--border-muted)] flex items-center justify-center font-display font-black text-[10px] text-[var(--text-secondary)] shrink-0">
                      {idx + 1}
                    </span>
                  )}

                  <span className="truncate">
                    {alumno.nombreCompleto} {alumno.esYo && '(Tú)'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alumno.rachaDiasActivos > 0 && (
                    <span className="text-[10px] text-[var(--brand-secondary)] flex items-center gap-0.5">
                      <Flame size={11} /> {alumno.rachaDiasActivos}d
                    </span>
                  )}
                  <span className="font-display font-bold whitespace-nowrap">
                    {alumno.experienciaXP.toLocaleString()} XP
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Enlace al Salón de Aventureros completo */}
      <Link
        to="/alumno/ranking"
        onClick={playParchment}
        className="mt-1 pt-2.5 border-t border-[var(--border-muted)] flex items-center justify-between text-xs font-display font-bold text-[var(--brand-primary)] hover:underline cursor-pointer group"
      >
        <span>Explorar Salón de Aventureros completo</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </Card>
  );
}

export default RankingAula;
