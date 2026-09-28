import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aulasApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';
import { playSuccess } from '../utils/audio';

const AULAS_DEFAULT = [
  {
    aulaId: '33333333-3333-3333-3333-333333333333',
    nombre: 'Laboratorio de Sistemas',
    codigoInvitacion: 'AR92K8X4',
  },
  {
    aulaId: '55555555-5555-5555-5555-555555555555',
    nombre: 'Programación Web y Algoritmos',
    codigoInvitacion: 'PW2026X1',
  },
];

export function useMisAulas() {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const setCodigoInvitacion = useSessionStore((s) => s.setCodigoInvitacion);

  return useQuery({
    queryKey: ['aulas', 'mis-aulas', usuario?.usuarioId],
    queryFn: async () => {
      try {
        const data = await aulasApi.getMisAulas();
        if (Array.isArray(data) && data.length > 0) {
          // Sincronizar código de invitación del aula activa si coincide
          const activa = data.find((a) => a.aulaId === aulaActivaId);
          if (activa?.codigoInvitacion) {
            setCodigoInvitacion(activa.codigoInvitacion);
          }
          return data;
        }
        return AULAS_DEFAULT;
      } catch (err) {
        if (!err.isApiError) {
          return AULAS_DEFAULT;
        }
        throw err;
      }
    },
    enabled: Boolean(usuario),
  });
}

export function useCrearAula() {
  const queryClient = useQueryClient();
  const setAulaActivaId = useSessionStore((s) => s.setAulaActivaId);
  const setCodigoInvitacion = useSessionStore((s) => s.setCodigoInvitacion);

  return useMutation({
    mutationFn: async ({ nombre }) => {
      try {
        return await aulasApi.crearAula({ nombre });
      } catch (err) {
        if (!err.isApiError) {
          // Mock fallback
          return {
            aulaId: 'mock-aula-' + Date.now(),
            nombre,
            codigoInvitacion: 'AULA' + Math.floor(1000 + Math.random() * 9000),
            esDocente: true,
          };
        }
        throw err;
      }
    },
    onSuccess: (nuevaAula) => {
      playSuccess();
      if (nuevaAula?.aulaId) {
        setAulaActivaId(nuevaAula.aulaId);
        setCodigoInvitacion(nuevaAula.codigoInvitacion);
      }
      queryClient.invalidateQueries({ queryKey: ['aulas', 'mis-aulas'] });
    },
  });
}

export function useUnirseAula() {
  const queryClient = useQueryClient();
  const setAulaActivaId = useSessionStore((s) => s.setAulaActivaId);
  const setCodigoInvitacion = useSessionStore((s) => s.setCodigoInvitacion);

  return useMutation({
    mutationFn: async ({ codigoInvitacion }) => {
      try {
        return await aulasApi.unirseAula({ codigoInvitacion });
      } catch (err) {
        if (!err.isApiError) {
          return {
            aulaId: '33333333-3333-3333-3333-333333333333',
            nombre: 'Laboratorio de Sistemas',
            codigoInvitacion,
          };
        }
        throw err;
      }
    },
    onSuccess: (aula) => {
      playSuccess();
      if (aula?.aulaId) {
        setAulaActivaId(aula.aulaId);
        setCodigoInvitacion(aula.codigoInvitacion);
      }
      queryClient.invalidateQueries({ queryKey: ['aulas', 'mis-aulas'] });
      queryClient.invalidateQueries({ queryKey: ['misiones'] });
      queryClient.invalidateQueries({ queryKey: ['personaje'] });
    },
  });
}
