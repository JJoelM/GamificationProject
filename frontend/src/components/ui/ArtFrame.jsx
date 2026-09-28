import React from 'react';
import { getAvatarPorId } from '../../features/alumno/components/AvataresData';

/**
 * ArtFrame — Contenedor de ilustración y Avatar 2D dibujado con estética Painterly RPG
 *
 * Propósito: presentar retratos de personajes, portadas o arte conceptual con marco orgánico (clip-path).
 *
 * Shapes disponibles:
 * · 'scroll'           — pergamino con esquinas dobladas (estándar preferido)
 * · 'parchment'        — pergamino con corte asimétrico leve
 * · 'orlado_dorado'    — octógono noble con filigrana
 * · 'cristal_celeste'  — prisma tallado
 * · 'runa_violeta'     — corte rúnico arcano
 * · 'default'          — pergamino rectangular orgánico
 */

const clipPaths = {
  scroll:           'polygon(0% 8%, 3% 0%, 97% 0%, 100% 8%, 100% 92%, 97% 100%, 3% 100%, 0% 92%)',
  parchment:        'polygon(2% 4%, 98% 2%, 100% 96%, 0% 98%)',
  orlado_dorado:    'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)',
  cristal_celeste:  'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  runa_violeta:     'polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%)',
  default:          'polygon(0% 8%, 3% 0%, 97% 0%, 100% 8%, 100% 92%, 97% 100%, 3% 100%, 0% 92%)',
};

function ArtFrame({
  label = 'Ilustración',
  shape = 'scroll',
  aspectRatio = '4/3',
  src = null,
  avatarId = null,
  auraColor = null,
  className = '',
  children,
  ...props
}) {
  const clipPath = clipPaths[shape] ?? clipPaths.scroll;
  const avatar = avatarId ? getAvatarPorId(avatarId) : null;
  const AvatarIcon = avatar?.IconoPreview;

  return (
    <div
      className={[
        'relative overflow-hidden flex items-center justify-center',
        'bg-gradient-to-br from-[var(--bg-accent)] to-[var(--bg-muted)]',
        'shadow-[4px_4px_0px_var(--border)]',
        className,
      ].join(' ')}
      style={{
        aspectRatio,
        clipPath,
        boxShadow: auraColor ? `4px 4px 0px ${auraColor}` : undefined,
      }}
      role="img"
      aria-label={label}
      {...props}
    >
      {/* 1. Render de Avatar Vectorial personalizado si se pasa avatarId */}
      {avatarId && AvatarIcon ? (
        <div className="w-full h-full p-1.5 flex items-center justify-center">
          <AvatarIcon className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]" />
        </div>
      ) : src ? (
        /* 2. Render de Imagen estática */
        <img src={src} alt={label} className="w-full h-full object-cover" />
      ) : children ? (
        /* 3. Children custom */
        children
      ) : (
        /* 4. Placeholder de Ilustración / Pintura */
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
          <svg
            viewBox="0 0 64 64"
            className="w-10 h-10 opacity-35"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M10 50 Q20 20 40 10" strokeLinecap="round" />
            <path d="M10 50 C8 56 14 58 16 54 C20 46 14 44 10 50Z" />
            <path d="M40 10 L50 4 L54 14 L44 20Z" />
            <path d="M30 34 Q38 26 44 20" strokeDasharray="3 3" />
          </svg>
          <p
            className="text-center text-xs font-display font-semibold uppercase tracking-widest opacity-40"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

export default ArtFrame;
