import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal — Diálogo centrado accesible con estilo Painterly RPG y responsivo en móviles.
 *
 * Mejoras:
 * - Implementado con <dialog> nativo de HTML5 para mejor a11y (focus trap, Escape).
 * - Animación de entrada/salida táctil tipo "papiro desplegado" con Framer Motion.
 * - Backdrop oscuro estilizado.
 * - Bordes asimétricos con variables CSS del tema actual.
 * - Ajuste fluido en pantallas móviles (max-w-[calc(100vw-1.5rem)]).
 */

const sizeStyles = {
  sm:   'sm:max-w-sm',
  md:   'sm:max-w-lg',
  lg:   'sm:max-w-2xl',
  full: 'sm:max-w-5xl',
};

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="modal-title"
      className={[
        'p-0 m-auto w-[calc(100vw-1.5rem)] sm:w-full max-w-[calc(100vw-1.5rem)] border-0 bg-transparent text-[var(--text-primary)]',
        'backdrop:bg-[color-mix(in_oklch,var(--color-dark-bg-base)_70%,transparent)]',
        'backdrop:backdrop-blur-sm',
        sizeStyles[size] ?? sizeStyles.md,
        'open:flex open:flex-col',
      ].join(' ')}
      style={{ maxHeight: '92svh', color: 'var(--text-primary)' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={[
              'w-full flex flex-col max-h-[90svh] overflow-hidden text-[var(--text-primary)]',
              'bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-base)]',
              'border-2 border-[var(--border)]',
              'rounded-[16px_22px_18px_20px]',
              'shadow-[var(--shadow-modal)]',
            ].join(' ')}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border-muted)] gap-2">
              <h2
                id="modal-title"
                className="font-display text-sm sm:text-base md:text-lg font-bold text-[var(--text-primary)] truncate"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className={[
                  'w-8 h-8 flex items-center justify-center rounded-lg text-sm cursor-pointer shrink-0',
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
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 text-[var(--text-primary)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

export default Modal;
