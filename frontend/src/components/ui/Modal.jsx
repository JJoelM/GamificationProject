import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal — Dialog accesible con overlay RPG
 *
 * Usa el elemento nativo <dialog> con showModal() para máxima accesibilidad:
 * · Focus trap automático
 * · Escape para cerrar
 * · aria-modal semántico
 *
 * Props:
 * · isOpen       — controla visibilidad
 * · onClose      — callback al cerrar
 * · title        — título del modal (requerido para a11y)
 * · size         — 'sm' | 'md' (default) | 'lg' | 'full'
 * · closeOnBackdrop — cerrar al hacer click fuera (default: true)
 */

const sizeStyles = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  full: 'max-w-5xl',
};

function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  children,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  // Cerrar con Escape (nativo del <dialog>) + notificar al padre
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose?.();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) return;
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      onClose?.();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="modal-title"
      className={[
        'p-0 m-auto w-full border-0 bg-transparent',
        'backdrop:bg-[color-mix(in_oklch,var(--color-dark-bg-base)_70%,transparent)]',
        'backdrop:backdrop-blur-sm',
        sizeStyles[size] ?? sizeStyles.md,
        'open:flex open:flex-col',
      ].join(' ')}
      style={{ maxHeight: '90svh', overflow: 'visible' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={[
              'w-full flex flex-col overflow-hidden',
              'bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-base)]',
              'border-2 border-[var(--border)]',
              'rounded-[16px_22px_18px_20px]',
              'shadow-[var(--shadow-modal)]',
            ].join(' ')}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-muted)]">
              <h2
                id="modal-title"
                className="font-display text-lg font-bold text-[var(--text-primary)]"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className={[
                  'w-8 h-8 flex items-center justify-center rounded-lg text-sm',
                  'text-[var(--text-muted)] border border-[var(--border-muted)]',
                  'hover:bg-[var(--bg-accent)] hover:text-[var(--brand-crimson)] hover:border-[var(--brand-crimson)]',
                  'transition-colors',
                ].join(' ')}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

export default Modal;
