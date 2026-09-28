/**
 * Card — Contenedor Painterly RPG
 *
 * Variantes:
 * · default  — Card estándar con borde cuero y sombra offset
 * · quest    — Para tarjetas de misión (borde dorado)
 * · danger   — Para acciones destructivas (borde rojo)
 * · glass    — Efecto translúcido (para overlays)
 *
 * Props:
 * · hoverable (bool) — activa el efecto de elevación en hover
 * · artFrame (bool)  — agrega el pseudo-frame interior decorativo
 */

const variantStyles = {
  default: [
    'bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-muted)]',
    'border-2 border-[var(--border)]',
    'shadow-[var(--shadow-c)]',
  ].join(' '),

  quest: [
    'bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-accent)]',
    'border-2 border-[var(--brand-gold)]',
    'shadow-[3px_3px_0px_var(--brand-gold)]',
  ].join(' '),

  emerald: [
    'bg-gradient-to-br from-[var(--bg-panel)] to-[color-mix(in_oklch,var(--brand-emerald)_10%,var(--bg-panel))]',
    'border-2 border-[var(--brand-emerald)]',
    'shadow-[3px_3px_0px_color-mix(in_oklch,var(--brand-emerald)_50%,var(--bg-muted))]',
  ].join(' '),

  danger: [
    'bg-gradient-to-br from-[var(--bg-panel)] to-[color-mix(in_oklch,var(--brand-crimson)_8%,var(--bg-panel))]',
    'border-2 border-[var(--brand-crimson)]',
    'shadow-[3px_3px_0px_color-mix(in_oklch,var(--brand-crimson)_50%,var(--bg-muted))]',
  ].join(' '),

  violet: [
    'bg-gradient-to-br from-[var(--bg-panel)] to-[color-mix(in_oklch,var(--brand-violet)_8%,var(--bg-panel))]',
    'border-2 border-[var(--brand-violet)]',
    'shadow-[3px_3px_0px_color-mix(in_oklch,var(--brand-violet)_50%,var(--bg-muted))]',
  ].join(' '),

  glass: [
    'bg-[color-mix(in_oklch,var(--bg-panel)_80%,transparent)]',
    'border border-[var(--border-muted)]',
    'backdrop-blur-sm',
  ].join(' '),
};

function Card({
  variant = 'default',
  hoverable = false,
  artFrame = false,
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={[
        'rounded-[14px_20px_16px_18px]', /* Borde asimétrico — orgánico */
        'p-5',
        'transition-all duration-200 ease-out',
        variantStyles[variant] ?? variantStyles.default,
        hoverable
          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[var(--shadow-c-hov)]'
          : '',
        artFrame ? 'frame-inner' : '', /* Agrega pseudo-frame decorativo interior */
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
