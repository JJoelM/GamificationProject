import { forwardRef } from 'react';

/**
 * Button — Primitivo UI con estética Painterly RPG
 *
 * Variantes:
 * · primary   — Violeta RPG, CTA principal
 * · secondary — Rosa fúcsia, acciones de logro/racha
 * · danger    — Rojo crimson, destructivo (rechazar)
 * · ghost     — Sin fondo, solo texto con borde
 * · icon      — Cuadrado para íconos sueltos
 *
 * Tamaños: sm | md (default) | lg
 */
const variantStyles = {
  primary: [
    'bg-[var(--brand-primary)] text-[var(--text-inverse)]',
    'border-2 border-[var(--brand-primary-hov)]',
    'shadow-[3px_3px_0px_var(--brand-primary-hov)]',
    'hover:shadow-[5px_5px_0px_var(--brand-primary-hov)] hover:-translate-y-0.5',
    'active:shadow-[1px_1px_0px_var(--brand-primary-hov)] active:translate-y-0.5',
  ].join(' '),

  secondary: [
    'bg-[var(--brand-secondary)] text-[var(--text-inverse)]',
    'border-2 border-[color-mix(in_oklch,var(--brand-secondary)_80%,black)]',
    'shadow-[3px_3px_0px_color-mix(in_oklch,var(--brand-secondary)_80%,black)]',
    'hover:shadow-[5px_5px_0px_color-mix(in_oklch,var(--brand-secondary)_80%,black)] hover:-translate-y-0.5',
    'active:shadow-[1px_1px_0px_color-mix(in_oklch,var(--brand-secondary)_80%,black)] active:translate-y-0.5',
  ].join(' '),

  danger: [
    'bg-[var(--brand-crimson)] text-white',
    'border-2 border-[color-mix(in_oklch,var(--brand-crimson)_80%,black)]',
    'shadow-[3px_3px_0px_color-mix(in_oklch,var(--brand-crimson)_80%,black)]',
    'hover:shadow-[5px_5px_0px_color-mix(in_oklch,var(--brand-crimson)_80%,black)] hover:-translate-y-0.5',
    'active:shadow-[1px_1px_0px_color-mix(in_oklch,var(--brand-crimson)_80%,black)] active:translate-y-0.5',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--brand-primary)]',
    'border-2 border-[var(--border-accent)]',
    'shadow-none',
    'hover:bg-[color-mix(in_oklch,var(--brand-primary)_10%,transparent)] hover:-translate-y-0.5',
  ].join(' '),

  icon: [
    'bg-transparent text-[var(--text-secondary)]',
    'border border-[var(--border-muted)]',
    'rounded-lg aspect-square',
    'hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)] hover:border-[var(--border-accent)]',
  ].join(' '),
};

const sizeStyles = {
  sm:   'px-3 py-1.5 text-sm gap-1.5',
  md:   'px-5 py-2.5 text-sm gap-2',
  lg:   'px-7 py-3.5 text-base gap-2.5',
  icon: 'p-2 text-base',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    children,
    className = '',
    ...props
  },
  ref
) {
  const isIcon = variant === 'icon';

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        // Base
        'inline-flex items-center justify-center font-display font-semibold',
        'rounded-[8px_12px_10px_10px]', /* borde asimétrico sutil */
        'transition-all duration-150 ease-out cursor-pointer',
        'select-none outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none',
        // Variante y tamaño
        variantStyles[variant] ?? variantStyles.primary,
        isIcon ? sizeStyles.icon : sizeStyles[size] ?? sizeStyles.md,
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-rune" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
});

export default Button;
