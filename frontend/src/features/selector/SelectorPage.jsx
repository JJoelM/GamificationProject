import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Swords } from 'lucide-react';
import useSessionStore from '../../store/useSessionStore';
import ArtFrame from '../../components/ui/ArtFrame';
import ThemeToggle from '../../components/layout/ThemeToggle';

/**
 * SelectorPage — Ruta /
 *
 * NO es un login real. Simplemente elige el rol de la sesión mockeada.
 * Los IDs ya viven en useSessionStore (cargados desde .env).
 *
 * El usuario elige:
 * · "Entrar como Docente" → setRol('docente') → navega a /docente/dashboard
 * · "Entrar como Alumno"  → setRol('alumno')  → navega a /alumno/dashboard
 */

const ROLES = [
  {
    id: 'docente',
    label: 'Docente',
    sublabel: 'Crear y validar misiones',
    route: '/docente/dashboard',
    Icon: BookOpen,
    artLabel: 'Ilustración: Docente mago / mentor',
    artShape: 'scroll',
    // Hover: violeta en light mode, dorado en dark mode
    colorClass: 'hover:border-[var(--brand-primary)] hover:shadow-[6px_6px_0px_var(--brand-primary)] dark:hover:border-[var(--brand-gold)] dark:hover:shadow-[6px_6px_0px_var(--brand-gold)]',
    // Ícono uniforme: fondo violeta + ícono dorado
    iconBg: 'bg-[var(--brand-primary)]',
    iconAccent: '#FCD34D',
  },
  {
    id: 'alumno',
    label: 'Alumno',
    sublabel: 'Completar misiones y ganar XP',
    route: '/alumno/dashboard',
    Icon: GraduationCap,
    artLabel: 'Ilustración: Alumno aventurero',
    artShape: 'scroll',
    // Hover: violeta en light mode, dorado en dark mode
    colorClass: 'hover:border-[var(--brand-primary)] hover:shadow-[6px_6px_0px_var(--brand-primary)] dark:hover:border-[var(--brand-gold)] dark:hover:shadow-[6px_6px_0px_var(--brand-gold)]',
    // Ícono uniforme: fondo violeta + ícono dorado
    iconBg: 'bg-[var(--brand-primary)]',
    iconAccent: '#FCD34D',
  },
];

// Variantes de animación para las cards de rol
const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      type: 'spring',
      stiffness: 260,
      damping: 22,
    },
  }),
};

function SelectorPage() {
  const { setRol } = useSessionStore();
  const navigate = useNavigate();

  const handleSelect = (rol, route) => {
    setRol(rol);
    navigate(route);
  };

  return (
    <div
      className={[
        'min-h-screen flex flex-col items-center justify-center',
        'bg-[var(--bg-base)]',
        'px-4 py-12 relative overflow-hidden',
      ].join(' ')}
    >
      {/* ── ThemeToggle flotante ── */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* ── Decoración de fondo — rombos sutiles ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage: `
            repeating-linear-gradient(-45deg,
              var(--border) 0,
              var(--border) 1px,
              transparent 0,
              transparent 50%
            )
          `,
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Logo + Título ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4 mb-14 text-center"
      >
        {/* Ícono principal — fondo violeta arcano, espadas en dorado */}
        <div
          className={[
            'w-20 h-20 flex items-center justify-center',
            'rounded-[20px_28px_22px_26px]',
            'bg-[var(--brand-primary)]',
            'shadow-[5px_5px_0px_var(--border)] animate-float',
          ].join(' ')}
          aria-hidden="true"
        >
          <Swords size={36} strokeWidth={2} style={{ color: '#FCD34D' }} />
        </div>

        <div>
          <h1
            className={[
              'font-display font-black text-5xl md:text-6xl',
              'text-[var(--text-primary)]',
              'tracking-tight leading-none mb-2',
            ].join(' ')}
          >
            EduQuest
          </h1>
          <p className="text-[var(--text-secondary)] text-lg font-medium">
            Plataforma de Gamificación Educativa
          </p>
        </div>

        {/* Separador decorativo */}
        <div className="flex items-center gap-3 mt-2">
          <div className="h-px w-12 bg-[var(--border-muted)]" />
          <span className="text-xs font-display text-[var(--text-muted)] uppercase tracking-widest">
            Elegí tu rol
          </span>
          <div className="h-px w-12 bg-[var(--border-muted)]" />
        </div>
      </motion.div>

      {/* ── Tarjetas de rol ── */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        {ROLES.map((rol, i) => (
          <motion.button
            key={rol.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            onClick={() => handleSelect(rol.id, rol.route)}
            className={[
              'flex-1 flex flex-col items-center gap-5 p-8 text-center',
              'bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-muted)]',
              'border-2 border-[var(--border)]',
              'rounded-[16px_24px_18px_22px]',
              'shadow-[4px_4px_0px_var(--border)]',
              'transition-all duration-200 ease-out cursor-pointer',
              rol.colorClass,
              'hover:-translate-y-2 active:translate-y-0 active:shadow-[2px_2px_0px_var(--border)]',
              'focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] focus-visible:outline-offset-3',
            ].join(' ')}
            aria-label={`Entrar como ${rol.label}`}
          >
            {/* ArtFrame del personaje (scroll shape) */}
            <ArtFrame
              label={rol.artLabel}
              shape="scroll"
              aspectRatio="1/1"
              className="w-32"
            />

            {/* Ícono de rol — color uniforme RPG */}
            <div
              className={[
                'w-12 h-12 flex items-center justify-center -mt-2',
                'rounded-[10px_14px_12px_12px]',
                rol.iconBg,
                'shadow-[2px_2px_0px_var(--border)]',
              ].join(' ')}
              aria-hidden="true"
            >
              <rol.Icon
                size={22}
                strokeWidth={2.5}
                style={{ color: rol.iconAccent }}
              />
            </div>

            {/* Texto */}
            <div>
              <p className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">
                {rol.label}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">{rol.sublabel}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Footer indicativo ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-xs text-[var(--text-muted)] font-display uppercase tracking-wider"
      >
        Modo desarrollo · IDs mockeados
      </motion.p>
    </div>
  );
}

export default SelectorPage;
