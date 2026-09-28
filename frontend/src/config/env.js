// Único punto de acceso a las variables de entorno de Vite.
// Ningún componente debe importar import.meta.env directamente.

// En desarrollo con Vite, si está vacío usa rutas relativas ('') que pasan por el proxy de Vite hacia el backend en :5230
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const MOCK_IDS = {
  docenteId: import.meta.env.VITE_MOCK_DOCENTE_ID,
  alumnoId: import.meta.env.VITE_MOCK_ALUMNO_ID,
  aulaId: import.meta.env.VITE_MOCK_AULA_ID,
};
