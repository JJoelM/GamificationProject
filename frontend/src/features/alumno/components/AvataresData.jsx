import React from 'react';

/**
 * AVATARES_RPG — Colección de avatares con ilustraciones SVG Painterly RPG
 * Cada ilustración está meticulosamente adaptada a su nombre y temática arquetípica.
 */
export const AVATARES_RPG = [
  {
    id: 'erudito_arcano',
    nombre: 'Erudito Arcano',
    clase: 'Mago del Saber',
    nivelRequerido: 1,
    base: true,
    costoAp: 0,
    descripcion: 'Portador del grimorio luminoso, gafas de sabio y devoto de las runas ancestrales.',
    colorTema: '#2563EB',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <defs>
          <radialGradient id="grad-erudito-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>
          <linearGradient id="grad-erudito-robe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="grad-erudito-hat" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Fondo místico estrellado */}
        <circle cx="50" cy="50" r="46" fill="url(#grad-erudito-bg)" stroke="#3B82F6" strokeWidth="1.5" />
        <circle cx="30" cy="22" r="1" fill="#93C5FD" opacity="0.8" />
        <circle cx="70" cy="18" r="1.2" fill="#BAE6FD" opacity="0.9" />
        <circle cx="20" cy="55" r="0.8" fill="#FFFFFF" opacity="0.6" />

        {/* Capa y túnica de mago */}
        <path d="M20 90 Q50 68 80 90 L75 100 L25 100 Z" fill="url(#grad-erudito-robe)" />
        <path d="M30 84 Q50 72 70 84" stroke="#FDE047" strokeWidth="1.8" fill="none" />
        <path d="M50 74 L50 100" stroke="#FDE047" strokeWidth="1.2" strokeDasharray="3 2" />

        {/* Cuello / Rostro */}
        <circle cx="50" cy="50" r="18" fill="#FED7AA" />

        {/* Ojos curiosos */}
        <circle cx="44" cy="50" r="2.2" fill="#1E1B4B" />
        <circle cx="56" cy="50" r="2.2" fill="#1E1B4B" />
        <circle cx="45" cy="49" r="0.8" fill="#FFFFFF" />
        <circle cx="57" cy="49" r="0.8" fill="#FFFFFF" />
        <path d="M46 56 Q50 59 54 56" stroke="#9A3412" strokeWidth="1.4" strokeLinecap="round" fill="none" />

        {/* Gafas de erudito arcanas */}
        <circle cx="43" cy="50" r="5" stroke="#F59E0B" strokeWidth="1.2" fill="#60A5FA" fillOpacity="0.25" />
        <circle cx="57" cy="50" r="5" stroke="#F59E0B" strokeWidth="1.2" fill="#60A5FA" fillOpacity="0.25" />
        <path d="M48 50 L52 50" stroke="#F59E0B" strokeWidth="1.5" />

        {/* Sombrero de Mago con runas doradas */}
        <path d="M18 42 Q50 30 82 42 Q50 36 18 42 Z" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1.5" />
        <path d="M28 40 Q40 8 64 12 Q52 28 72 40 Z" fill="url(#grad-erudito-hat)" />
        <path d="M38 33 Q48 24 58 31" stroke="#FDE047" strokeWidth="2.5" fill="none" />
        {/* Runa en la punta */}
        <circle cx="64" cy="12" r="3" fill="#FDE047" />
        <path d="M64 10 L64 14 M62 12 L66 12" stroke="#92400E" strokeWidth="1" />

        {/* Orbe rúnico de levitación */}
        <circle cx="78" cy="34" r="7" fill="#60A5FA" opacity="0.85" />
        <circle cx="78" cy="34" r="4.5" fill="#BFDBFE" />
        <path d="M78 29 L78 39 M73 34 L83 34" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="78" cy="34" r="9" stroke="#93C5FD" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'exploradora_reliquias',
    nombre: 'Exploradora de Reliquias',
    clase: 'Aventurera Intrépida',
    nivelRequerido: 1,
    base: true,
    costoAp: 0,
    descripcion: 'Ágil y perspicaz, con gafas de expedición, pluma guía y brújula de reliquias.',
    colorTema: '#D97706',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <defs>
          <radialGradient id="grad-exploradora-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#451A03" />
            <stop offset="100%" stopColor="#1C0A00" />
          </radialGradient>
          <linearGradient id="grad-cuero" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#grad-exploradora-bg)" stroke="#F59E0B" strokeWidth="1.5" />

        {/* Poncho / Chaqueta de viaje */}
        <path d="M22 88 Q50 68 78 88 L72 100 L28 100 Z" fill="url(#grad-cuero)" />
        <path d="M38 78 L50 94 L62 78" stroke="#FDE68A" strokeWidth="2" fill="none" />

        {/* Medallón brújula al cuello */}
        <circle cx="50" cy="74" r="4.5" fill="#FDE047" stroke="#78350F" strokeWidth="1" />
        <path d="M50 71 L51 74 L50 77 L49 74 Z" fill="#DC2626" />

        {/* Cabello castaño trenzado */}
        <path d="M28 40 Q22 66 32 78 Q40 50 34 38 Z" fill="#78350F" />
        <path d="M72 40 Q78 66 68 78 Q60 50 66 38 Z" fill="#78350F" />

        {/* Rostro audaz */}
        <circle cx="50" cy="48" r="18" fill="#FED7AA" />
        <circle cx="43" cy="48" r="2.3" fill="#431407" />
        <circle cx="57" cy="48" r="2.3" fill="#431407" />
        <circle cx="44" cy="47" r="0.8" fill="#FFFFFF" />
        <circle cx="58" cy="47" r="0.8" fill="#FFFFFF" />
        <path d="M46 55 Q50 59 54 55" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Sombrero de ala ancha con pluma dorada */}
        <ellipse cx="50" cy="38" rx="28" ry="8" fill="#92400E" stroke="#B45309" strokeWidth="1.5" />
        <path d="M32 38 Q50 20 68 38 Z" fill="#78350F" />
        {/* Pluma de reliquia */}
        <path d="M66 32 Q78 12 70 6 Q62 16 64 28 Z" fill="#FDE047" stroke="#D97706" strokeWidth="1" />
        <path d="M66 22 L68 14" stroke="#92400E" strokeWidth="1" />

        {/* Gafas de explorador en el ala del sombrero */}
        <rect x="34" y="32" width="13" height="9" rx="3" fill="#451A03" stroke="#FDE68A" strokeWidth="1.5" />
        <rect x="53" y="32" width="13" height="9" rx="3" fill="#451A03" stroke="#FDE68A" strokeWidth="1.5" />
        <path d="M47 36 L53 36" stroke="#FDE68A" strokeWidth="2" />
        <circle cx="40.5" cy="36.5" r="3.5" fill="#67E8F9" opacity="0.85" />
        <circle cx="59.5" cy="36.5" r="3.5" fill="#67E8F9" opacity="0.85" />
        <circle cx="39" cy="35" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="35" r="1" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'avatar_arquera',
    nombre: 'Arquera Silvana',
    clase: 'Tiradora del Bosque',
    nivelRequerido: 1,
    base: false,
    costoAp: 50,
    descripcion: 'Puntería infalible entre el follaje; porta un arco de tejo élfico y carcaj repleto de flechas.',
    colorTema: '#16A34A',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <defs>
          <radialGradient id="grad-arquera-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#14532D" />
            <stop offset="100%" stopColor="#052E16" />
          </radialGradient>
          <linearGradient id="grad-arco" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>

        {/* Fondo del bosque místico */}
        <circle cx="50" cy="50" r="46" fill="url(#grad-arquera-bg)" stroke="#22C55E" strokeWidth="1.5" />

        {/* Carcaj con flechas en la espalda derecha */}
        <path d="M72 38 L84 72 L77 75 L67 40 Z" fill="#78350F" stroke="#FDE68A" strokeWidth="1" />
        {/* Plumas de las flechas (fletchings) */}
        <path d="M71 34 L74 24 L77 35" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M76 36 L81 26 L83 37" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M80 39 L87 30 L88 40" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />

        {/* Capa y manto de cazadora forestal */}
        <path d="M22 88 Q50 68 78 88 L72 100 L28 100 Z" fill="#15803D" />
        <path d="M36 80 Q50 72 64 80" stroke="#86EFAC" strokeWidth="1.8" fill="none" />

        {/* Broche élfico en forma de hoja en el pecho */}
        <circle cx="50" cy="74" r="3.5" fill="#4ADE80" stroke="#166534" strokeWidth="1" />
        <path d="M50 71 L50 77 M48 74 L52 74" stroke="#FFFFFF" strokeWidth="1" />

        {/* Rostro concentrado */}
        <circle cx="50" cy="50" r="18" fill="#FED7AA" />

        {/* Ojos de halcón afilados */}
        <path d="M40 48 Q44 46 47 49" stroke="#14532D" strokeWidth="2" strokeLinecap="round" />
        <path d="M53 49 Q56 46 60 48" stroke="#14532D" strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="50" r="2.2" fill="#14532D" />
        <circle cx="56" cy="50" r="2.2" fill="#14532D" />
        <circle cx="44.5" cy="49.2" r="0.8" fill="#FFFFFF" />
        <circle cx="56.5" cy="49.2" r="0.8" fill="#FFFFFF" />
        <path d="M47 56 Q50 58 53 56" stroke="#9A3412" strokeWidth="1.4" strokeLinecap="round" fill="none" />

        {/* Capucha verde forestal */}
        <path
          d="M26 50 Q24 24 50 16 Q76 24 74 50 Q78 40 70 30 Q50 20 30 30 Q22 40 26 50 Z"
          fill="#16A34A"
          stroke="#4ADE80"
          strokeWidth="1.5"
        />

        {/* Arco recurvo de madera noble cruzado en el hombro izquierdo */}
        <path d="M14 26 Q30 52 24 84" stroke="url(#grad-arco)" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M14 26 L24 84" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 1" opacity="0.8" />
        <circle cx="14" cy="26" r="2" fill="#FDE047" />
        <circle cx="24" cy="84" r="2" fill="#FDE047" />
      </svg>
    ),
  },
  {
    id: 'alquimista_botanica',
    nombre: 'Alquimista Botánica',
    clase: 'Científica Naturalista',
    nivelRequerido: 1,
    base: false,
    costoAp: 40,
    descripcion: 'Domina los secretos de la flora y destila pociones mágicas en matraces resplandecientes.',
    colorTema: '#059669',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <defs>
          <radialGradient id="grad-alquimista-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#064E3B" />
            <stop offset="100%" stopColor="#022C22" />
          </radialGradient>
          <linearGradient id="grad-pocion" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="70%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#A7F3D0" />
          </linearGradient>
        </defs>

        {/* Fondo esmeralda botánico */}
        <circle cx="50" cy="50" r="46" fill="url(#grad-alquimista-bg)" stroke="#10B981" strokeWidth="1.5" />

        {/* Túnica de hojas y manto naturalista */}
        <path d="M22 88 Q50 66 78 88 L74 100 L26 100 Z" fill="#047857" />
        <path d="M50 72 L50 96 M38 82 L50 88 M62 82 L50 88" stroke="#6EE7B7" strokeWidth="1.8" />

        {/* Rostro sereno */}
        <circle cx="50" cy="48" r="18" fill="#FED7AA" />
        <circle cx="43" cy="47" r="2.3" fill="#064E3B" />
        <circle cx="57" cy="47" r="2.3" fill="#064E3B" />
        <circle cx="44" cy="46" r="0.8" fill="#FFFFFF" />
        <circle cx="58" cy="46" r="0.8" fill="#FFFFFF" />
        <path d="M46 54 Q50 57 54 54" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Corona floral de brotes y tréboles */}
        <path d="M28 40 Q50 24 72 40" stroke="#059669" strokeWidth="3" fill="none" />
        <circle cx="34" cy="32" r="4" fill="#34D399" stroke="#065F46" strokeWidth="1" />
        <circle cx="50" cy="26" r="5" fill="#6EE7B7" stroke="#047857" strokeWidth="1" />
        <circle cx="66" cy="32" r="4" fill="#34D399" stroke="#065F46" strokeWidth="1" />
        {/* Pequeñas flores */}
        <circle cx="50" cy="26" r="2" fill="#FDE047" />
        <circle cx="34" cy="32" r="1.5" fill="#F472B6" />
        <circle cx="66" cy="32" r="1.5" fill="#F472B6" />

        {/* Matraz de alquimia brillante en primer plano (derecha) */}
        <path d="M70 66 L74 66 L76 74 Q84 84 76 90 Q68 94 66 84 L70 74 Z" fill="#D1FAE5" fillOpacity="0.4" stroke="#6EE7B7" strokeWidth="1.2" />
        {/* Líquido burbujeante en el frasco */}
        <path d="M69 77 Q77 75 79 84 Q77 89 72 88 Q68 86 69 77 Z" fill="url(#grad-pocion)" />
        <circle cx="73" cy="80" r="1" fill="#FFFFFF" />
        <circle cx="75" cy="84" r="1.5" fill="#FFFFFF" opacity="0.8" />
        {/* Burbujas flotantes mágicas */}
        <circle cx="73" cy="62" r="2" fill="#6EE7B7" opacity="0.7" />
        <circle cx="77" cy="56" r="1.3" fill="#A7F3D0" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'artifice_runico',
    nombre: 'Artífice Rúnico',
    clase: 'Ingeniero Arcano',
    nivelRequerido: 2,
    base: false,
    costoAp: 60,
    descripcion: 'Forja autómatas y artefactos electromágicos con monóculo de engranajes y placas de latón.',
    colorTema: '#7C3AED',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <defs>
          <radialGradient id="grad-artifice-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#3B0764" />
            <stop offset="100%" stopColor="#1E0538" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#grad-artifice-bg)" stroke="#A855F7" strokeWidth="1.5" />

        {/* Peto de cuero y placas de bronce/latón con remaches */}
        <path d="M22 88 Q50 68 78 88 L72 100 L28 100 Z" fill="#581C87" />
        <path d="M38 78 L62 78 M50 78 L50 98" stroke="#FDE047" strokeWidth="2" />
        <circle cx="40" cy="84" r="1.5" fill="#FDE047" />
        <circle cx="60" cy="84" r="1.5" fill="#FDE047" />

        {/* Rostro del artífice */}
        <circle cx="50" cy="48" r="18" fill="#FED7AA" />
        <circle cx="57" cy="48" r="2.3" fill="#1E1B4B" />
        <circle cx="58" cy="47" r="0.8" fill="#FFFFFF" />
        <path d="M46 56 Q50 59 54 56" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Monóculo rúnico mecánico en el ojo derecho (estilo steampunk arcano) */}
        <circle cx="43" cy="48" r="7" fill="#8B5CF6" opacity="0.4" />
        <circle cx="43" cy="48" r="5.5" stroke="#FDE047" strokeWidth="1.8" fill="#7C3AED" />
        <circle cx="43" cy="48" r="2" fill="#E9D5FF" />
        <path d="M43 41 L43 32 M36 48 L31 48" stroke="#FDE047" strokeWidth="1.5" />
        {/* Dientes del engranaje del monóculo */}
        <path d="M40 43 L46 53 M46 43 L40 53" stroke="#FDE047" strokeWidth="1" opacity="0.7" />

        {/* Diadema con engranaje dentado de latón */}
        <path d="M28 36 Q50 24 72 36" stroke="#B45309" strokeWidth="3" fill="none" />
        {/* Engranaje arcano giratorio */}
        <circle cx="72" cy="28" r="7" stroke="#FDE047" strokeWidth="2" fill="#7C3AED" />
        <circle cx="72" cy="28" r="3" fill="#FDE047" />
        <path d="M72 19 L72 37 M63 28 L81 28" stroke="#FDE047" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'caballera_astral',
    nombre: 'Caballera Astral',
    clase: 'Guardiana de las Estrellas',
    nivelRequerido: 3,
    base: false,
    costoAp: 80,
    descripcion: 'Armadura forjada en starlight con yelmo alado y estrella de ocho puntas.',
    colorTema: '#0284C7',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <defs>
          <radialGradient id="grad-caballera-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#0C4A6E" />
            <stop offset="100%" stopColor="#082F49" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#grad-caballera-bg)" stroke="#38BDF8" strokeWidth="1.5" />

        {/* Peto plateado y hombreras astrales */}
        <path d="M20 88 Q50 64 80 88 L74 100 L26 100 Z" fill="#0369A1" />
        <path d="M50 68 L50 98 M36 84 Q50 90 64 84" stroke="#BAE6FD" strokeWidth="2.2" fill="none" />
        {/* Emblema estelar en el pecho */}
        <circle cx="50" cy="78" r="3" fill="#FDE047" />

        {/* Rostro valeroso */}
        <circle cx="50" cy="48" r="18" fill="#FED7AA" />
        <circle cx="43" cy="48" r="2.2" fill="#0C4A6E" />
        <circle cx="57" cy="48" r="2.2" fill="#0C4A6E" />
        <circle cx="44" cy="47" r="0.8" fill="#FFFFFF" />
        <circle cx="58" cy="47" r="0.8" fill="#FFFFFF" />
        <path d="M46 55 Q50 58 54 55" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Yelmo de acero estelar con visera */}
        <path d="M30 38 Q50 20 70 38 L66 46 Q50 32 34 46 Z" fill="#0284C7" stroke="#7DD3FC" strokeWidth="1.5" />

        {/* Alas astrales de plata en el yelmo */}
        <path d="M22 36 Q12 18 26 14 Q28 26 32 34 Z" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="1" />
        <path d="M78 36 Q88 18 74 14 Q72 26 68 34 Z" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="1" />

        {/* Estrella de ocho puntas en la frente */}
        <path
          d="M50 18 L51.5 22.5 L56 24 L51.5 25.5 L50 30 L48.5 25.5 L44 24 L48.5 22.5 Z"
          fill="#FDE047"
          stroke="#F59E0B"
          strokeWidth="0.8"
        />
      </svg>
    ),
  },
  {
    id: 'archimago_solar',
    nombre: 'Archimago Solar',
    clase: 'Maestro de la Iluminación',
    nivelRequerido: 4,
    base: false,
    costoAp: 100,
    descripcion: 'Togas doradas, corona de rayos solares y orbe ardiente de sabiduría suprema.',
    colorTema: '#EA580C',
    IconoPreview: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <defs>
          <radialGradient id="grad-archimago-bg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.55" />
            <stop offset="65%" stopColor="#7C2D12" />
            <stop offset="100%" stopColor="#431407" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="46" fill="url(#grad-archimago-bg)" stroke="#F97316" strokeWidth="1.5" />

        {/* Túnica solar de gala con cuello alto ceremonial */}
        <path d="M20 88 Q50 62 80 88 L74 100 L26 100 Z" fill="#EA580C" />
        <path d="M50 66 L50 98 M30 82 Q50 72 70 82" stroke="#FDE047" strokeWidth="2.5" fill="none" />

        {/* Rostro iluminado */}
        <circle cx="50" cy="48" r="18" fill="#FED7AA" />
        <circle cx="43" cy="48" r="2.3" fill="#7C2D12" />
        <circle cx="57" cy="48" r="2.3" fill="#7C2D12" />
        <circle cx="44" cy="47" r="1" fill="#FDE047" />
        <circle cx="58" cy="47" r="1" fill="#FDE047" />
        <path d="M46 55 Q50 58 54 55" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Corona Solar Radiante (Rayos de sol flamígeros) */}
        <path
          d="M24 38 L30 18 L38 32 L50 10 L62 32 L70 18 L76 38 Z"
          fill="#F59E0B"
          stroke="#FDE047"
          strokeWidth="1.8"
        />
        <circle cx="50" cy="24" r="3.5" fill="#FFFFFF" />

        {/* Núcleo solar ardiente flotante */}
        <circle cx="78" cy="32" r="7.5" fill="#F97316" />
        <circle cx="78" cy="32" r="4.5" fill="#FDE047" />
        <circle cx="78" cy="32" r="2" fill="#FFFFFF" />
        {/* Rayitos solares del orbe */}
        <path d="M78 22 L78 24 M78 40 L78 42 M68 32 L70 32 M86 32 L88 32" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
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
  if (!id) return AVATARES_RPG[0];
  const directo = AVATARES_RPG.find((a) => a.id === id);
  if (directo) return directo;

  // Mapeos y aliases limpios (cada arquetipo a su avatar correspondiente)
  if (id === 'avatar_arquera' || id === 'arquera_silvana' || id === 'arquera') {
    return AVATARES_RPG.find((a) => a.id === 'avatar_arquera') || AVATARES_RPG[2];
  }
  if (id === 'avatar-explorador') {
    return AVATARES_RPG.find((a) => a.id === 'exploradora_reliquias') || AVATARES_RPG[1];
  }
  if (id === 'avatar_guerrero') {
    return AVATARES_RPG.find((a) => a.id === 'caballera_astral') || AVATARES_RPG[5];
  }
  if (id === 'avatar_mago') {
    return AVATARES_RPG.find((a) => a.id === 'erudito_arcano') || AVATARES_RPG[0];
  }
  if (id === 'mago_sideral') {
    return AVATARES_RPG.find((a) => a.id === 'archimago_solar') || AVATARES_RPG[6];
  }

  return AVATARES_RPG[0];
}
