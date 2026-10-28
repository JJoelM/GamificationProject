import React from 'react';
import { Shield, Sparkles, Feather, Crown, Heart, Zap, Award } from 'lucide-react';

/**
 * ARTICULOS_BAZAR — Catálogo de cosméticos, mascotas, títulos y escudos de racha comprables con AP
 */

export const ARTICULOS_BAZAR = [
  // ── 1. Consumibles Pedagógicos (Únicamente 2) ──
  {
    id: 'pista',
    nombre: 'Pista Didáctica',
    categoria: 'consumibles',
    tipo: 'pista',
    valor: 1,
    costoAp: 15,
    descripcion: 'Descarta una opción errónea en tus desafíos para orientar tu razonamiento causal.',
    rareza: 'Consumible',
    colorRareza: 'text-amber-500',
    IconoVisual: ({ className = 'w-12 h-12' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-500 shadow-sm`}>
        <Zap size={26} className="animate-pulse" />
      </div>
    ),
  },
  {
    id: 'escudo-racha',
    nombre: 'Escudo de Racha',
    categoria: 'consumibles',
    tipo: 'escudo',
    valor: 1,
    costoAp: 50,
    descripcion: 'Protege tu racha de días activos por 1 día si no puedes ingresar a estudiar. ¡Aprende a tu propio ritmo!',
    rareza: 'Consumible',
    colorRareza: 'text-[var(--brand-emerald)]',
    IconoVisual: ({ className = 'w-12 h-12' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-2 border-[var(--brand-emerald)] text-[var(--brand-emerald)] shadow-sm`}>
        <Shield size={26} className="animate-pulse" />
      </div>
    ),
  },

  // ── 2. Mascotas Acompañantes Oficiales (Únicamente 3 mascotas a 250 AP c/u) ──
  {
    id: 'buho',
    nombre: 'Búho Erudito',
    categoria: 'mascotas',
    tipo: 'mascota',
    valor: 'buho',
    costoAp: 250,
    descripcion: 'Acompaña tus lecturas nocturnas y te susurra ánimos antes de cada desafío.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-[var(--brand-primary)]',
    imagenSrc: '/images/mascotas/buho.png',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 p-1 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/buho.png" alt="Búho Erudito" className="w-full h-full object-cover rounded-xl" />
      </div>
    ),
  },
  {
    id: 'dragon',
    nombre: 'Dragón Guardián',
    categoria: 'mascotas',
    tipo: 'mascota',
    valor: 'dragon',
    costoAp: 250,
    descripcion: 'Pequeño dragón guardián que enciende tu motivación y coraje en cada batalla.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-orange-500',
    imagenSrc: '/images/mascotas/dragon.png',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-orange-500/10 border-2 border-orange-500/40 p-1 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/dragon.png" alt="Dragón Guardián" className="w-full h-full object-cover rounded-xl" />
      </div>
    ),
  },
  {
    id: 'gato',
    nombre: 'Gato Místico',
    categoria: 'mascotas',
    tipo: 'mascota',
    valor: 'gato',
    costoAp: 250,
    descripcion: 'Fiel compañero felino lleno de cariño y serenidad para tus horas de estudio.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-pink-500',
    imagenSrc: '/images/mascotas/gato.png',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-pink-500/10 border-2 border-pink-500/40 p-1 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/gato.png" alt="Gato Místico" className="w-full h-full object-cover rounded-xl" />
      </div>
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
