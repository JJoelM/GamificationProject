import { useQuery } from '@tanstack/react-query';
import { docentesApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

/**
 * useMetricasAula — Consulta las métricas reales del aula (inscriptos, HITL, distribución y misiones).
 * Endpoint: GET /api/docentes/metricas/{aulaId}
 * 
 * Retorna MetricasAulaDto:
 * - totalInscriptos: number
 * - alumnosConAlMenosUnaMisionCompleta: number
 * - tasaCompletitud: number (0..1)
 * - misionesGeneradas: number
 * - misionesValidadas: number
 * - misionesRechazadas: number
 * - tasaAprobacionHitl: number (0..1)
 * - metricasPorMision: Array<{ misionId, temaCurricular, totalResoluciones, promedioAcierto, preguntaMasFallida, opcionIncorrectaMasFrecuente }>
 * - distribucionAcierto: Array<{ rango: string, cantidadDeResoluciones: number }>
 * - misionesMasResueltas: Array<{ misionId, temaCurricular, totalResoluciones }>
 */
export function useMetricasAula(customAulaId) {
  const storeAulaId = useSessionStore((s) => s.aulaActivaId);
  const aulaId = customAulaId || storeAulaId;

  return useQuery({
    queryKey: ['metricas-aula', aulaId],
    queryFn: () => docentesApi.getMetricas(aulaId),
    enabled: Boolean(aulaId),
    staleTime: 1000 * 60 * 2, // 2 minutos de caché
  });
}
