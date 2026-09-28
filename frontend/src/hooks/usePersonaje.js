import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { alumnosApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

/**
 * usePersonaje — Sincroniza el progreso del alumno (XP, AP, Racha) con el backend
 * GET /api/alumnos/personaje/{aulaId}
 */
export function usePersonaje() {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaId = useSessionStore((s) => s.aulaActivaId);
  const hidratarProgreso = useSessionStore((s) => s.hidratarProgreso);

  const query = useQuery({
    queryKey: ['personaje', aulaId, usuario?.usuarioId],
    queryFn: async () => {
      try {
        return await alumnosApi.getPersonaje(aulaId);
      } catch (err) {
        // En offline, no romper la experiencia, mantener el estado local
        if (!err.isApiError) {
          return null;
        }
        throw err;
      }
    },
    enabled: Boolean(usuario?.rol === 'Alumno' && aulaId),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  useEffect(() => {
    if (query.data) {
      hidratarProgreso(query.data);
    }
  }, [query.data, hidratarProgreso]);

  return query;
}
