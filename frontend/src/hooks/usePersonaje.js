import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { alumnosApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

/**
 * usePersonaje — Sincroniza el progreso del alumno (XP, AP, Racha, Inventario, Cosméticos) con el backend
 * GET /api/alumnos/personaje/{aulaId}
 */
export function usePersonaje() {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaId = useSessionStore((s) => s.aulaActivaId);
  const hidratarProgreso = useSessionStore((s) => s.hidratarProgreso);

  const query = useQuery({
    queryKey: ['personaje', aulaId, usuario?.usuarioId],
    queryFn: async () => {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        const state = useSessionStore.getState();
        return {
          experienciaXP: state.xpTotal ?? 150,
          puntosAccionAP: state.apTotal ?? 75,
          rachaDiasActivos: state.rachaDias ?? 3,
          escudosRachaDisponibles: state.escudosRachaDisponibles ?? state.escudosRacha ?? 1,
          avatarEquipado: state.avatarEquipado || 'erudito_arcano',
          marcoEquipado: state.marcoEstilo || 'orlado_dorado',
          mascotaEquipada: state.mascotaEquipada || 'buho_erudito',
          tituloEquipado: state.tituloEquipado || 'Centinela del Saber',
          cosmeticosComprados: state.cosmeticosComprados?.length
            ? state.cosmeticosComprados
            : ['mascota_buho_erudito', 'marco_orlado_dorado', 'titulo_centinela'],
          aulaId,
          alumnoId: usuario?.usuarioId || '22222222-2222-2222-2222-222222222222',
        };
      }
      return await alumnosApi.getPersonaje(aulaId);
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
