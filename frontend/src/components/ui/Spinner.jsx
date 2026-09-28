/**
 * Spinner — Estado de carga con estética de runa giratoria
 */
function Spinner({ size = 'md', label = 'Cargando…' }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      {/* Runa exterior */}
      <div className="relative">
        <div
          className={[
            sizes[size] ?? sizes.md,
            'rounded-full',
            'border-[var(--brand-primary)] border-t-transparent border-r-transparent',
            'animate-spin-rune',
          ].join(' ')}
          aria-hidden="true"
        />
        {/* Runa interior (contrarotación) */}
        <div
          className={[
            'absolute inset-1',
            'rounded-full',
            'border-2 border-[var(--brand-secondary)] border-b-transparent border-l-transparent',
          ].join(' ')}
          style={{ animation: 'spin-rune 0.8s cubic-bezier(0.4,0,0.2,1) infinite reverse' }}
          aria-hidden="true"
        />
      </div>
      <span className="text-xs font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default Spinner;
