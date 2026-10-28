import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, BrainCircuit,
  TrendingUp, BarChart3, RefreshCw, Copy, Check, ArrowRight, School
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import { useMetricasGlobales } from '../../hooks/useDirectivo';
import { playSuccess, playParchment } from '../../utils/audio';

export default function DashboardDirectivo() {
  const navigate = useNavigate();
  const { data: metricas, isLoading, isError, error, refetch, isFetching } = useMetricasGlobales();
  const [copiado, setCopiado] = useState(false);

  const handleCopiarReporte = () => {
    if (!metricas) return;

    const texto = `Reporte Institucional EduQuest\n` +
      `------------------------------------\n` +
      `Docentes: ${metricas.docentesActivos} activos de ${metricas.totalDocentes}\n` +
      `Alumnos: ${metricas.totalAlumnos} matriculados (${metricas.alumnosActivosUltimos7Dias} activos en últimos 7 días)\n` +
      `Supervisión IA (HITL):\n` +
      `- Misiones generadas: ${metricas.totalMisionesGeneradas}\n` +
      `- Misiones validadas: ${metricas.totalMisionesValidadas} (${Math.round(metricas.tasaAprobacionHitlGlobal * 100)}% de aprobación)\n` +
      `- Misiones rechazadas: ${metricas.totalMisionesRechazadas}\n\n` +
      `Aulas más activas:\n` +
      (metricas.aulasMasActivas?.map((a, i) => `${i + 1}. ${a.nombreAula}: ${a.totalResoluciones} resoluciones (${a.alumnosActivos} alumnos)`).join('\n') || 'Sin aulas activas.');

    navigator.clipboard?.writeText(texto);
    playSuccess();
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <BarChart3 className="text-[var(--brand-primary)]" size={26} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Métricas Institucionales & Supervisión Global
            </h1>
            <Badge variant="correcto" className="ml-2">Directorio</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Monitoreo en tiempo real de adopción pedagógica, actividad estudiantil y supervisión de IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
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
            <span>{copiado ? '¡Copiado!' : 'Copiar Reporte'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => { playParchment(); navigate('/directivo/docentes'); }}
          >
            <Users size={14} />
            <span>Gestionar Cuentas</span>
            <ArrowRight size={13} />
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-display font-semibold text-[var(--text-secondary)]">
            Consultando métricas de la institución...
          </p>
        </div>
      )}

      {isError && (
        <ErrorBanner
          error={error}
          title="Error al consultar las métricas globales"
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && metricas && (
        <>
          {/* ── Fila 1: Comunidad Educativa ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="flex items-center gap-3.5 p-4 border-2 border-[var(--border)]">
              <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-primary)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-primary)]">
                <Users size={22} />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {metricas.docentesActivos}
                </span>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Docentes Activos
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  de {metricas.totalDocentes} registrados
                </span>
              </div>
            </Card>

            <Card className="flex items-center gap-3.5 p-4 border-2 border-[var(--border)]">
              <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-emerald)]">
                <GraduationCap size={22} />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {metricas.totalAlumnos}
                </span>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Alumnos Matriculados
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Población total
                </span>
              </div>
            </Card>

            <Card className="flex items-center gap-3.5 p-4 border-2 border-[var(--border)]">
              <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-gold)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-gold)]">
                <TrendingUp size={22} />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {metricas.alumnosActivosUltimos7Dias}
                </span>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Activos (Últimos 7 Días)
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {metricas.totalAlumnos > 0 ? `${Math.round((metricas.alumnosActivosUltimos7Dias / metricas.totalAlumnos) * 100)}% del alumnado` : '0%'}
                </span>
              </div>
            </Card>

            <Card className="flex items-center gap-3.5 p-4 border-2 border-[var(--border)]">
              <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-secondary)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-secondary)]">
                <School size={22} />
              </div>
              <div>
                <span className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {metricas.alumnosActivosUltimos30Dias}
                </span>
                <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Activos (Últimos 30 Días)
                </p>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Retención mensual
                </span>
              </div>
            </Card>
          </div>

          {/* ── Fila 2: Supervisión Global de IA (Human-in-the-Loop) ── */}
          <Card className="p-5 border-2 border-[var(--border)] bg-[color-mix(in_oklch,var(--brand-primary)_4%,var(--bg-panel))]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
                    Auditoría Institucional de Inteligencia Artificial
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Garantía ética: todas las misiones propuestas por Gemini requieren revisión y aprobación docente obligatoria.
                  </p>
                </div>
              </div>

              <Badge variant="correcto">
                Tasa Global de Aprobación: {Math.round(metricas.tasaAprobacionHitlGlobal * 100)}%
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex flex-col">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Misiones Asistidas por IA
                </span>
                <strong className="text-2xl font-display font-black text-[var(--brand-primary)] mt-1">
                  {metricas.totalMisionesGeneradas}
                </strong>
                <span className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Borradores emitidos en la institución
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex flex-col">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-emerald)]">
                  Aprobadas & Publicadas
                </span>
                <strong className="text-2xl font-display font-black text-[var(--brand-emerald)] mt-1">
                  {metricas.totalMisionesValidadas}
                </strong>
                <span className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Respaldadas pedagógicamente
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] flex flex-col">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-crimson)]">
                  Rechazadas por Docentes
                </span>
                <strong className="text-2xl font-display font-black text-[var(--brand-crimson)] mt-1">
                  {metricas.totalMisionesRechazadas}
                </strong>
                <span className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Descartadas por criterio del educador
                </span>
              </div>
            </div>
          </Card>

          {/* ── Fila 3: Ranking de Aulas Más Activas ── */}
          <Card className="p-5 border-2 border-[var(--border)] flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                Impacto en el Aula
              </span>
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mt-0.5">
                Aulas con Mayor Actividad
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Cursos con mayor volumen de actividades completadas por estudiantes.
              </p>
            </div>

            {metricas.aulasMasActivas?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-display">
                  <thead>
                    <tr className="border-b-2 border-[var(--border-muted)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Posición</th>
                      <th className="py-2.5 px-3">Nombre del Aula</th>
                      <th className="py-2.5 px-3">Alumnos Activos</th>
                      <th className="py-2.5 px-3">Misiones Resueltas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-muted)]">
                    {metricas.aulasMasActivas.map((aula, idx) => (
                      <tr key={aula.aulaId} className="hover:bg-[var(--bg-accent)] transition-colors">
                        <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                          <span className="w-6 h-6 rounded-full bg-[var(--bg-panel)] border border-[var(--border-muted)] flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                          {aula.nombreAula}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-secondary)]">
                          {aula.alumnosActivos} estudiantes
                        </td>
                        <td className="py-3 px-3 font-bold text-[var(--brand-primary)]">
                          {aula.totalResoluciones} resoluciones
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] text-xs text-[var(--text-muted)]">
                Aún no hay resoluciones registradas en las aulas institucionales.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
