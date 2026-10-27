import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

/**
 * useMisDatos — Consulta los datos de cuenta del usuario autenticado.
 * Endpoint: GET /api/usuarios/mis-datos
 */
export function useMisDatos() {
  const usuario = useSessionStore((s) => s.usuario);
  const usuarioId = usuario?.usuarioId || 'anon';

  return useQuery({
    queryKey: ['usuarios', 'mis-datos', usuarioId],
    queryFn: () => usuariosApi.getMisDatos(),
    enabled: Boolean(usuario),
    staleTime: 0, // Siempre fresco por usuario para evitar fugas entre cuentas
  });
}

/**
 * useActualizarMisDatos — Actualiza nombre completo y consentimiento de investigación.
 * Endpoint: PUT /api/usuarios/mis-datos
 */
export function useActualizarMisDatos() {
  const queryClient = useQueryClient();
  const setUsuario = useSessionStore((s) => s.setUsuario);
  const usuarioActual = useSessionStore((s) => s.usuario);

  return useMutation({
    mutationFn: ({ nombreCompleto, aceptaUsoInvestigacion }) =>
      usuariosApi.actualizarMisDatos({ nombreCompleto, aceptaUsoInvestigacion }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'mis-datos'] });
      if (usuarioActual) {
        setUsuario({
          ...usuarioActual,
          nombreCompleto: variables.nombreCompleto,
        });
      }
    },
  });
}

/**
 * useCambiarPassword — Actualiza la contraseña del usuario previa verificación de la actual.
 * Endpoint: POST /api/usuarios/mis-datos/cambiar-password
 */
export function useCambiarPassword() {
  return useMutation({
    mutationFn: ({ passwordActual, passwordNueva }) =>
      usuariosApi.cambiarPassword({ passwordActual, passwordNueva }),
  });
}

/**
 * useEliminarMiCuenta — Anonimiza y da de baja la cuenta del usuario autenticado.
 * Endpoint: DELETE /api/usuarios/mis-datos
 */
export function useEliminarMiCuenta() {
  const queryClient = useQueryClient();
  const logout = useSessionStore((s) => s.logout);

  return useMutation({
    mutationFn: () => usuariosApi.eliminarMiCuenta(),
    onSuccess: () => {
      queryClient.clear();
      logout();
      window.location.href = '/';
    },
  });
}
