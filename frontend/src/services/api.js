import { API_BASE_URL } from '../config/env';

/**
 * apiFetch — Wrapper para fetch con soporte de cookies HttpOnly y ProblemDetails
 *
 * ESPECIFICACIÓN CRÍTICA (spec.md):
 * · Todo request envía `credentials: 'include'` para que el navegador adjunte la cookie `access_token`.
 * · Los IDs de usuario (DocenteId, AlumnoId) NO se envían en bodies ni route params; el backend los extrae del JWT.
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // OBLIGATORIO para enviar la cookie access_token
      headers,
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          title: response.statusText || 'Error en el servidor',
          detail: 'Error en la respuesta del servidor.',
        };
      }

      const problemError = new Error(errorData.detail || errorData.title || `HTTP Error ${response.status}`);
      problemError.status = response.status;
      problemError.title = errorData.title || 'Error en la solicitud';
      problemError.detail = errorData.detail || '';
      problemError.isApiError = true;
      throw problemError;
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error.isApiError) {
      throw error;
    }
    // Error de red / backend apagado
    const networkError = new Error('No pudimos conectar con el servidor.');
    networkError.status = 0;
    networkError.title = 'Error de conexión';
    networkError.detail = error.message;
    networkError.isApiError = false;
    throw networkError;
  }
}

// ── Servicios de API de Usuarios y Autenticación ──
export const usuariosApi = {
  // POST /api/usuarios/login
  login: ({ email, password }) =>
    apiFetch('/api/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // POST /api/usuarios/logout
  logout: () =>
    apiFetch('/api/usuarios/logout', {
      method: 'POST',
    }),

  // POST /api/usuarios/registro/docente
  registrarDocente: ({ email, nombreCompleto, password }) =>
    apiFetch('/api/usuarios/registro/docente', {
      method: 'POST',
      body: JSON.stringify({ email, nombreCompleto, password }),
    }),

  // POST /api/usuarios/registro/alumno
  registrarAlumno: ({ codigoInvitacion, email, nombreCompleto, password, fechaNacimiento, emailTutor }) =>
    apiFetch('/api/usuarios/registro/alumno', {
      method: 'POST',
      body: JSON.stringify({
        codigoInvitacion,
        email,
        nombreCompleto,
        password,
        fechaNacimiento,
        emailTutor: emailTutor || null,
      }),
    }),

  // GET /api/usuarios/docentes (Directivo / Admin)
  getDocentes: () => apiFetch('/api/usuarios/docentes'),

  // POST /api/usuarios/{usuarioId}/estado (Directivo / Admin)
  cambiarEstado: (usuarioId, { nuevoEstado }) =>
    apiFetch(`/api/usuarios/${usuarioId}/estado`, {
      method: 'POST',
      body: JSON.stringify({ nuevoEstado }),
    }),
};

// ── Servicios de API de Misiones ──
export const misionesApi = {
  // GET /api/misiones/borradores (Docente - propios vía JWT)
  getBorradores: () => apiFetch('/api/misiones/borradores'),

  // GET /api/misiones/activas/{aulaId} (Alumno inscripto)
  getActivas: (aulaId) => apiFetch(`/api/misiones/activas/${aulaId}`),

  // POST /api/misiones/generar-con-ia
  generarConIa: ({ aulaId, temaCurricular, textoFuente }) =>
    apiFetch('/api/misiones/generar-con-ia', {
      method: 'POST',
      body: JSON.stringify({ aulaId, temaCurricular, textoFuente }),
    }),

  // PUT /api/misiones/{id}/editar
  editar: (id, { narrativa, payloadJson, recompensaXp }) =>
    apiFetch(`/api/misiones/${id}/editar`, {
      method: 'PUT',
      body: JSON.stringify({
        narrativa,
        payloadJson: typeof payloadJson === 'string' ? payloadJson : JSON.stringify(payloadJson),
        recompensaXp: Number(recompensaXp),
      }),
    }),

  // POST /api/misiones/{id}/validar (sin body)
  validar: (id) =>
    apiFetch(`/api/misiones/${id}/validar`, {
      method: 'POST',
    }),

  // POST /api/misiones/{id}/rechazar
  rechazar: (id, { motivo }) =>
    apiFetch(`/api/misiones/${id}/rechazar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    }),
};

// ── Servicios de API de Alumnos ──
export const alumnosApi = {
  // GET /api/alumnos/personaje/{aulaId} (Alumno vía JWT)
  getPersonaje: (aulaId) => apiFetch(`/api/alumnos/personaje/${aulaId}`),

  // POST /api/alumnos/misiones/{misionId}/resolver (Alumno vía JWT)
  resolverMision: (misionId, { respuestas }) =>
    apiFetch(`/api/alumnos/misiones/${misionId}/resolver`, {
      method: 'POST',
      body: JSON.stringify({ respuestas }),
    }),
};

// ── Servicios de API de Aulas ──
export const aulasApi = {
  // GET /api/aulas/mis-aulas
  getMisAulas: () => apiFetch('/api/aulas/mis-aulas'),

  // POST /api/aulas (Docente)
  crearAula: ({ nombre }) =>
    apiFetch('/api/aulas', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    }),

  // POST /api/aulas/unirse (Alumno)
  unirseAula: ({ codigoInvitacion }) =>
    apiFetch('/api/aulas/unirse', {
      method: 'POST',
      body: JSON.stringify({ codigoInvitacion }),
    }),
};
