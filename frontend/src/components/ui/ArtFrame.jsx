import React from 'react';
import { getAvatarPorId } from '../../features/alumno/components/AvataresData';

/**
 * ArtFrame — Marco de Cuadro Coleccionable para Retratos de Aventureros (Painterly RPG)
 *
 * El marco actúa como el marco físico de un cuadro ornamental:
 * - Rodea visiblemente al avatar en todos los componentes donde se exhiba.
 * - Mantiene la proporción de retrato 1:1 sin deformar en rombos extremos.
 * - Aplica estética de cuadro: madera/cuero antiguo, orlado de oro, cristal astral enjoyado o runas arcanas.
 */

const FRAME_CONFIGS = {
  // 1. Pergamino Clásico (Madera noble, cuero y esquineros de bronce)
  scroll: {
    containerClass:
      'rounded-2xl border-[3.5px] border-[#78350F] dark:border-[#92400E] bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#D97706]/40 dark:from-[#291809] dark:via-[#1c0f04] dark:to-[#451a03]/50',
    innerRing: 'ring-1 ring-[#92400E]/40 ring-inset',
    shadow: 'shadow-[3px_3px_0px_#451A03]',
    cornerColor: '#D97706',
    ornamentType: 'rivet',
  },
  default: {
    containerClass:
      'rounded-2xl border-[3.5px] border-[#78350F] dark:border-[#92400E] bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#D97706]/40 dark:from-[#291809] dark:via-[#1c0f04] dark:to-[#451a03]/50',
    innerRing: 'ring-1 ring-[#92400E]/40 ring-inset',
    shadow: 'shadow-[3px_3px_0px_#451A03]',
    cornerColor: '#D97706',
    ornamentType: 'rivet',
  },
  'marco-pergamino': {
    containerClass:
      'rounded-2xl border-[3.5px] border-[#78350F] dark:border-[#92400E] bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#D97706]/40 dark:from-[#291809] dark:via-[#1c0f04] dark:to-[#451a03]/50',
    innerRing: 'ring-1 ring-[#92400E]/40 ring-inset',
    shadow: 'shadow-[3px_3px_0px_#451A03]',
    cornerColor: '#D97706',
    ornamentType: 'rivet',
  },

  // 2. Orlado de Oro (Oro noble imperial con bisel y filigrana brillante)
  orlado_dorado: {
    containerClass:
      'rounded-xl border-[4px] border-[#F59E0B] bg-gradient-to-br from-[#FEF08A] via-[#FBBF24] to-[#B45309] dark:from-[#78350F] dark:via-[#451A03] dark:to-[#1C0A00]',
    innerRing: 'ring-2 ring-[#FEF08A] ring-inset',
    shadow: 'shadow-[0_0_14px_rgba(245,158,11,0.5),3px_3px_0px_#78350F]',
    cornerColor: '#FDE047',
    ornamentType: 'gold_diamond',
  },
  marco_dorado: {
    containerClass:
      'rounded-xl border-[4px] border-[#F59E0B] bg-gradient-to-br from-[#FEF08A] via-[#FBBF24] to-[#B45309] dark:from-[#78350F] dark:via-[#451A03] dark:to-[#1C0A00]',
    innerRing: 'ring-2 ring-[#FEF08A] ring-inset',
    shadow: 'shadow-[0_0_14px_rgba(245,158,11,0.5),3px_3px_0px_#78350F]',
    cornerColor: '#FDE047',
    ornamentType: 'gold_diamond',
  },

  // 3. Cristal Astral (Zafiro celeste estelar con prismas en esquinas)
  cristal_celeste: {
    containerClass:
      'rounded-lg border-[4px] border-[#06B6D4] bg-gradient-to-br from-[#CFFAFE] via-[#38BDF8] to-[#0E7490] dark:from-[#082F49] dark:via-[#0E7490] dark:to-[#02131F]',
    innerRing: 'ring-2 ring-[#67E8F9] ring-inset',
    shadow: 'shadow-[0_0_16px_rgba(6,182,212,0.5),3px_3px_0px_#0E7490]',
    cornerColor: '#22D3EE',
    ornamentType: 'crystal_star',
  },

  // 4. Runas Arcanas (Obsidiana y amatista con glifos arcanos y aura mágica)
  runa_violeta: {
    containerClass:
      'rounded-2xl border-[4px] border-[#8B5CF6] bg-gradient-to-br from-[#EDE9FE] via-[#A855F7] to-[#581C87] dark:from-[#3B0764] dark:via-[#2E1065] dark:to-[#0F021F]',
    innerRing: 'ring-2 ring-[#C084FC] ring-inset',
    shadow: 'shadow-[0_0_16px_rgba(139,92,246,0.5),3px_3px_0px_#4C1D95]',
    cornerColor: '#A855F7',
    ornamentType: 'arcane_rune',
  },
};

