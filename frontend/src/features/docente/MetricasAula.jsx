import { useState, useMemo } from 'react';
import {
  TrendingUp, Users, Award,
  BookOpen, ArrowLeft, BarChart3, Lightbulb,
  Copy, Check, BrainCircuit, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import { useMetricasAula } from '../../hooks/useMetricas';
import { useMisAulas } from '../../hooks/useAulas';
import useSessionStore from '../../store/useSessionStore';
import { playSuccess, playParchment } from '../../utils/audio';

/**
 * MetricasAula — Panel de analítica de aprendizaje y supervisión pedagógica HITL.
 * Consume datos reales del backend desde GET /api/docentes/metricas/{aulaId}.
 */
function MetricasAula() {
  const navigate = useNavigate();
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const { data: aulas } = useMisAulas();
  const aulaActual = aulas?.find((a) => a.aulaId === aulaActivaId);
  const nombreAula = aulaActual?.nombre || 'Aula Activa';

  const {
    data: metricas,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useMetricasAula(aulaActivaId);

  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // Misión activa seleccionada (por defecto la primera disponible)
  const misionSeleccionada = useMemo(() => {
    if (!metricas?.metricasPorMision?.length) return null;
    if (misionSeleccionadaId) {
      const encontrada = metricas.metricasPorMision.find(
        (m) => m.misionId === misionSeleccionadaId
      );
      if (encontrada) return encontrada;
    }
    return metricas.metricasPorMision[0];
  }, [metricas, misionSeleccionadaId]);

  // Cálculo de promedio general del curso
  const promedioGeneral = useMemo(() => {
    if (!metricas?.metricasPorMision?.length) return null;
    const totalResoluciones = metricas.metricasPorMision.reduce(
      (acc, m) => acc + (m.totalResoluciones || 0),
      0
    );
    if (totalResoluciones === 0) return null;
    const sumaPonderada = metricas.metricasPorMision.reduce(
      (acc, m) => acc + (m.promedioAcierto * (m.totalResoluciones || 0)),
      0
    );
    return Math.round(sumaPonderada / totalResoluciones);
  }, [metricas]);

  // Total de resoluciones acumuladas
  const totalResolucionesGlobal = useMemo(() => {
    if (!metricas?.distribucionAcierto?.length) return 0;
    return metricas.distribucionAcierto.reduce(
      (acc, d) => acc + (d.cantidadDeResoluciones || 0),
      0
    );
  }, [metricas]);

  const handleCopiarReporte = () => {
    if (!metricas) return;

    const texto = `Reporte Pedagógico - ${nombreAula}\n` +
      `------------------------------------\n` +
      `Alumnos Inscriptos: ${metricas.totalInscriptos}\n` +
      `Participación Activa: ${metricas.alumnosConAlMenosUnaMisionCompleta}/${metricas.totalInscriptos} (${Math.round(metricas.tasaCompletitud * 100)}%)\n` +
      `Promedio Grupal de Acierto: ${promedioGeneral !== null ? `${promedioGeneral}%` : 'Sin datos suficientes'}\n\n` +
      `Supervisión HITL:\n` +
      `- Misiones propuestas por IA: ${metricas.misionesGeneradas}\n` +
      `- Misiones aprobadas: ${metricas.misionesValidadas} (${Math.round(metricas.tasaAprobacionHitl * 100)}%)\n` +
      `- Misiones rechazadas: ${metricas.misionesRechazadas}\n\n` +
      (misionSeleccionada
        ? `Misión Analizada: ${misionSeleccionada.temaCurricular}\n` +
          `- Resoluciones: ${misionSeleccionada.totalResoluciones}\n` +
          `- Promedio de acierto: ${Math.round(misionSeleccionada.promedioAcierto)}%\n`
        : 'Sin misiones evaluadas aún.\n');

    navigator.clipboard?.writeText(texto);
    playSuccess();
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <button
              onClick={() => navigate('/docente/dashboard')}
              className="flex items-center gap-1 text-sm font-display font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
              title="Volver al Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
            <BarChart3 className="text-[var(--brand-primary)]" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Métricas & Diagnóstico del Aula
            </h1>
            <Badge variant="info" className="ml-2">
              {nombreAula}
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Analítica de aprendizaje en tiempo real y supervisión del ciclo pedagógico Human-in-the-Loop.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Actualizar métricas"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>{isFetching ? 'Actualizando...' : 'Refrescar'}</span>
          </Button>

          <Button
            variant={copiado ? 'primary' : 'ghost'}
            size="sm"
            onClick={handleCopiarReporte}
            disabled={!metricas}
          >
            {copiado ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiado ? '¡Reporte Copiado!' : 'Copiar Diagnóstico'}</span>
          </Button>
        </div>
      </div>

      {/* ── Estado de Carga o Error ── */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-display font-semibold text-[var(--text-secondary)]">
            Cargando métricas del aula...
          </p>
        </div>
      )}

      {isError && (
        <ErrorBanner
          error={error}
          title="Error al cargar las métricas del aula"
          onRetry={() => refetch()}
        />
      )}

      {/* ── Contenido Principal de Métricas ── */}
      {!isLoading && !isError && metricas && (
        <>
          {/* ── Fila 1: Tarjetas de Resumen Global del Aula ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1: Alumnos inscriptos */}
            <Card className="flex items-center gap-3.5 p-4 border-2 border-[var(--border)]">
              <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-primary)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-primary)]">
                <Users size={22} />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {metricas.totalInscriptos}
                </span>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Alumnos Inscriptos
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {metricas.alumnosConAlMenosUnaMisionCompleta} activos en misiones
                </span>
              </div>
            </Card>

            {/* Stat 2: Participación activa */}
            <Card className="flex items-center gap-3.5 p-4 border-2 border-[var(--border)]">
              <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-emerald)]">
                <TrendingUp size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {Math.round(metricas.tasaCompletitud * 100)}%
                </span>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Participación Activa
                </p>
                <div className="w-full h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden mt-1">
                  <div
                    className="h-full bg-[var(--brand-emerald)] rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round(metricas.tasaCompletitud * 100))}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Stat 3: Promedio de Acierto Grupal */}
            <Card className="flex items-center gap-3.5 p-4 border-2 border-[var(--border)]">
              <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-gold)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-gold)]">
                <Award size={22} />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {promedioGeneral !== null ? `${promedioGeneral}%` : 'N/D'}
                </span>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Promedio de Acierto Grupal
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {totalResolucionesGlobal} resoluciones totales
                </span>
              </div>
            </Card>
          </div>

          {/* ── Fila 2: Supervisión Human-in-the-Loop (HITL) ── */}
          <Card className="p-5 border-2 border-[var(--border)] bg-[color-mix(in_oklch,var(--brand-primary)_4%,var(--bg-panel))]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                    Supervisión Docente de IA (Human-in-the-Loop)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Trazabilidad de borradores generados por Gemini y validados por el docente.
                  </p>
                </div>
              </div>

              <Badge variant="correcto">
                Tasa de Aprobación: {Math.round(metricas.tasaAprobacionHitl * 100)}%
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex flex-col">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Propuestas por IA
                </span>
                <strong className="text-xl font-display font-black text-[var(--brand-primary)] mt-0.5">
                  {metricas.misionesGeneradas}
                </strong>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  Borradores emitidos
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex flex-col">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-emerald)]">
                  Aprobadas & Activas
                </span>
                <strong className="text-xl font-display font-black text-[var(--brand-emerald)] mt-0.5">
                  {metricas.misionesValidadas}
                </strong>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  Disponibles en el aula
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex flex-col">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-crimson)]">
                  Rechazadas
                </span>
                <strong className="text-xl font-display font-black text-[var(--brand-crimson)] mt-0.5">
                  {metricas.misionesRechazadas}
                </strong>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  Descartadas por criterio
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex flex-col">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Control Pedagógico
                </span>
                <strong className="text-xl font-display font-black text-[var(--text-primary)] mt-0.5">
                  100%
                </strong>
                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                  Intervención humana previa
                </span>
              </div>
            </div>
          </Card>

          {/* ── Fila 3: Distribución de Desempeño y Calificaciones ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Gráfico de Distribución (5 cols) */}
            <Card className="lg:col-span-5 flex flex-col gap-4 p-5 border-2 border-[var(--border)]">
              <div>
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                  Desempeño Grupal
                </span>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mt-0.5">
                  Distribución de Acierto
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Resoluciones clasificadas según el porcentaje obtenido por el alumno.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1">
                {metricas.distribucionAcierto?.map((d) => {
                  const pct = totalResolucionesGlobal > 0
                    ? Math.round((d.cantidadDeResoluciones / totalResolucionesGlobal) * 100)
                    : 0;

                  const colorBarra =
                    d.rango === '100%'
                      ? 'bg-[var(--brand-emerald)]'
                      : d.rango === '75-99%'
                      ? 'bg-[var(--brand-primary)]'
                      : d.rango === '50-74%'
                      ? 'bg-[var(--brand-gold)]'
                      : 'bg-[var(--brand-crimson)]';

                  return (
                    <div key={d.rango} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-display">
                        <span className="font-semibold text-[var(--text-primary)]">
                          Rango {d.rango}
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          {d.cantidadDeResoluciones} resoluciones ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                        <div
                          className={`h-full ${colorBarra} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalResolucionesGlobal === 0 && (
                <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-muted)] text-center text-xs text-[var(--text-muted)]">
                  Aún no hay resoluciones registradas en este curso.
                </div>
              )}
            </Card>

            {/* Columna Derecha: Análisis por Misión Curricular (7 cols) */}
            <Card className="lg:col-span-7 flex flex-col gap-4 p-5 border-2 border-[var(--border)]">
              <div>
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                  Análisis Temático
                </span>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mt-0.5">
                  Rendimiento por Misión
                </h3>
              </div>

              {/* Selector horizontal de misiones evaluadas */}
              {metricas.metricasPorMision?.length > 0 ? (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {metricas.metricasPorMision.map((m) => {
                      const isSelected = misionSeleccionada?.misionId === m.misionId;
                      return (
                        <button
                          key={m.misionId}
                          type="button"
                          onClick={() => {
                            playParchment();
                            setMisionSeleccionadaId(m.misionId);
                          }}
                          className={[
                            'px-3.5 py-2 rounded-xl border-2 text-xs font-display font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2',
                            isSelected
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-[2px_2px_0px_var(--border)]'
                              : 'border-[var(--border-muted)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
                          ].join(' ')}
                        >
                          <BookOpen size={14} />
                          <span className="max-w-[150px] truncate">{m.temaCurricular}</span>
                          <Badge variant={isSelected ? 'xp' : 'info'} className="ml-1">
                            {Math.round(m.promedioAcierto)}%
                          </Badge>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detalle de la misión seleccionada */}
                  {misionSeleccionada && (
                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-display font-bold text-base text-[var(--text-primary)]">
                          {misionSeleccionada.temaCurricular}
                        </h4>
                        <Badge
                          variant={
                            misionSeleccionada.promedioAcierto >= 80
                              ? 'correcto'
                              : misionSeleccionada.promedioAcierto >= 60
                              ? 'xp'
                              : 'incorrecto'
                          }
                        >
                          {Math.round(misionSeleccionada.promedioAcierto)}% de acierto promedio
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-muted)]">
                          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            Resoluciones Totales
                          </span>
                          <strong className="text-lg font-display font-black text-[var(--text-primary)]">
                            {misionSeleccionada.totalResoluciones}
                          </strong>
                        </div>

                        <div className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-muted)]">
                          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                            Dificultad Percibida
                          </span>
                          <strong className="text-lg font-display font-black text-[var(--text-primary)]">
                            {misionSeleccionada.promedioAcierto >= 80
                              ? 'Baja (Alta asimilación)'
                              : misionSeleccionada.promedioAcierto >= 60
                              ? 'Media (Estándar)'
                              : 'Alta (Requiere refuerzo)'}
                          </strong>
                        </div>
                      </div>

                      {/* Sugerencia pedagógica contextual */}
                      <div className="p-3.5 rounded-xl bg-[color-mix(in_oklch,var(--brand-gold)_12%,var(--bg-panel))] border border-[var(--brand-gold)] flex items-start gap-2.5">
                        <Lightbulb size={18} className="text-[var(--brand-gold)] shrink-0 mt-0.5" />
                        <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                          {misionSeleccionada.promedioAcierto < 60 ? (
                            <>
                              <strong>Intervención Recomendada:</strong> El promedio del tema está por debajo del 60%. Te sugerimos iniciar la próxima clase con un breve repaso conceptual o una actividad guiada antes de avanzar en la secuencia curricular.
                            </>
                          ) : misionSeleccionada.promedioAcierto >= 80 ? (
                            <>
                              <strong>Excelente Comprensión:</strong> El curso muestra un dominio sólido de este tema (+80%). Están en óptimas condiciones para desbloquear nodos curriculares más complejos.
                            </>
                          ) : (
                            <>
                              <strong>Progreso Favorable:</strong> Nivel de asimilación intermedio. Un ejercicio de fijación rápida en clase ayudará a consolidar los conceptos clave.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)]">
                  <BookOpen size={28} className="text-[var(--text-muted)]" />
                  <p className="text-xs font-display font-semibold text-[var(--text-secondary)]">
                    No hay misiones resueltas aún en esta aula.
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] max-w-sm">
                    Cuando los alumnos completen actividades desde su tablero, aquí se reflejará el promedio de acierto de cada tema.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default MetricasAula;
