import { useEffect } from 'react';
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
  const setAulaActivaId = useSessionStore((s) => s.setAulaActivaId);
  const setCodigoInvitacion = useSessionStore((s) => s.setCodigoInvitacion);

  const query = useQuery({
    queryKey: ['aulas', 'mis-aulas', usuario?.usuarioId],
    queryFn: async () => {
      try {
        const data = await aulasApi.getMisAulas();
        if (Array.isArray(data)) {
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
    staleTime: 1000 * 30, // 30s
  });

  useEffect(() => {
    if (!query.data || !Array.isArray(query.data)) return;

    if (query.data.length > 0) {
      const activa = query.data.find((a) => a.aulaId === aulaActivaId);
      if (activa) {
        if (activa.codigoInvitacion && activa.codigoInvitacion !== useSessionStore.getState().codigoInvitacionAula) {
          setCodigoInvitacion(activa.codigoInvitacion);
        }
      } else {
        // El aula activa almacenada no pertenece a este usuario o es null:
        // Asignar inmediatamente la primera aula válida del usuario autenticado
        setAulaActivaId(query.data[0].aulaId);
        if (query.data[0].codigoInvitacion) {
          setCodigoInvitacion(query.data[0].codigoInvitacion);
        }
      }
    } else if (usuario?.rol !== 'Directivo' && usuario?.rol !== 'Administrador') {
      if (aulaActivaId !== null) {
        setAulaActivaId(null);
        setCodigoInvitacion(null);
      }
    }
  }, [query.data, aulaActivaId, setAulaActivaId, setCodigoInvitacion, usuario?.rol]);

  return query;
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
      queryClient.invalidateQueries({ queryKey: ['misiones'] });
      queryClient.invalidateQueries({ queryKey: ['personaje'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['grimorio'] });
      queryClient.invalidateQueries({ queryKey: ['camino-alumno'] });
      queryClient.invalidateQueries({ queryKey: ['camino-docente'] });
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
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['grimorio'] });
      queryClient.invalidateQueries({ queryKey: ['camino-alumno'] });
      queryClient.invalidateQueries({ queryKey: ['camino-docente'] });
    },
  });
}
