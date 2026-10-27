import { useQuery } from '@tanstack/react-query';
import { directivoApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

/**
 * useMetricasGlobales — Consulta las métricas institucionales del directivo/administrador.
 * Endpoint: GET /api/directivo/metricas
 * 
 * Retorna MetricasGlobalesDto:
 * - totalDocentes: number
 * - docentesActivos: number
 * - totalAlumnos: number
 * - alumnosActivosUltimos7Dias: number
 * - alumnosActivosUltimos30Dias: number
 * - totalMisionesGeneradas: number
 * - totalMisionesValidadas: number
 * - totalMisionesRechazadas: number
 * - tasaAprobacionHitlGlobal: number (0..1)
 * - aulasMasActivas: Array<{ aulaId, nombreAula, totalResoluciones, alumnosActivos }>
 */
export function useMetricasGlobales() {
  const usuario = useSessionStore((s) => s.usuario);
  const esDirectivoOAdmin = usuario?.rol === 'Directivo' || usuario?.rol === 'Administrador';

  return useQuery({
    queryKey: ['directivo', 'metricas'],
    queryFn: () => directivoApi.getMetricas(),
    enabled: Boolean(esDirectivoOAdmin),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
