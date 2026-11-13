// Único punto de acceso a las variables de entorno de Vite.
// Ningún componente debe importar import.meta.env directamente.

// En desarrollo con Vite, si está vacío usa rutas relativas ('') que pasan por el proxy de Vite hacia el backend en :5230
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// URL opcional del backend para enviar únicamente un ping GET /health (mode: 'no-cors')
// cuando el proxy de Cloudflare devuelva 502/503 por suspensión en frío de Render.
export const BACKEND_WAKEUP_URL = (import.meta.env.VITE_BACKEND_WAKEUP_URL || '').replace(/\/+$/, '');

export const MOCK_IDS = {
  docenteId: import.meta.env.VITE_MOCK_DOCENTE_ID,
  alumnoId: import.meta.env.VITE_MOCK_ALUMNO_ID,
  aulaId: import.meta.env.VITE_MOCK_AULA_ID,
};
