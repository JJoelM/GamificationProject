import { useQuery } from '@tanstack/react-query';
import { alumnosApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

/**
 * useRankingAula — Obtiene el ranking de alumnos del aula y el progreso propio del alumno autenticado.
 * GET /api/alumnos/ranking/{aulaId}
 */

const MOCK_RANKING_DATA = (primerNombre, xpTotal, rachaDias, avatarEquipado) => ({
  ranking: [
    {
      nombreCompleto: 'Sofía Valenzuela',
      experienciaXP: Math.max(1240, xpTotal + 200),
      rachaDiasActivos: 5,
      misionesCompletadas: 6,
      avatarEquipado: 'archimago_solar',
      marcoEquipado: 'orlado_dorado',
      mascotaEquipada: 'buho',
      tituloEquipado: 'Erudito Arcano',
      esYo: false,
    },
    {
      nombreCompleto: `${primerNombre || 'Aventurero'} (Tú)`,
      experienciaXP: xpTotal,
      rachaDiasActivos: rachaDias,
      misionesCompletadas: 4,
      avatarEquipado: avatarEquipado || 'avatar_arquera',
      marcoEquipado: 'scroll',
      mascotaEquipada: 'dragon',
      tituloEquipado: 'Centinela del Saber',
      esYo: true,
    },
    {
      nombreCompleto: 'Lucía Fernández',
      experienciaXP: Math.max(450, xpTotal - 150),
      rachaDiasActivos: 3,
      misionesCompletadas: 2,
      avatarEquipado: 'exploradora_reliquias',
      marcoEquipado: 'orlado_dorado',
      mascotaEquipada: 'dragon',
      tituloEquipado: 'Buscador de Respuestas',
      esYo: false,
    },
    {
      nombreCompleto: 'Mateo Benítez',
      experienciaXP: Math.max(320, xpTotal - 280),
      rachaDiasActivos: 2,
      misionesCompletadas: 1,
      avatarEquipado: 'artifice_runico',
      marcoEquipado: 'runa_violeta',
      mascotaEquipada: 'gato',
      tituloEquipado: 'Iniciado del Saber',
      esYo: false,
    },
    {
      nombreCompleto: 'Camila Rojas',
      experienciaXP: Math.max(180, xpTotal - 400),
      rachaDiasActivos: 1,
      misionesCompletadas: 1,
      avatarEquipado: 'alquimista_botanica',
      marcoEquipado: 'cristal_celeste',
      mascotaEquipada: null,
      tituloEquipado: 'Iniciado del Saber',
      esYo: false,
    },
  ].sort((a, b) => b.experienciaXP - a.experienciaXP),
  progresoPropio: {
    xpEstasSemana: xpTotal || 150,
    xpSemanaAnterior: 0,
    porcentajeMejora: 100.0,
    misionesCompletadas: 4,
    rachaDiasActivos: rachaDias || 3,
  },
});

export function useRankingAula(aulaIdOverride) {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const aulaId = aulaIdOverride || aulaActivaId;

  return useQuery({
    queryKey: ['ranking', aulaId, usuario?.usuarioId],
    queryFn: async () => {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        const state = useSessionStore.getState();
        const primerNombre = usuario?.nombreCompleto?.split(' ')[0] ?? 'Aventurero';
        return MOCK_RANKING_DATA(
          primerNombre,
          state.xpTotal || 150,
          state.rachaDias || 3,
          state.avatarEquipado || 'erudito_arcano'
        );
      }
      return await alumnosApi.getRanking(aulaId);
    },
    enabled: Boolean(usuario?.rol === 'Alumno' && aulaId),
    staleTime: 1000 * 60 * 2,
  });
}
