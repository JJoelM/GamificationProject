import React from 'react';

/**
 * AVATARES_RPG — Colección de arquetipos y avatares con ilustraciones SVG Painterly RPG
 */
export const AVATARES_RPG = [
  {
    id: 'erudito_arcano',
    nombre: 'Erudito Arcano',
    clase: 'Mago del Saber',
    nivelRequerido: 1,
    descripcion: 'Portador del grimorio luminoso y devoto de las runas ancestrales.',
    colorTema: '#2563EB',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        {/* Fondo místico */}
        <circle cx="50" cy="50" r="46" fill="#1E1B4B" />
        <circle cx="50" cy="50" r="42" fill="url(#grad-erudito-bg)" />
        {/* Capa */}
        <path d="M22 88 Q50 68 78 88 L72 100 L28 100 Z" fill="#3B82F6" />
        <path d="M30 84 Q50 72 70 84" stroke="#93C5FD" strokeWidth="2" fill="none" />
        {/* Cabeza / Rostro */}
        <circle cx="50" cy="48" r="20" fill="#FDE68A" />
        {/* Ojos expresivos */}
        <circle cx="44" cy="47" r="2.5" fill="#1E1B4B" />
        <circle cx="56" cy="47" r="2.5" fill="#1E1B4B" />
        <circle cx="45" cy="46" r="1" fill="#FFFFFF" />
        <circle cx="57" cy="46" r="1" fill="#FFFFFF" />
        {/* Sonrisa audaz */}
        <path d="M46 54 Q50 58 54 54" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Sombrero de Mago */}
        <path d="M20 38 Q50 28 80 38 Q50 32 20 38 Z" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1.5" />
        <path d="M28 36 Q42 6 62 10 Q50 26 72 36 Z" fill="#2563EB" />
        <path d="M40 28 Q48 20 58 26" stroke="#FCD34D" strokeWidth="2.5" fill="none" />
        {/* Orbe rúnico flotante */}
        <circle cx="76" cy="30" r="8" fill="#60A5FA" opacity="0.8" />
        <circle cx="76" cy="30" r="5" fill="#BFDBFE" />
        <path d="M76 26 L76 34 M72 30 L80 30" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <defs>
          <radialGradient id="grad-erudito-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'exploradora_reliquias',
    nombre: 'Exploradora de Reliquias',
    clase: 'Aventurera Intrépida',
    nivelRequerido: 1,
    descripcion: 'Ágil y perspicaz, descifra mapas olvidados y ruinas misteriosas.',
    colorTema: '#D97706',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <circle cx="50" cy="50" r="46" fill="#451A03" />
        <circle cx="50" cy="50" r="42" fill="url(#grad-exploradora-bg)" />
        {/* Poncho / Chaleco */}
        <path d="M24 88 Q50 70 76 88 L70 100 L30 100 Z" fill="#D97706" />
        <path d="M38 78 L50 94 L62 78" stroke="#FDE68A" strokeWidth="2" fill="none" />
        {/* Cabello */}
        <path d="M30 40 Q25 65 34 75 Q40 50 36 38 Z" fill="#78350F" />
        <path d="M70 40 Q75 65 66 75 Q60 50 64 38 Z" fill="#78350F" />
        {/* Rostro */}
        <circle cx="50" cy="48" r="19" fill="#FED7AA" />
        {/* Ojos */}
        <circle cx="43" cy="47" r="2.5" fill="#431407" />
        <circle cx="57" cy="47" r="2.5" fill="#431407" />
        <circle cx="44" cy="46" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="46" r="1" fill="#FFFFFF" />
        {/* Sonrisa */}
        <path d="M46 55 Q50 59 54 55" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Gafas de explorador en la frente */}
        <rect x="34" y="32" width="12" height="10" rx="3" fill="#B45309" stroke="#FDE68A" strokeWidth="1.5" />
        <rect x="54" y="32" width="12" height="10" rx="3" fill="#B45309" stroke="#FDE68A" strokeWidth="1.5" />
        <path d="M46 37 L54 37" stroke="#FDE68A" strokeWidth="2" />
        <circle cx="40" cy="37" r="3" fill="#67E8F9" opacity="0.8" />
        <circle cx="60" cy="37" r="3" fill="#67E8F9" opacity="0.8" />
        {/* Pluma en el sombrero */}
        <path d="M68 28 Q78 12 70 6 Q64 16 66 26 Z" fill="#F59E0B" />
        <defs>
          <radialGradient id="grad-exploradora-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#451A03" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'alquimista_botanica',
    nombre: 'Alquimista Botánica',
    clase: 'Científica Naturalista',
    nivelRequerido: 1,
    descripcion: 'Domina los secretos de la flora y destila pociones curativas.',
    colorTema: '#059669',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <circle cx="50" cy="50" r="46" fill="#064E3B" />
        <circle cx="50" cy="50" r="42" fill="url(#grad-alquimista-bg)" />
        {/* Manto de hojas */}
        <path d="M22 88 Q50 66 78 88 L74 100 L26 100 Z" fill="#059669" />
        <path d="M50 72 L50 96 M38 82 L50 88 M62 82 L50 88" stroke="#A7F3D0" strokeWidth="1.5" />
        {/* Rostro */}
        <circle cx="50" cy="48" r="19" fill="#FDE68A" />
        {/* Ojos serenos */}
        <circle cx="43" cy="47" r="2.5" fill="#064E3B" />
        <circle cx="57" cy="47" r="2.5" fill="#064E3B" />
        <circle cx="44" cy="46" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="46" r="1" fill="#FFFFFF" />
        <path d="M46 54 Q50 57 54 54" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Corona de hojas / brotes */}
        <path d="M28 42 Q50 26 72 42" stroke="#10B981" strokeWidth="3" fill="none" />
        <circle cx="34" cy="34" r="4" fill="#34D399" />
        <circle cx="50" cy="28" r="5" fill="#6EE7B7" />
        <circle cx="66" cy="34" r="4" fill="#34D399" />
        {/* Frasco de poción brillante */}
        <path d="M20 30 L26 30 L28 38 Q28 44 23 44 Q18 44 18 38 Z" fill="#34D399" stroke="#D1FAE5" strokeWidth="1" />
        <circle cx="23" cy="40" r="1.5" fill="#FFFFFF" />
        <defs>
          <radialGradient id="grad-alquimista-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#064E3B" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'artifice_runico',
    nombre: 'Artífice Rúnico',
    clase: 'Ingeniero Arcano',
    nivelRequerido: 2,
    descripcion: 'Forja artefactos electromágicos y decodifica autómatas del saber.',
    colorTema: '#7C3AED',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <circle cx="50" cy="50" r="46" fill="#2E1065" />
        <circle cx="50" cy="50" r="42" fill="url(#grad-artifice-bg)" />
        {/* Armadura ligera de cuero y bronce */}
        <path d="M22 88 Q50 68 78 88 L72 100 L28 100 Z" fill="#6D28D9" />
        <path d="M40 76 L60 76 M50 76 L50 96" stroke="#FDE047" strokeWidth="2" />
        {/* Rostro */}
        <circle cx="50" cy="48" r="19" fill="#FED7AA" />
        {/* Monóculo rúnico luminoso */}
        <circle cx="57" cy="47" r="2.5" fill="#1E1B4B" />
        <circle cx="43" cy="47" r="6" fill="#8B5CF6" opacity="0.6" />
        <circle cx="43" cy="47" r="4.5" stroke="#FDE047" strokeWidth="1.5" fill="#A78BFA" />
        <circle cx="43" cy="47" r="1.5" fill="#FFFFFF" />
        <path d="M43 41 L43 32" stroke="#FDE047" strokeWidth="1.5" />
        <path d="M46 55 Q50 58 54 55" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Diadema de engranajes */}
        <path d="M30 36 Q50 26 70 36" stroke="#F59E0B" strokeWidth="3" fill="none" />
        <circle cx="70" cy="30" r="6" stroke="#FDE047" strokeWidth="2" fill="#7C3AED" />
        <defs>
          <radialGradient id="grad-artifice-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2E1065" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'caballera_astral',
    nombre: 'Caballera Astral',
    clase: 'Guardiana de las Estrellas',
    nivelRequerido: 3,
    descripcion: 'Escudo inquebrantable que canaliza la luz de las constelaciones.',
    colorTema: '#0284C7',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <circle cx="50" cy="50" r="46" fill="#0C4A6E" />
        <circle cx="50" cy="50" r="42" fill="url(#grad-caballera-bg)" />
        {/* Peto plateado astral */}
        <path d="M22 88 Q50 66 78 88 L72 100 L28 100 Z" fill="#0284C7" />
        <path d="M50 70 L50 96 M36 84 Q50 90 64 84" stroke="#BAE6FD" strokeWidth="2" fill="none" />
        {/* Rostro */}
        <circle cx="50" cy="48" r="19" fill="#FDE68A" />
        {/* Ojos determinados */}
        <circle cx="43" cy="47" r="2.5" fill="#0C4A6E" />
        <circle cx="57" cy="47" r="2.5" fill="#0C4A6E" />
        <circle cx="44" cy="46" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="46" r="1" fill="#FFFFFF" />
        <path d="M46 55 Q50 58 54 55" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Yelmo con alas astrales */}
        <path d="M30 38 Q50 22 70 38 L66 46 Q50 34 34 46 Z" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />
        <path d="M24 34 Q16 20 28 18 Q28 28 32 34 Z" fill="#38BDF8" />
        <path d="M76 34 Q84 20 72 18 Q72 28 68 34 Z" fill="#38BDF8" />
        <circle cx="50" cy="24" r="3.5" fill="#FCD34D" />
        <defs>
          <radialGradient id="grad-caballera-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0C4A6E" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'archimago_solar',
    nombre: 'Archimago Solar',
    clase: 'Maestro de la Iluminación',
    nivelRequerido: 4,
    descripcion: 'Canaliza el saber cumbre y desata la sabiduría de las eras doradas.',
    colorTema: '#EA580C',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <circle cx="50" cy="50" r="46" fill="#7C2D12" />
        <circle cx="50" cy="50" r="42" fill="url(#grad-archimago-bg)" />
        {/* Túnica solar de gala */}
        <path d="M22 88 Q50 64 78 88 L72 100 L28 100 Z" fill="#EA580C" />
        <path d="M50 68 L50 96 M32 82 Q50 74 68 82" stroke="#FDE047" strokeWidth="2.5" fill="none" />
        {/* Rostro */}
        <circle cx="50" cy="48" r="19" fill="#FED7AA" />
        {/* Ojos con destellos dorados */}
        <circle cx="43" cy="47" r="2.5" fill="#7C2D12" />
        <circle cx="57" cy="47" r="2.5" fill="#7C2D12" />
        <circle cx="44" cy="46" r="1" fill="#FDE047" />
        <circle cx="58" cy="46" r="1" fill="#FDE047" />
        <path d="M46 55 Q50 58 54 55" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Corona Solar Radiante */}
        <path d="M26 36 L34 18 L42 30 L50 12 L58 30 L66 18 L74 36 Z" fill="#F59E0B" stroke="#FDE047" strokeWidth="1.5" />
        <circle cx="50" cy="24" r="3" fill="#FFFFFF" />
        <defs>
          <radialGradient id="grad-archimago-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7C2D12" />
          </radialGradient>
        </defs>
      </svg>
    ),
  },
];

export const AURAS_DISPONIBLES = [
  { id: 'azul', nombre: 'Azul Real', hex: '#2563EB' },
  { id: 'morado', nombre: 'Violeta Arcano', hex: '#7C3AED' },
  { id: 'dorado', nombre: 'Ámbar Solar', hex: '#D97706' },
  { id: 'esmeralda', nombre: 'Esmeralda Vital', hex: '#059669' },
  { id: 'carmesí', nombre: 'Carmesí Fénix', hex: '#DC2626' },
  { id: 'celeste', nombre: 'Celeste Astral', hex: '#0EA5E9' },
];

export function getAvatarPorId(id) {
  return AVATARES_RPG.find((a) => a.id === id) || AVATARES_RPG[0];
}
