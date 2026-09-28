import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSessionStore from '../../store/useSessionStore';
import { playChime } from '../../utils/audio';

/**
 * SoundToggle — Control de sonido para activar/silenciar audio procedural
 */
function SoundToggle() {
  const { soundEnabled, toggleSound } = useSessionStore();

  const handleToggle = () => {
    toggleSound();
    if (!soundEnabled) {
      setTimeout(() => playChime(), 50);
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={soundEnabled ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido'}
      title={soundEnabled ? 'Efectos de sonido activados' : 'Sonido silenciado'}
      className={[
        'relative w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer',
        'border border-[var(--border-muted)]',
        'bg-[var(--bg-muted)]',
        'hover:bg-[var(--bg-accent)] hover:border-[var(--border-accent)]',
        'transition-colors duration-200',
        'overflow-hidden',
      ].join(' ')}
    >
      <AnimatePresence mode="wait" initial={false}>
        {soundEnabled ? (
          <motion.span
            key="sound-on"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="text-[var(--brand-primary)]"
          >
            <Volume2 size={18} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="sound-off"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="text-[var(--text-muted)] opacity-60"
          >
            <VolumeX size={18} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export default SoundToggle;
