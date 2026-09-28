import { Trophy, TrendingUp, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import useSessionStore from '../../../store/useSessionStore';

/**
 * RankingAula v2 — Ranking del aula con animación de posiciones,
 * medallas para top 3, y siempre contextualizado con progreso personal.
 *
 * REGLA PEDAGÓGICA (Spec 3.B):
 * El ranking SIEMPRE se presenta junto al avance personal propio,
 * para evitar la desmotivación por comparación social aislada.
 * Tono de celebración, NUNCA de advertencia.
 */

const MEDALLAS_TOP3 = [
  { icon: Crown, color: '#FCD34D', bg: 'bg-[var(--brand-gold)]', label: 'Oro' },
  { icon: Medal, color: '#C0C0C0', bg: 'bg-[#94A3B8]', label: 'Plata' },
  { icon: Medal, color: '#CD7F32', bg: 'bg-[#B45309]', label: 'Bronce' },
];

function RankingAula({ mejoraSemanal = 24 }) {
  const usuario = useSessionStore((s) => s.usuario);
  const xpTotal = useSessionStore((s) => s.xpTotal);
  const primerNombre = usuario?.nombreCompleto?.split(' ')[0] ?? 'Tú';

  // Datos de ejemplo para MVP — reemplazar con query cuando exista el endpoint
  const companeros = [
    { nombre: 'Sofía Valenzuela', xp: 1240, esUsuarioActual: false },
    { nombre: `${primerNombre} (tú)`, xp: xpTotal, esUsuarioActual: true },
    { nombre: 'Mateo Benítez', xp: 750, esUsuarioActual: false },
    { nombre: 'Camila Rojas', xp: 620, esUsuarioActual: false },
    { nombre: 'Lucas Fernández', xp: 510, esUsuarioActual: false },
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((c, i) => ({ ...c, rango: i + 1 }));

  const posicionUsuario = companeros.find((c) => c.esUsuarioActual)?.rango ?? '—';

  return (
    <Card className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[6px_10px_8px_8px] bg-[var(--brand-gold)] flex items-center justify-center text-[#1C0A00]">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
              Ranking del Aula
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              Tu posición: #{posicionUsuario}
            </span>
          </div>
        </div>
        <Badge variant="xp">Temporada Activa</Badge>
      </div>

      {/* Progreso personal (anti-desmotivación) */}
      <div className="p-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-muted)] flex items-center gap-2.5">
        <TrendingUp size={16} className="text-[var(--brand-emerald)] shrink-0" />
        <p className="text-xs text-[var(--text-primary)]">
          <strong className="font-bold text-[var(--brand-emerald)]">Tu avance:</strong>{' '}
          Superaste tu récord semanal en un <strong>+{mejoraSemanal}%</strong>. ¡Seguí así!
        </p>
      </div>

      {/* Lista de posiciones animada */}
      <div className="flex flex-col gap-1.5">
        {companeros.map((alumno, idx) => {
          const medallaInfo = idx < 3 ? MEDALLAS_TOP3[idx] : null;
          const MedalIcon = medallaInfo?.icon;

          return (
            <motion.div
              key={alumno.nombre}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, type: 'spring', stiffness: 200, damping: 22 }}
              className={[
                'flex items-center justify-between p-2.5 rounded-[8px_12px_10px_10px] border transition-all text-xs',
                alumno.esUsuarioActual
                  ? 'bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] border-[var(--brand-primary)] font-bold text-[var(--brand-primary)] shadow-[2px_2px_0px_var(--border-accent)]'
                  : 'bg-[var(--bg-base)] border-[var(--border-muted)] text-[var(--text-primary)]',
              ].join(' ')}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Posición con medalla o número */}
                {medallaInfo ? (
                  <div
                    className={`w-6 h-6 rounded-full ${medallaInfo.bg} flex items-center justify-center shadow-sm`}
                    title={`Puesto ${medallaInfo.label}`}
                  >
                    <MedalIcon size={13} style={{ color: '#FFF' }} />
                  </div>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[var(--bg-panel)] border border-[var(--border-muted)] flex items-center justify-center font-display font-black text-[10px] text-[var(--text-muted)]">
                    {alumno.rango}
                  </span>
                )}

                <span className="truncate">{alumno.nombre}</span>
              </div>

              <span className="font-display font-bold whitespace-nowrap">
                {alumno.xp.toLocaleString()} XP
              </span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export default RankingAula;
