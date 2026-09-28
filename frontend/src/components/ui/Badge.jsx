/**
 * Badge — Etiqueta RPG de estado
 *
 * Variantes: xp | nivel | racha | correcto | incorrecto | pendiente | repaso | info | violet
 */
const variantStyles = {
  xp: 'bg-[var(--brand-gold)] text-[#1C0A00] border-[color-mix(in_oklch,var(--brand-gold)_70%,black)]',
  nivel: 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary-hov)]',
  racha: 'bg-[var(--brand-secondary)] text-white border-[color-mix(in_oklch,var(--brand-secondary)_70%,black)]',
  correcto: 'bg-[var(--brand-emerald)] text-white border-[color-mix(in_oklch,var(--brand-emerald)_70%,black)]',
  incorrecto: 'bg-[var(--brand-crimson)] text-white border-[color-mix(in_oklch,var(--brand-crimson)_70%,black)]',
  pendiente: 'bg-[var(--bg-accent)] text-[var(--text-primary)] border-[var(--border-muted)]',
  repaso: 'bg-[color-mix(in_oklch,var(--brand-sky)_15%,var(--bg-panel))] text-[var(--brand-sky)] border-[var(--brand-sky)]',
  violet: 'bg-[color-mix(in_oklch,var(--brand-violet)_15%,var(--bg-panel))] text-[var(--brand-violet)] border-[var(--brand-violet)]',
  info: 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border-[var(--border-muted)]',
};

function Badge({ variant = 'info', glow = false, children, className = '', ...props }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1',
        'text-xs font-display font-semibold uppercase tracking-wide',
        'rounded-full border',
        'select-none',
        variantStyles[variant] ?? variantStyles.info,
        glow ? 'animate-pulse-glow' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