/** Renderiza los 4 adornos de esquinas según el tipo de marco */
function CornerOrnaments({ type }) {
  if (type === 'gold_diamond') {
    return (
      <>
        <span className="absolute top-0.5 left-0.5 z-10 w-2.5 h-2.5 bg-[#FDE047] border border-[#78350F] rotate-45 shadow-xs pointer-events-none" />
        <span className="absolute top-0.5 right-0.5 z-10 w-2.5 h-2.5 bg-[#FDE047] border border-[#78350F] rotate-45 shadow-xs pointer-events-none" />
        <span className="absolute bottom-0.5 left-0.5 z-10 w-2.5 h-2.5 bg-[#FDE047] border border-[#78350F] rotate-45 shadow-xs pointer-events-none" />
        <span className="absolute bottom-0.5 right-0.5 z-10 w-2.5 h-2.5 bg-[#FDE047] border border-[#78350F] rotate-45 shadow-xs pointer-events-none" />
      </>
    );
  }

  if (type === 'crystal_star') {
    return (
      <>
        <span className="absolute top-0 left-0 z-10 w-2.5 h-2.5 bg-[#67E8F9] rotate-45 shadow-[0_0_6px_#22D3EE] pointer-events-none" />
        <span className="absolute top-0 right-0 z-10 w-2.5 h-2.5 bg-[#67E8F9] rotate-45 shadow-[0_0_6px_#22D3EE] pointer-events-none" />
        <span className="absolute bottom-0 left-0 z-10 w-2.5 h-2.5 bg-[#67E8F9] rotate-45 shadow-[0_0_6px_#22D3EE] pointer-events-none" />
        <span className="absolute bottom-0 right-0 z-10 w-2.5 h-2.5 bg-[#67E8F9] rotate-45 shadow-[0_0_6px_#22D3EE] pointer-events-none" />
      </>
    );
  }

  if (type === 'arcane_rune') {
    return (
      <>
        <span className="absolute top-0.5 left-0.5 z-10 w-2.5 h-2.5 rounded-full bg-[#C084FC] border border-[#4C1D95] shadow-[0_0_8px_#A855F7] pointer-events-none" />
        <span className="absolute top-0.5 right-0.5 z-10 w-2.5 h-2.5 rounded-full bg-[#C084FC] border border-[#4C1D95] shadow-[0_0_8px_#A855F7] pointer-events-none" />
        <span className="absolute bottom-0.5 left-0.5 z-10 w-2.5 h-2.5 rounded-full bg-[#C084FC] border border-[#4C1D95] shadow-[0_0_8px_#A855F7] pointer-events-none" />
        <span className="absolute bottom-0.5 right-0.5 z-10 w-2.5 h-2.5 rounded-full bg-[#C084FC] border border-[#4C1D95] shadow-[0_0_8px_#A855F7] pointer-events-none" />
      </>
    );
  }

  // Remaches de latón medieval para Pergamino Clásico
  return (
    <>
      <span className="absolute top-1 left-1 z-10 w-2 h-2 rounded-full bg-[#D97706] border border-[#78350F] shadow-xs pointer-events-none" />
      <span className="absolute top-1 right-1 z-10 w-2 h-2 rounded-full bg-[#D97706] border border-[#78350F] shadow-xs pointer-events-none" />
      <span className="absolute bottom-1 left-1 z-10 w-2 h-2 rounded-full bg-[#D97706] border border-[#78350F] shadow-xs pointer-events-none" />
      <span className="absolute bottom-1 right-1 z-10 w-2 h-2 rounded-full bg-[#D97706] border border-[#78350F] shadow-xs pointer-events-none" />
    </>
  );
}

function ArtFrame({
  label = 'Retrato',
  shape = 'scroll',
  aspectRatio = '1/1',
  src = null,
  avatarId = null,
  auraColor = null,
  className = '',
  children,
  ...props
}) {
  const config = FRAME_CONFIGS[shape] ?? FRAME_CONFIGS.scroll;
  const avatar = avatarId ? getAvatarPorId(avatarId) : null;
  const AvatarIcon = avatar?.IconoPreview;

  return (
    <div
      className={[
        'relative overflow-hidden flex items-center justify-center p-[4px] sm:p-[5px]',
        config.containerClass,
        config.innerRing,
        config.shadow,
        className,
      ].join(' ')}
      style={{
        aspectRatio,
        boxShadow: auraColor ? `0 0 16px ${auraColor}, 4px 4px 0px ${auraColor}` : undefined,
      }}
      role="img"
      aria-label={label}
      {...props}
    >
      {/* Adornos y filigranas en las cuatro esquinas del marco */}
      <CornerOrnaments type={config.ornamentType} />

      {/* Lienzo interior del cuadro donde reposa el avatar */}
      <div className="w-full h-full rounded-[inherit] overflow-hidden flex items-center justify-center bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-base)]">
        {avatarId && AvatarIcon ? (
          <div className="w-full h-full p-1 flex items-center justify-center">
            <AvatarIcon className="w-full h-full object-cover filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] rounded-[inherit]" />
          </div>
        ) : src ? (
          <img src={src} alt={label} className="w-full h-full object-cover rounded-[inherit]" />
        ) : children ? (
          children
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
            <svg
              viewBox="0 0 64 64"
              className="w-8 h-8 opacity-40"
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
            <p className="text-center text-[10px] font-display font-semibold uppercase tracking-wider opacity-50">
              {label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArtFrame;
