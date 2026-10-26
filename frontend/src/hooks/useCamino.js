import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alumnosApi, misionesApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

/**
 * useCaminoAlumno — Obtiene el grafo DAG de misiones activas para el alumno autenticado.
 * Endpoint: GET /api/alumnos/camino/{aulaId}
 * Retorna: { nodos: [ { misionId, temaCurricular, tipoPlantilla, estado, nivel, resuelta } ], aristas: [ { origen, destino } ] }
 */
export function useCaminoAlumno() {
  const aulaId = useSessionStore((s) => s.aulaActivaId);

  return useQuery({
    queryKey: ['camino-alumno', aulaId],
    queryFn: () => alumnosApi.getCamino(aulaId),
    enabled: Boolean(aulaId),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * useCaminoDocente — Obtiene el grafo DAG de todas las misiones del aula para el docente.
 * Endpoint: GET /api/misiones/aulas/{aulaId}/camino
 */
export function useCaminoDocente(customAulaId) {
  const storeAulaId = useSessionStore((s) => s.aulaActivaId);
  const aulaId = customAulaId || storeAulaId;

  return useQuery({
    queryKey: ['camino-docente', aulaId],
    queryFn: () => misionesApi.getCaminoDocente(aulaId),
    enabled: Boolean(aulaId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * useDefinirSugeridas — Actualiza las misiones sugeridas a continuación de una misión (Docente).
 * Endpoint: PUT /api/misiones/{id}/sugeridas
 * Body: { misionesSugeridas: [guid1, guid2] }
 */
export function useDefinirSugeridas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ misionId, misionesSugeridas }) => {
      return await misionesApi.definirSugeridas(misionId, { misionesSugeridas });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camino-docente'] });
      queryClient.invalidateQueries({ queryKey: ['camino-alumno'] });
      queryClient.invalidateQueries({ queryKey: ['misiones-activas'] });
    },
  });
}

/**
 * useOcultarMision — Oculta una misión activa del tablero del alumno (Docente).
 * Endpoint: POST /api/misiones/{id}/ocultar
 */
export function useOcultarMision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (misionId) => {
      return await misionesApi.ocultar(misionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camino-docente'] });
      queryClient.invalidateQueries({ queryKey: ['camino-alumno'] });
      queryClient.invalidateQueries({ queryKey: ['misiones-activas'] });
    },
  });
}

/**
 * useRepublicarMision — Vuelve a publicar una misión oculta (Docente).
 * Endpoint: POST /api/misiones/{id}/republicar
 */
export function useRepublicarMision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (misionId) => {
      return await misionesApi.republicar(misionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camino-docente'] });
      queryClient.invalidateQueries({ queryKey: ['camino-alumno'] });
      queryClient.invalidateQueries({ queryKey: ['misiones-activas'] });
    },
  });
}
