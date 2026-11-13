/**
 * scrollHelper.js — Utilidades de scroll suave accesible y táctil para errores y formularios
 * 
 * Permite centrar automáticamente elementos con error o alertas dentro del viewport
 * y dentro de contenedores con scroll (modales, drawers, tarjetas largas).
 */

export function scrollElementIntoView(elementOrRef, options = {}) {
  const {
    delay = 60,
    behavior = 'smooth',
    block = 'center',
    inline = 'nearest',
    focus = true,
  } = options;

  const target = elementOrRef && 'current' in elementOrRef ? elementOrRef.current : elementOrRef;
  if (!target || typeof target.scrollIntoView !== 'function') return () => {};

  const timer = setTimeout(() => {
    target.scrollIntoView({ behavior, block, inline });
    if (focus && typeof target.focus === 'function') {
      target.focus({ preventScroll: true });
    }
  }, delay);

  return () => clearTimeout(timer);
}

export function scrollToFirstError(
  selector = '[role="alert"], [data-error="true"], input:invalid, .border-red-500',
  options = {}
) {
  if (typeof document === 'undefined') return () => {};
  const el = document.querySelector(selector);
  if (el) {
    return scrollElementIntoView(el, options);
  }
  return () => {};
}
