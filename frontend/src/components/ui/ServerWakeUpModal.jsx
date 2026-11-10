import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coffee, ShieldCheck, Heart, RefreshCw, X } from 'lucide-react';
import useServerWakeUpStore from '../../store/useServerWakeUpStore';
import { playChime } from '../../utils/audio';

/**
 * Secuencia de kaomojis tiernos y fases de despertar
 */
const FASES_DESPERTAR = [
  {
    kaomoji: '(っ˘ω˘ς ) 💤',
    titulo: '¡Despertando el Reino!',
    descripcion: 'Los guardianes estaban tomando una pequeña siesta para cuidar la energía del reino. ¡Ya encendieron las antorchas!',
    subtexto: 'Iniciando contenedores mágicos en la nube...',
    colorAura: 'rgba(251, 191, 36, 0.2)',
    icono: Sparkles,
  },
  {
    kaomoji: '( ˶• ᵕ •˶ ) ☕',
    titulo: 'Sirviendo pociones de energía...',
    descripcion: 'Preparando los grimorios y afinando las conexiones con la torre de hechicería.',
    subtexto: 'Conectando con la base de datos de aventureros...',
    colorAura: 'rgba(244, 114, 182, 0.2)',
    icono: Coffee,
  },
  {
    kaomoji: '(๑ > ᴗ < ๑) 🛡️',
    titulo: '¡Casi listos para la aventura!',
    descripcion: 'Acomodando los pupitres del aula y lustrando los escudos de aprendizaje.',
    subtexto: 'Los servidores ya están casi a temperatura óptima...',
    colorAura: 'rgba(96, 165, 250, 0.2)',
    icono: ShieldCheck,
  },
  {
    kaomoji: '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',
    titulo: '¡Portales casi abiertos!',
    descripcion: '¡Todo listo! En unos breves instantes vas a poder ingresar a tu aula.',
    subtexto: '¡Gracias por tu paciencia de aventurero ejemplar!',
    colorAura: 'rgba(52, 211, 153, 0.25)',
    icono: Heart,
  },
];

export default function ServerWakeUpModal() {
  const { isOpen, mensaje, onRetry, onCancel, cerrarModal } = useServerWakeUpStore();
  const [segundos, setSegundos] = useState(0);
  const [faseIdx, setFaseIdx] = useState(0);

  // Estimación de arranque en frío de Render: ~35 segundos
  const MAX_SEGUNDOS_ESTIMADOS = 35;
  const porcentaje = Math.min(Math.round((segundos / MAX_SEGUNDOS_ESTIMADOS) * 100), 98);

  useEffect(() => {
    if (!isOpen) {
      setSegundos(0);
      setFaseIdx(0);
      return;
    }

    playChime(659.25); // Sonido alegre al abrir

    const timer = setInterval(() => {
      setSegundos((s) => {
        const next = s + 1;
        if (next < 10) setFaseIdx(0);
        else if (next < 20) setFaseIdx(1);
        else if (next < 30) setFaseIdx(2);
        else setFaseIdx(3);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const fase = FASES_DESPERTAR[faseIdx];
  const IconoFase = fase.icono;

  const handleCancelar = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
    cerrarModal();
  };

  const handleReintentar = () => {
    playChime(880);
    if (typeof onRetry === 'function') {
      onRetry();
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wake-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className={[
            'relative w-full max-w-md overflow-hidden text-center p-6 sm:p-8',
            'rounded-[28px_36px_30px_34px]',
            'bg-gradient-to-b from-[var(--bg-panel)] via-[var(--bg-muted)] to-[var(--bg-panel)]',
            'border-3 border-[var(--border)]',
            'shadow-[6px_6px_0px_var(--border)]',
          ].join(' ')}
          style={{
            boxShadow: '6px 6px 0px var(--border)',
          }}
        >
          {/* Botón de cierre discreto */}
          <button
            type="button"
            onClick={handleCancelar}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors cursor-pointer"
            aria-label="Cerrar aviso"
          >
            <X size={18} />
          </button>

          {/* Partículas decorativas tiernas flotantes */}
          <motion.div
            animate={{
              y: [-4, 4, -4],
              rotate: [0, 8, -8, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-3 left-5 text-xl opacity-60 select-none"
          >
            🌸
          </motion.div>
          <motion.div
            animate={{
              y: [4, -4, 4],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-8 right-12 text-lg opacity-60 select-none"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{
              y: [-3, 3, -3],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-5 left-6 text-lg opacity-60 select-none"
          >
            ⭐
          </motion.div>

          {/* Tarjeta central del Kaomoji con aura */}
          <div className="relative flex justify-center mb-5 mt-2">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                y: [0, -6, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative px-6 py-5 rounded-[22px_28px_20px_26px] border-2 border-[var(--border)] bg-[var(--bg-accent)] shadow-[3px_3px_0px_var(--border)]"
              style={{
                backgroundColor: 'var(--bg-accent)',
                boxShadow: `0 0 25px ${fase.colorAura}, 3px 3px 0px var(--border)`,
              }}
            >
              {/* Kaomoji animado */}
              <span className="font-display font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-wider block drop-shadow-sm select-none">
                {fase.kaomoji}
              </span>
            </motion.div>
          </div>

          {/* Título y descripción */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-display font-bold uppercase tracking-widest text-[var(--brand-primary)] mb-1">
            <IconoFase size={14} className="animate-pulse" />
            <span>{fase.titulo}</span>
          </div>

          <h2
            id="wake-modal-title"
            className="font-display font-black text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight mb-2"
          >
            {mensaje || 'Iniciando el Servidor del Aula'}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4 px-2">
            {fase.descripcion}
          </p>

          {/* Barra de progreso pastel animada */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-[11px] font-display font-bold text-[var(--text-muted)] mb-1.5 px-1">
              <span>{fase.subtexto}</span>
              <span className="font-mono text-[var(--brand-primary)]">{segundos}s</span>
            </div>

            <div className="h-3 w-full bg-[var(--bg-accent)] rounded-full overflow-hidden border border-[var(--border-muted)] p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 shadow-sm"
                initial={{ width: '4%' }}
                animate={{ width: `${Math.max(porcentaje, 6)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Nota ecológica / tierna sobre el modo reposo */}
          <div className="p-2.5 rounded-xl bg-[var(--bg-accent)]/60 border border-[var(--border-muted)] text-[11px] text-[var(--text-muted)] leading-tight mb-5">
            🌱 <strong className="text-[var(--text-primary)]">Modo Ecológico Activo:</strong> Tu campus virtual duerme cuando no hay alumnos conectados para cuidar el planeta y los recursos. ¡Solo tarda unos segundos en despertar!
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 justify-center">
            <button
              type="button"
              onClick={handleCancelar}
              className="px-4 py-2 rounded-xl text-xs font-display font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] border border-transparent hover:border-[var(--border-muted)] transition-all cursor-pointer"
            >
              Cerrar y esperar
            </button>

            {onRetry && (
              <button
                type="button"
                onClick={handleReintentar}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-bold text-white bg-[var(--brand-primary)] hover:brightness-110 shadow-[2px_2px_0px_var(--border)] border border-[var(--border)] transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <RefreshCw size={12} className="animate-spin" />
                <span>Probar conexión</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
