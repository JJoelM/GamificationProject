import React from 'react';
import { Shield, Sparkles, Feather, Crown, Heart, Zap, Award } from 'lucide-react';

/**
 * ARTICULOS_BAZAR — Catálogo de cosméticos, mascotas, títulos y escudos de racha comprables con AP
 */

export const ARTICULOS_BAZAR = [
  // ── 1. Consumibles Pedagógicos (Escudos de Constancia) ──
  {
    id: 'escudo_constancia_1',
    nombre: 'Escudo de Constancia',
    categoria: 'consumibles',
    tipo: 'escudo',
    valor: 1,
    costoAp: 50,
    descripcion: 'Protege tu racha de días activos por 1 día si no puedes ingresar a estudiar. ¡Aprende a tu propio ritmo!',
    rareza: 'Común',
    colorRareza: 'text-[var(--brand-emerald)]',
    IconoVisual: ({ className = 'w-12 h-12' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-2 border-[var(--brand-emerald)] text-[var(--brand-emerald)]`}>
        <Shield size={28} className="animate-pulse" />
      </div>
    ),
  },

  // ── 2. Mascotas Acompañantes ──
  {
    id: 'mascota_buho_erudito',
    nombre: 'Búho Erudito',
    categoria: 'mascotas',
    tipo: 'mascota',
    valor: 'buho_erudito',
    costoAp: 80,
    descripcion: 'Acompaña tus lecturas nocturnas y te susurra ánimos antes de cada desafío.',
    rareza: 'Raro',
    colorRareza: 'text-[var(--brand-primary)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <circle cx="32" cy="34" r="22" fill="#1E293B" />
        <circle cx="32" cy="34" r="18" fill="#334155" />
        {/* Ojos grandes de búho */}
        <circle cx="24" cy="30" r="7" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
        <circle cx="40" cy="30" r="7" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
        <circle cx="24" cy="30" r="3.5" fill="#0F172A" />
        <circle cx="40" cy="30" r="3.5" fill="#0F172A" />
        <circle cx="22" cy="28" r="1" fill="#FFFFFF" />
        <circle cx="38" cy="28" r="1" fill="#FFFFFF" />
        {/* Pico */}
        <polygon points="32,34 29,40 35,40" fill="#F59E0B" />
        {/* Pecho con plumas */}
        <path d="M28 44 Q32 48 36 44" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
        <path d="M26 48 Q32 52 38 48" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
        {/* Birrete */}
        <polygon points="32,10 16,18 32,26 48,18" fill="#2563EB" stroke="#60A5FA" strokeWidth="1" />
        <line x1="48" y1="18" x2="48" y2="28" stroke="#FCD34D" strokeWidth="2" />
        <circle cx="48" cy="29" r="1.5" fill="#FCD34D" />
      </svg>
    ),
  },
  {
    id: 'mascota_fenix_tinta',
    nombre: 'Fénix de Tinta',
    categoria: 'mascotas',
    tipo: 'mascota',
    valor: 'fenix_tinta',
    costoAp: 150,
    descripcion: 'Ave mística nacida de los manuscritos antiguos. Desprende chispas de inspiración.',
    rareza: 'Épico',
    colorRareza: 'text-[var(--brand-violet)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <circle cx="32" cy="32" r="22" fill="#2E1065" />
        {/* Alas en llamas de tinta */}
        <path d="M12 36 Q18 16 32 24 Q24 38 12 36 Z" fill="#7C3AED" />
        <path d="M52 36 Q46 16 32 24 Q40 38 52 36 Z" fill="#7C3AED" />
        {/* Cuerpo */}
        <ellipse cx="32" cy="36" rx="8" ry="14" fill="#6D28D9" />
        {/* Cabeza con cresta */}
        <circle cx="32" cy="22" r="6" fill="#A78BFA" />
        <path d="M32 16 Q34 8 38 12 Q36 18 32 16 Z" fill="#F59E0B" />
        <polygon points="32,23 35,26 29,26" fill="#FCD34D" />
        {/* Ojos */}
        <circle cx="30" cy="21" r="1" fill="#FFFFFF" />
        <circle cx="34" cy="21" r="1" fill="#FFFFFF" />
        {/* Cola flamígera */}
        <path d="M30 48 Q32 60 26 62 Q32 54 34 62 Q34 52 30 48" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    id: 'mascota_golem_arcilla',
    nombre: 'Golem de Arcilla & Runa',
    categoria: 'mascotas',
    tipo: 'mascota',
    valor: 'golem_arcilla',
    costoAp: 100,
    descripcion: 'Pequeño custodio leal esculpido con tierra y encendido con una runa de perseverancia.',
    rareza: 'Raro',
    colorRareza: 'text-[var(--brand-secondary)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <circle cx="32" cy="32" r="22" fill="#451A03" />
        {/* Cuerpo de piedra/arcilla */}
        <rect x="20" y="22" width="24" height="26" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
        {/* Cabeza cuadrada */}
        <rect x="22" y="14" width="20" height="14" rx="4" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
        {/* Ojos rúnicos brillantes */}
        <circle cx="27" cy="20" r="2" fill="#38BDF8" className="animate-pulse" />
        <circle cx="37" cy="20" r="2" fill="#38BDF8" className="animate-pulse" />
        {/* Runa en el pecho */}
        <path d="M32 28 L32 40 M28 32 L36 36 M36 32 L28 36" stroke="#67E8F9" strokeWidth="1.5" strokeLinecap="round" />
        {/* Manitos de arcilla */}
        <circle cx="16" cy="34" r="4" fill="#92400E" />
        <circle cx="48" cy="34" r="4" fill="#92400E" />
      </svg>
    ),
  },

  // ── 3. Marcos de Retrato Exclusivos ──
  {
    id: 'marco_orlado_dorado',
    nombre: 'Marco Orlado de Oro',
    categoria: 'marcos',
    tipo: 'marco',
    valor: 'orlado_dorado',
    costoAp: 120,
    descripcion: 'Marco con filigranas de oro pulido y brillo señorial para aventureros distinguidos.',
    rareza: 'Épico',
    colorRareza: 'text-[var(--brand-gold)]',
    IconoVisual: ({ className = 'w-12 h-12' }) => (
      <div className={`${className} flex items-center justify-center rounded-xl bg-[var(--bg-panel)] border-3 border-[var(--brand-gold)] shadow-[3px_3px_0px_var(--brand-gold)] text-[var(--brand-gold)]`}>
        <Crown size={24} />
      </div>
    ),
  },
  {
    id: 'marco_cristal_celeste',
    nombre: 'Marco de Cristal Astral',
    categoria: 'marcos',
    tipo: 'marco',
    valor: 'cristal_celeste',
    costoAp: 90,
    descripcion: 'Tallado en prismas celestes que reflejan la luz de las constelaciones del saber.',
    rareza: 'Raro',
    colorRareza: 'text-[var(--brand-sky)]',
    IconoVisual: ({ className = 'w-12 h-12' }) => (
      <div className={`${className} flex items-center justify-center rounded-xl bg-[var(--bg-panel)] border-2 border-[var(--brand-sky)] shadow-[3px_3px_0px_var(--brand-sky)] text-[var(--brand-sky)]`}>
        <Sparkles size={24} />
      </div>
    ),
  },
  {
    id: 'marco_runa_violeta',
    nombre: 'Marco de Runas Arcanas',
    categoria: 'marcos',
    tipo: 'marco',
    valor: 'runa_violeta',
    costoAp: 110,
    descripcion: 'Grabado con encantamientos púrpuras que vibran suavemente al responder acertadamente.',
    rareza: 'Raro',
    colorRareza: 'text-[var(--brand-violet)]',
    IconoVisual: ({ className = 'w-12 h-12' }) => (
      <div className={`${className} flex items-center justify-center rounded-xl bg-[var(--bg-panel)] border-2 border-[var(--brand-violet)] shadow-[3px_3px_0px_var(--brand-violet)] text-[var(--brand-violet)]`}>
        <Zap size={24} />
      </div>
    ),
  },

  // ── 4. Títulos Legendarios de Bazar ──
  {
    id: 'titulo_centinela_saber',
    nombre: 'Centinela del Saber',
    categoria: 'titulos',
    tipo: 'titulo',
    valor: 'Centinela del Saber',
    costoAp: 140,
    descripcion: 'Título honorífico reservado para estudiantes constantes y guardianes del aula.',
    rareza: 'Épico',
    colorRareza: 'text-[var(--brand-primary)]',
    IconoVisual: ({ className = 'w-12 h-12' }) => (
      <div className={`${className} flex items-center justify-center rounded-xl bg-[var(--bg-panel)] border-2 border-[var(--brand-primary)] text-[var(--brand-primary)]`}>
        <Award size={24} />
      </div>
    ),
  },
  {
    id: 'titulo_maestro_grimorios',
    nombre: 'Maestro de Grimorios',
    categoria: 'titulos',
    tipo: 'titulo',
    valor: 'Maestro de Grimorios',
    costoAp: 200,
    descripcion: 'Título supremo de erudición y destreza en la resolución de desafíos complejos.',
    rareza: 'Legendario',
    colorRareza: 'text-[#D97706]',
    IconoVisual: ({ className = 'w-12 h-12' }) => (
      <div className={`${className} flex items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--brand-gold)] to-[#FDE047] text-[#1C0A00] shadow-[3px_3px_0px_var(--border)]`}>
        <Crown size={26} />
      </div>
    ),
  },
];

export const CATEGORIAS_BAZAR = [
  { id: 'todas', label: 'Todo el Bazar' },
  { id: 'consumibles', label: 'Escudos de Estudio' },
  { id: 'mascotas', label: 'Mascotas' },
  { id: 'marcos', label: 'Marcos de Retrato' },
  { id: 'titulos', label: 'Títulos Honoríficos' },
];
