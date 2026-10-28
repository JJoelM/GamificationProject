import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alumnosApi } from '../services/api';

/**
 * useUsarPista — Mutación para solicitar el descarte pedagógico de una opción incorrecta.
 *
 * Endpoint: POST /api/alumnos/misiones/{misionId}/pista
 * Body: { indicePregunta, opcionesYaDescartadas }
 * Respuesta: { opcionADescartar, pistasRestantes }
 *
 * Invalida ['personaje'] para sincronizar el saldo de pistas en toda la aplicación.
 */
export function useUsarPista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ misionId, indicePregunta, opcionesYaDescartadas }) => {
      return await alumnosApi.usarPista(misionId, {
        indicePregunta,
        opcionesYaDescartadas,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personaje'] });
    },
    onError: (error) => {
      if (error?.status === 409) {
        error.esFaltaDePistas = true;
        error.mensajeAmigable =
          error.detail || '¡Grimorio sin tinta! No te quedan pistas disponibles.';
      } else {
        error.mensajeAmigable =
          error.detail || error.message || 'No se pudo obtener la pista pedagógica.';
      }
    },
  });
}
