import { useQuery } from '@tanstack/react-query';
import { alumnosApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';
import { FICHAS_GRIMORIO } from '../features/alumno/components/GrimorioData';

/**
 * useGrimorioAula — Consulta el compendio de fichas curriculares desbloqueadas del aula.
 * GET /api/alumnos/grimorio/{aulaId}
 */

export function useGrimorioAula(aulaIdOverride) {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const aulaId = aulaIdOverride || aulaActivaId;

  return useQuery({
    queryKey: ['grimorio', aulaId, usuario?.usuarioId],
    queryFn: async () => {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        const state = useSessionStore.getState();
        const misionesResueltas = state.misionesResueltas || {};

        const fichas = FICHAS_GRIMORIO.map((f, idx) => {
          const resuelta = misionesResueltas[f.misionIdAsociada];
          // En modo mock, desbloquear al menos la primera ficha para testing interactivo
          const desbloqueada = idx === 0 || Boolean(resuelta?.completada);
          return {
            fichaId: f.id,
            misionId: f.misionIdAsociada,
            temaCurricular: f.temaCurricular,
            narrativa: f.resumenConceptual,
            conceptosClave: f.conceptosClave.map((c) => `${c.termino}: ${c.definicion}`),
            desbloqueada,
          };
        });

        return {
          fichas,
          totalDesbloqueadas: fichas.filter((f) => f.desbloqueada).length,
          total: fichas.length,
        };
      }

      return await alumnosApi.getGrimorio(aulaId);
    },
    enabled: Boolean(usuario?.rol === 'Alumno' && aulaId),
    staleTime: 1000 * 60 * 2,
  });
}
