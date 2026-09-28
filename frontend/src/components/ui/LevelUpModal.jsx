import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, Trophy, ArrowRight, Check } from 'lucide-react';
import useSessionStore from '../../store/useSessionStore';
import Button from './Button';
import XpParticleBurst from './XpParticleBurst';
import { playLevelUp } from '../../utils/audio';

/**
 * LevelUpModal — Celebración de Subida de Nivel y Desbloqueo de Título
 */
function LevelUpModal() {
  const levelUpPendiente = useSessionStore((s) => s.levelUpPendiente);
  const cerrarLevelUp = useSessionStore((s) => s.cerrarLevelUp);

  useEffect(() => {
    if (levelUpPendiente) {
      playLevelUp();
    }
  }, [levelUpPendiente]);

  if (!levelUpPendiente) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="levelup-title"
      >
        <XpParticleBurst />

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          className={[
            'relative w-full max-w-lg p-8 rounded-[24px_32px_26px_30px]',
            'bg-gradient-to-b from-[var(--bg-panel)] to-[var(--bg-muted)]',
            'border-3 border-[var(--brand-gold)]',
            'shadow-[0_20px_60px_rgba(0,0,0,0.5),6px_6px_0px_var(--brand-gold)]',
            'text-center flex flex-col items-center gap-5',
          ].join(' ')}
        >
          {/* Corona / Ícono de nivel */}
          <motion.div
            animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--brand-gold)] to-[#FCD34D] flex items-center justify-center text-[#1C0A00] shadow-[0_0_24px_rgba(217,119,6,0.6)] border-2 border-white"
          >
            <Trophy size={40} />
          </motion.div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-display font-black uppercase tracking-widest text-[var(--brand-gold)] flex items-center justify-center gap-1.5">
              <Sparkles size={14} /> ¡Subiste de Rango! <Sparkles size={14} />
            </span>
            <h2 id="levelup-title" className="font-display font-black text-4xl text-[var(--text-primary)]">
              ¡Nivel {levelUpPendiente.nivel}!
            </h2>
          </div>

          {/* Nuevo título desbloqueado */}
          <div className="w-full p-4 rounded-[14px_18px_16px_16px] bg-[var(--bg-accent)] border-2 border-[var(--border-muted)] flex flex-col gap-1">
            <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Nuevo Título de Aventurero Desbloqueado
            </span>
            <span className="font-display font-black text-xl text-[var(--brand-primary)]">
              "{levelUpPendiente.titulo}"
            </span>
            <span className="text-xs text-[var(--text-secondary)] mt-1">
              Rango de maestría: <strong className="text-[var(--brand-gold)]">{levelUpPendiente.rango}</strong>
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] max-w-sm">
            Tus respuestas y constancia te han otorgado mayor sabiduría. ¡Tu nuevo título ya es visible para tus compañeros!
          </p>

          <div className="w-full pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
              onClick={cerrarLevelUp}
            >
              <span>¡Continuar la Aventura!</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LevelUpModal;
