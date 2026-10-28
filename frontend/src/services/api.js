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

      if (response.status === 401) {
        errorData.title = errorData.title || 'Sesión no autorizada (っ- ‸ - ς)';
        errorData.detail =
          errorData.detail ||
          'Tu sesión ha expirado o no tienes permisos para acceder a esta aula.';
      }

      if (response.status === 403) {
        errorData.title = errorData.title || 'Acceso restringido (´• ω •`)ﾉ';
        errorData.detail =
          errorData.detail ||
          'No estás inscripto en esta aula o tu sesión no tiene los permisos necesarios (っ- ‸ - ς).';
      }

      if (!errorData.detail && errorData.errors) {
        const errorList = Object.values(errorData.errors).flat();
        if (errorList.length > 0) {
          errorData.detail = errorList.join(' · ');
        }
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
  registrarDocente: ({ email, nombreCompleto, password, aceptaUsoInvestigacion }) =>
    apiFetch('/api/usuarios/registro/docente', {
      method: 'POST',
      body: JSON.stringify({
        email,
        nombreCompleto,
        password,
        aceptaUsoInvestigacion: Boolean(aceptaUsoInvestigacion),
      }),
    }),

  // POST /api/usuarios/registro/alumno
  registrarAlumno: ({ codigoInvitacion, email, nombreCompleto, password, fechaNacimiento, emailTutor, aceptaUsoInvestigacion }) =>
    apiFetch('/api/usuarios/registro/alumno', {
      method: 'POST',
      body: JSON.stringify({
        codigoInvitacion,
        email,
        nombreCompleto,
        password,
        fechaNacimiento,
        emailTutor: emailTutor || null,
        aceptaUsoInvestigacion: Boolean(aceptaUsoInvestigacion),
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

  // GET /api/usuarios/mis-datos (Usuario autenticado vía JWT)
  getMisDatos: () => apiFetch('/api/usuarios/mis-datos'),

  // PUT /api/usuarios/mis-datos (Usuario autenticado vía JWT)
  actualizarMisDatos: ({ nombreCompleto, aceptaUsoInvestigacion }) =>
    apiFetch('/api/usuarios/mis-datos', {
      method: 'PUT',
      body: JSON.stringify({ nombreCompleto, aceptaUsoInvestigacion }),
    }),

  // POST /api/usuarios/mis-datos/cambiar-password
  cambiarPassword: ({ passwordActual, passwordNueva }) =>
    apiFetch('/api/usuarios/mis-datos/cambiar-password', {
      method: 'POST',
      body: JSON.stringify({ passwordActual, passwordNueva }),
    }),

  // DELETE /api/usuarios/mis-datos
  eliminarMiCuenta: () =>
    apiFetch('/api/usuarios/mis-datos', {
      method: 'DELETE',
    }),
};

// ── Servicios de API de Misiones ──
export const misionesApi = {
  // GET /api/misiones/borradores (Docente - propios vía JWT, con filtro opcional de aula)
  getBorradores: (aulaId) =>
    apiFetch(`/api/misiones/borradores${aulaId ? `?aulaId=${aulaId}` : ''}`),

  // GET /api/misiones/activas/{aulaId} (Alumno inscripto)
  getActivas: (aulaId) => apiFetch(`/api/misiones/activas/${aulaId}`),

  // POST /api/misiones/generar-con-ia
  generarConIa: ({ aulaId, temaCurricular, textoFuente, tipoPlantilla }) =>
    apiFetch('/api/misiones/generar-con-ia', {
      method: 'POST',
      body: JSON.stringify({ aulaId, temaCurricular, textoFuente, tipoPlantilla }),
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

  // GET /api/misiones/aulas/{aulaId}/camino (Docente)
  getCaminoDocente: (aulaId) => apiFetch(`/api/misiones/aulas/${aulaId}/camino`),

  // PUT /api/misiones/{id}/sugeridas (Docente)
  definirSugeridas: (id, { misionesSugeridas }) =>
    apiFetch(`/api/misiones/${id}/sugeridas`, {
      method: 'PUT',
      body: JSON.stringify({ misionesSugeridas }),
    }),

  // POST /api/misiones/{id}/ocultar (Docente)
  ocultar: (id) =>
    apiFetch(`/api/misiones/${id}/ocultar`, {
      method: 'POST',
    }),

  // POST /api/misiones/{id}/republicar (Docente)
  republicar: (id) =>
    apiFetch(`/api/misiones/${id}/republicar`, {
      method: 'POST',
    }),
};

// ── Servicios de API de Alumnos ──
export const alumnosApi = {
  // GET /api/alumnos/personaje/{aulaId} (Alumno vía JWT)
  getPersonaje: (aulaId) => apiFetch(`/api/alumnos/personaje/${aulaId}`),

  // GET /api/alumnos/ranking/{aulaId} (Alumno vía JWT)
  getRanking: (aulaId) => apiFetch(`/api/alumnos/ranking/${aulaId}`),

  // GET /api/alumnos/grimorio/{aulaId} (Alumno vía JWT)
  getGrimorio: (aulaId) => apiFetch(`/api/alumnos/grimorio/${aulaId}`),

  // GET /api/alumnos/bazar/catalogo
  getCatalogoBazar: () => apiFetch('/api/alumnos/bazar/catalogo'),

  // POST /api/alumnos/bazar/{aulaId}/comprar
  // Body: { articuloId }
  comprarArticulo: (aulaId, { articuloId }) =>
    apiFetch(`/api/alumnos/bazar/${aulaId}/comprar`, {
      method: 'POST',
      body: JSON.stringify({
        articuloId,
      }),
    }),

  // PUT /api/alumnos/personaje/{aulaId}/personalizacion
  // Body: { avatarId, marco, mascota, titulo }
  personalizarPersonaje: (aulaId, { avatarId, marco, mascota, titulo }) =>
    apiFetch(`/api/alumnos/personaje/${aulaId}/personalizacion`, {
      method: 'PUT',
      body: JSON.stringify({
        avatarId: avatarId ?? null,
        marco: marco ?? null,
        mascota: mascota ?? null,
        titulo: titulo ?? null,
      }),
    }),

  // POST /api/alumnos/misiones/{misionId}/pista (Alumno vía JWT)
  // Body: { indicePregunta, opcionesYaDescartadas }
  usarPista: (misionId, { indicePregunta, opcionesYaDescartadas }) =>
    apiFetch(`/api/alumnos/misiones/${misionId}/pista`, {
      method: 'POST',
      body: JSON.stringify({
        indicePregunta: Number(indicePregunta),
        opcionesYaDescartadas: opcionesYaDescartadas || [],
      }),
    }),

  // GET /api/alumnos/camino/{aulaId} (Alumno vía JWT)
  getCamino: (aulaId) => apiFetch(`/api/alumnos/camino/${aulaId}`),

  // POST /api/alumnos/misiones/{misionId}/resolver (Alumno vía JWT)
  resolverMision: (misionId, { respuestas }) =>
    apiFetch(`/api/alumnos/misiones/${misionId}/resolver`, {
      method: 'POST',
      body: JSON.stringify({ respuestas }),
    }),

  // POST /api/alumnos/misiones/{misionId}/resolver-orden-temporal (Alumno vía JWT)
  resolverOrdenTemporal: (misionId, { ordenPropuesto, eventoCulpableElegido }) =>
    apiFetch(`/api/alumnos/misiones/${misionId}/resolver-orden-temporal`, {
      method: 'POST',
      body: JSON.stringify({ ordenPropuesto, eventoCulpableElegido }),
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

// ── Servicios de API de Docentes ──
export const docentesApi = {
  // GET /api/docentes/metricas/{aulaId} (Docente vía JWT)
  getMetricas: (aulaId) => apiFetch(`/api/docentes/metricas/${aulaId}`),

  // GET /api/docentes/aulas/{aulaId}/alumnos (Docente vía JWT)
  getAlumnos: (aulaId) => apiFetch(`/api/docentes/aulas/${aulaId}/alumnos`),

  // GET /api/docentes/aulas/{aulaDestinoId}/misiones-importables
  getMisionesImportables: (aulaDestinoId) =>
    apiFetch(`/api/docentes/aulas/${aulaDestinoId}/misiones-importables`),

  // POST /api/docentes/aulas/{aulaDestinoId}/importar-misiones
  importarMisiones: (aulaDestinoId, { misionesIds }) =>
    apiFetch(`/api/docentes/aulas/${aulaDestinoId}/importar-misiones`, {
      method: 'POST',
      body: JSON.stringify({ misionesIds }),
    }),
};

// ── Servicios de API de Directivo ──
export const directivoApi = {
  // GET /api/directivo/metricas (Directivo / Admin vía JWT)
  getMetricas: () => apiFetch('/api/directivo/metricas'),
};
