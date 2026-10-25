import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alumnosApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

/**
 * useBazarMutations — Mutaciones para compra de artículos y personalización cosmética del personaje.
 *
 * CQRS:
 * - Compra: POST /api/alumnos/bazar/comprar?aulaId={aulaId}
 * - Personalización: PUT /api/alumnos/personaje/{aulaId}/personalizacion
 * - Ambas invalidan la query ['personaje'] para sincronizar el estado del backend.
 */

export function useComprarArticulo() {
  const queryClient = useQueryClient();
  const aulaId = useSessionStore((s) => s.aulaActivaId);

  return useMutation({
    mutationFn: async ({ articuloId, costoAp, tipo, valor }) => {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        const state = useSessionStore.getState();
        const res = state.comprarArticulo({
          id: articuloId,
          costoAp,
          tipo: tipo.toLowerCase(),
          valor,
        });
        if (!res.exito) {
          const err = new Error(res.motivo || 'No tienes suficientes AP.');
          err.status = 409;
          throw err;
        }
        return { exito: true };
      }

      return await alumnosApi.comprarArticulo(aulaId, {
        articuloId,
        costoAp,
        tipo,
        valor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personaje'] });
    },
    onError: (error) => {
      if (error?.status === 409) {
        error.mensajeAmigable =
          error.detail || 'AP insuficientes o este artículo ya fue adquirido en el aula.';
      } else {
        error.mensajeAmigable =
          error.detail || error.message || 'No se pudo completar la compra en el Bazar.';
      }
    },
  });
}

export function usePersonalizarPersonaje() {
  const queryClient = useQueryClient();
  const aulaId = useSessionStore((s) => s.aulaActivaId);
  const setAvatarEquipado = useSessionStore((s) => s.setAvatarEquipado);
  const setMarcoEstilo = useSessionStore((s) => s.setMarcoEstilo);
  const setMascotaEquipada = useSessionStore((s) => s.setMascotaEquipada);
  const setTituloEquipado = useSessionStore((s) => s.setTituloEquipado);

  return useMutation({
    mutationFn: async ({ avatarId, marco, mascota, titulo }) => {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        if (avatarId) setAvatarEquipado(avatarId);
        if (marco) setMarcoEstilo(marco);
        if (mascota) setMascotaEquipada(mascota);
        if (titulo) setTituloEquipado(titulo);
        return { exito: true };
      }

      const res = await alumnosApi.personalizarPersonaje(aulaId, {
        avatarId,
        marco,
        mascota,
        titulo,
      });

      // Actualizar también estado local inmediato para máxima reactividad UI
      if (avatarId) setAvatarEquipado(avatarId);
      if (marco) setMarcoEstilo(marco);
      if (mascota) setMascotaEquipada(mascota);
      if (titulo) setTituloEquipado(titulo);

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personaje'] });
    },
    onError: (error) => {
      if (error?.status === 409) {
        error.mensajeAmigable =
          error.detail || 'No puedes equipar un artículo que aún no has adquirido en el Bazar.';
      } else {
        error.mensajeAmigable =
          error.detail || error.message || 'No se pudo guardar la personalización del personaje.';
      }
    },
  });
}
