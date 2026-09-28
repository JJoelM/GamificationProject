import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSessionStore from '../../store/useSessionStore';

/**
 * ThemeToggle — Botón de alternancia Claro/Oscuro
 * Anima el ícono Sol → Luna con morph circular (Framer Motion)
 */
function ThemeToggle() {
  const { theme, toggleTheme } = useSessionStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={[
        'relative w-10 h-10 flex items-center justify-center rounded-lg',
        'border border-[var(--border-muted)]',
        'bg-[var(--bg-muted)]',
        'hover:bg-[var(--bg-accent)] hover:border-[var(--border-accent)]',
        'transition-colors duration-200',
        'overflow-hidden',
      ].join(' ')}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute flex items-center justify-center text-[var(--brand-gold)]"
          >
            <Moon size={18} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute flex items-center justify-center text-[var(--brand-gold)]"
          >
            <Sun size={18} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default ThemeToggle;
