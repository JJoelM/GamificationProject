import React from 'react';
import { BookOpen, Sparkles, Sun, Compass, Cpu, Leaf, Globe, Atom } from 'lucide-react';

/**
 * FICHAS_GRIMORIO — Compendio curricular de conceptos y lecciones del Grimorio del Saber
 */

export const FICHAS_GRIMORIO = [
  {
    id: 'ficha_revolucion_mayo',
    misionIdAsociada: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    temaCurricular: 'Revolución de Mayo y el Cabildo Abierto',
    area: 'Ciencias Sociales e Historia',
    IconoArea: Globe,
    colorTema: '#2563EB',
    resumenConceptual: 'El 25 de mayo de 1810 se constituyó la Primera Junta de Gobierno patrio tras la destitución del virrey Cisneros en el Cabildo Abierto de Buenos Aires, iniciando el camino de la emancipación.',
    conceptosClave: [
      { termino: 'Cabildo Abierto', definicion: 'Asamblea extraordinaria de vecinos convocada en situaciones de gravedad institucional.' },
      { termino: 'Primera Junta', definicion: 'Primer gobierno patrio presidido por Cornelio Saavedra, con Mariano Moreno y Juan José Paso como secretarios.' },
      { termino: 'Soberanía Popular', definicion: 'Principio que establece que el poder reside en el pueblo ante la caída de la monarquía española.' },
    ],
    sabiduriaCurricular: 'La soberanía recuperada por los cabildantes sentó las bases del republicanismo rioplatense.',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <rect x="12" y="24" width="40" height="28" rx="3" fill="#FAF7F1" stroke="#2563EB" strokeWidth="2" />
        {/* Columnas del Cabildo */}
        <line x1="20" y1="30" x2="20" y2="52" stroke="#2563EB" strokeWidth="2" />
        <line x1="28" y1="30" x2="28" y2="52" stroke="#2563EB" strokeWidth="2" />
        <line x1="36" y1="30" x2="36" y2="52" stroke="#2563EB" strokeWidth="2" />
        <line x1="44" y1="30" x2="44" y2="52" stroke="#2563EB" strokeWidth="2" />
        {/* Torre y Campana */}
        <rect x="26" y="12" width="12" height="14" rx="2" fill="#2563EB" />
        <polygon points="32,4 24,12 40,12" fill="#F59E0B" />
        <circle cx="32" cy="18" r="2" fill="#FCD34D" />
      </svg>
    ),
  },
  {
    id: 'ficha_energia_solar',
    misionIdAsociada: 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    temaCurricular: 'Energía Solar y Efecto Fotovoltaico',
    area: 'Física y Tecnología',
    IconoArea: Sun,
    colorTema: '#D97706',
    resumenConceptual: 'La radiación electromagnética emitida por el Sol es transformada directamente en energía eléctrica mediante celdas fotovoltaicas fabricadas con materiales semiconductores como el silicio.',
    conceptosClave: [
      { termino: 'Efecto Fotovoltaico', definicion: 'Fenómeno físico donde los fotones liberan electrones al impactar en un semiconductor.' },
      { termino: 'Energía Renovable', definicion: 'Fuente inagotable que no produce emisiones de gases de efecto invernadero durante su generación.' },
      { termino: 'Inversor Solar', definicion: 'Dispositivo que convierte la corriente continua (DC) generada en corriente alterna (AC).' },
    ],
    sabiduriaCurricular: 'El silicio es el elemento semiconductor más abundante utilizado en paneles solares modernos.',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <circle cx="32" cy="32" r="22" fill="#FEF3C7" />
        <circle cx="32" cy="22" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        {/* Rayos */}
        <line x1="32" y1="6" x2="32" y2="10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="14" x2="22" y2="17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="14" x2="42" y2="17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        {/* Celda fotovoltaica */}
        <polygon points="18,48 46,48 40,36 24,36" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1.5" />
        <line x1="32" y1="36" x2="32" y2="48" stroke="#93C5FD" strokeWidth="1" />
        <line x1="21" y1="42" x2="43" y2="42" stroke="#93C5FD" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'ficha_pensamiento_computacional',
    misionIdAsociada: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    temaCurricular: 'Algoritmos y Estructuras Condicionales',
    area: 'Ciencias de la Computación',
    IconoArea: Cpu,
    colorTema: '#7C3AED',
    resumenConceptual: 'Un algoritmo es una secuencia finita de instrucciones precisas. Las bifurcaciones condicionales (Si-Entonces) permiten tomar decisiones según el estado de las variables.',
    conceptosClave: [
      { termino: 'Algoritmo', definicion: 'Conjunto ordenado de pasos lógicos para resolver un problema determinado.' },
      { termino: 'Condicional (If-Else)', definicion: 'Estructura que bifurca la ejecución del programa según una condición booleana.' },
      { termino: 'Iteración (Bucle)', definicion: 'Repetición controlada de un bloque de código hasta cumplir una condición de fin.' },
    ],
    sabiduriaCurricular: 'La descomposición de problemas complejos en subproblemas es el núcleo del pensamiento algorítmico.',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <svg viewBox="0 0 64 64" className={className} fill="none">
        <circle cx="32" cy="32" r="22" fill="#EDE9FE" />
        <rect x="22" y="22" width="20" height="20" rx="4" fill="#7C3AED" stroke="#5B21B6" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="3" fill="#FDE047" />
        <line x1="32" y1="14" x2="32" y2="22" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="42" x2="32" y2="50" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="32" x2="22" y2="32" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="32" x2="50" y2="32" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];
