import { motion } from 'framer-motion';

/**
 * XpBar — Barra de progreso XP con forma trapezoidal y animación spring
 *
 * Props:
 * · current   — XP actual
 * · max       — XP para el siguiente nivel
 * · label     — etiqueta accesible (ej: "XP del Alumno")
 * · showLabel — muestra el texto "X / Y XP"
 * · glowing   — activa el glow pulsante (cuando acaban de ganar XP)
 */
function XpBar({
  current = 0,
  max = 100,
  label = 'Puntos de experiencia',
  showLabel = true,
  glowing = false,
}) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div
      className="w-full"
      role="meter"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuetext={`${current} de ${max} XP`}
      aria-label={label}
    >
      {showLabel && (
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-xs font-display font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {label}
          </span>
          <span className="text-xs font-display font-bold text-[var(--brand-gold)]">
            {current.toLocaleString()} / {max.toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Track — forma trapezoidal via clip-path */}
      <div
        className="relative w-full h-5 rounded-sm overflow-hidden"
        style={{
          clipPath: 'polygon(0% 20%, 100% 0%, 100% 80%, 0% 100%)',
          background: 'var(--bg-accent)',
          border: '1px solid var(--border-muted)',
        }}
      >
        {/* Fill animado */}
        <motion.div
          className="absolute inset-y-0 left-0 origin-left"
          style={{
            background: 'linear-gradient(90deg, var(--brand-gold), color-mix(in oklch, var(--brand-gold) 80%, var(--brand-secondary)))',
            boxShadow: glowing ? '0 0 16px 4px var(--brand-gold)' : 'none',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </div>
    </div>
  );
}

export default XpBar;
