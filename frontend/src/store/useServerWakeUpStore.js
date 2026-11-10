import { create } from 'zustand';

/**
 * useServerWakeUpStore — Estado del modal amigable de despertar del servidor (Cold Start)
 *
 * Se activa cuando una petición al backend demora más de lo normal o recibe un 502/503
 * debido a que el servidor gratuito de Render se encuentra en reposo para ahorrar energía.
 */
export const useServerWakeUpStore = create((set) => ({
  isOpen: false,
  mensaje: 'Despertando el servidor del reino...',
  onRetry: null,
  onCancel: null,

  abrirModal: ({ mensaje, onRetry, onCancel } = {}) =>
    set({
      isOpen: true,
      mensaje: mensaje || 'El servidor del reino se está despertando...',
      onRetry: onRetry || null,
      onCancel: onCancel || null,
    }),

  cerrarModal: () =>
    set({
      isOpen: false,
      onRetry: null,
      onCancel: null,
    }),
}));

export default useServerWakeUpStore;
