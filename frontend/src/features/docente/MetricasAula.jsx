import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Award, AlertTriangle, CheckCircle2,
  BookOpen, HelpCircle, ArrowLeft, ArrowRight, BarChart3,
  Lightbulb, ShieldCheck, Download, Copy, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useMisionesActivas } from '../../hooks/useMisiones';
import { playSuccess, playParchment } from '../../utils/audio';

/**
 * METRICAS_MOCK — Datos estadísticos y de diagnóstico pedagógico del aula
 */
const METRICAS_AULA = {
  totalAlumnos: 28,
  participacionSemanal: 92, // %
  promedioAciertoGeneral: 78, // %
  misionesMetricas: [
    {
      misionId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
      temaCurricular: 'Revolución de Mayo y el Cabildo Abierto',
      completadaPorcentaje: 89, // % alumnos que la hicieron
      alumnosCompletaron: 25,
      promedioAcierto: 84,
      preguntasDiagnostico: [
        {
          indice: 1,
          enunciado: '¿En qué año se llevó a cabo el Cabildo Abierto de Mayo?',
          aciertoPorcentaje: 96,
          opcionMasFallada: '1816 (4% de alumnos)',
          diagnosticoPedagogico: 'Excelente asimilación cronológica del hito inicial de 1810.',
          nivelDificultad: 'Baja',
        },
        {
          indice: 2,
          enunciado: '¿Quién presidió la Primera Junta de Gobierno?',
          aciertoPorcentaje: 72,
          opcionMasFallada: 'Mariano Moreno (24% de alumnos)',
          diagnosticoPedagogico: 'Confusión frecuente entre el rol de Secretario (Moreno) y Presidente (Saavedra). Sugerencia: aclarar en clase las facciones saavedristas vs morenistas.',
          nivelDificultad: 'Media',
        },
      ],
    },
    {
      misionId: 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
      temaCurricular: 'Energía Solar y Efecto Fotovoltaico',
      completadaPorcentaje: 75,
      alumnosCompletaron: 21,
      promedioAcierto: 70,
      preguntasDiagnostico: [
        {
          indice: 1,
          enunciado: '¿Qué tipo de radiación aprovechan las celdas solares?',
          aciertoPorcentaje: 70,
          opcionMasFallada: 'Calor geotérmico (18% de alumnos)',
          diagnosticoPedagogico: 'Confusión entre energía térmica y radiación solar electromagnética (luz vs calor). Sugerencia: reforzar el principio del efecto fotoeléctrico.',
          nivelDificultad: 'Media-Alta',
        },
      ],
    },
  ],
};

function MetricasAula() {
  const navigate = useNavigate();
  const [misionSeleccionada, setMisionSeleccionada] = useState(METRICAS_AULA.misionesMetricas[0]);
  const [copiado, setCopiado] = useState(false);

  const handleCopiarReporte = () => {
    const texto = `Reporte Pedagógico EduQuest - ${misionSeleccionada.temaCurricular}\n` +
      `Alumnos participantes: ${misionSeleccionada.alumnosCompletaron}/${METRICAS_AULA.totalAlumnos} (${misionSeleccionada.completadaPorcentaje}%)\n` +
      `Promedio de acierto: ${misionSeleccionada.promedioAcierto}%\n` +
      `Preguntas para reforzar:\n` +
      misionSeleccionada.preguntasDiagnostico.map(p => `- P${p.indice}: ${p.diagnosticoPedagogico}`).join('\n');

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
            >
              <ArrowLeft size={16} />
            </button>
            <BarChart3 className="text-[var(--brand-primary)]" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Métricas & Diagnóstico del Aula
            </h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Analítica de aprendizaje y mapa de calor de errores para orientar tus clases presenciales.
          </p>
        </div>

        <Button
          variant={copiado ? 'primary' : 'ghost'}
          size="sm"
          onClick={handleCopiarReporte}
        >
          {copiado ? <Check size={14} /> : <Copy size={14} />}
          <span>{copiado ? '¡Reporte Copiado!' : 'Copiar Diagnóstico'}</span>
        </Button>
      </div>

      {/* ── Tarjetas de Resumen Global del Aula ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3.5 p-4">
          <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-primary)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-primary)]">
            <Users size={22} />
          </div>
          <div>
            <span className="font-display font-black text-2xl text-[var(--text-primary)]">
              {METRICAS_AULA.totalAlumnos}
            </span>
            <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Alumnos en el Aula
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-emerald)]">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="font-display font-black text-2xl text-[var(--text-primary)]">
              {METRICAS_AULA.participacionSemanal}%
            </span>
            <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Participación Semanal
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <div className="w-11 h-11 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-gold)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-gold)]">
            <Award size={22} />
          </div>
          <div>
            <span className="font-display font-black text-2xl text-[var(--text-primary)]">
              {METRICAS_AULA.promedioAciertoGeneral}%
            </span>
            <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Promedio de Acierto Grupal
            </p>
          </div>
        </Card>
      </div>

      {/* ── Selector de Misión para Análisis ── */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Seleccionar Misión para Análisis Pedagógico
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {METRICAS_AULA.misionesMetricas.map((m) => {
            const isSelected = misionSeleccionada.misionId === m.misionId;
            return (
              <button
                key={m.misionId}
                type="button"
                onClick={() => {
                  playParchment();
                  setMisionSeleccionada(m);
                }}
                className={[
                  'px-4 py-2.5 rounded-xl border-2 text-xs font-display font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2',
                  isSelected
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-[2px_2px_0px_var(--border)]'
                    : 'border-[var(--border-muted)] bg-[var(--bg-panel)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
                ].join(' ')}
              >
                <BookOpen size={14} />
                <span>{m.temaCurricular}</span>
                <Badge variant={isSelected ? 'xp' : 'info'} className="ml-1">
                  {m.promedioAcierto}% acierto
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Detalle de la Misión & Mapa de Calor de Preguntas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Métricas de la Misión (4 cols) */}
        <Card className="lg:col-span-4 flex flex-col gap-5 p-5 border-2 border-[var(--border)]">
          <div>
            <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
              Misión Seleccionada
            </span>
            <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mt-0.5">
              {misionSeleccionada.temaCurricular}
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {/* Barra de Completitud */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-display">
                <span className="text-[var(--text-secondary)]">Alumnos que la completaron</span>
                <strong className="text-[var(--text-primary)]">
                  {misionSeleccionada.alumnosCompletaron} / {METRICAS_AULA.totalAlumnos} ({misionSeleccionada.completadaPorcentaje}%)
                </strong>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] border border-[var(--border-muted)] overflow-hidden">
                <div
                  className="h-full bg-[var(--brand-primary)] rounded-full transition-all"
                  style={{ width: `${misionSeleccionada.completadaPorcentaje}%` }}
                />
              </div>
            </div>

            {/* Barra de Acierto */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-display">
                <span className="text-[var(--text-secondary)]">Tasa de Respuestas Correctas</span>
                <strong className="text-[var(--brand-emerald)]">
                  {misionSeleccionada.promedioAcierto}%
                </strong>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] border border-[var(--border-muted)] overflow-hidden">
                <div
                  className="h-full bg-[var(--brand-emerald)] rounded-full transition-all"
                  style={{ width: `${misionSeleccionada.promedioAcierto}%` }}
                />
              </div>
            </div>
          </div>

          {/* Consejo de Intervención Docente */}
          <div className="p-3.5 rounded-xl bg-[color-mix(in_oklch,var(--brand-gold)_12%,var(--bg-panel))] border border-[var(--brand-gold)] flex items-start gap-2.5">
            <Lightbulb size={18} className="text-[var(--brand-gold)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">
              <strong>Sugerencia Pedagógica:</strong> Usa los diagnósticos de preguntas para abrir la próxima clase con una pregunta de calentamiento sobre los conceptos más fallados.
            </p>
          </div>
        </Card>

        {/* Columna Derecha: Mapa de Calor de Preguntas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
              <HelpCircle size={18} className="text-[var(--brand-primary)]" />
              Diagnóstico Pregunta por Pregunta
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-display">
              {misionSeleccionada.preguntasDiagnostico.length} preguntas evaluadas
            </span>
          </div>

          <div className="flex flex-col gap-3.5">
            {misionSeleccionada.preguntasDiagnostico.map((p) => {
              const esCritico = p.aciertoPorcentaje < 75;

              return (
                <Card
                  key={p.indice}
                  className={[
                    'flex flex-col gap-3 p-4 border-2 transition-all',
                    esCritico
                      ? 'border-[var(--brand-secondary)] bg-[color-mix(in_oklch,var(--brand-secondary)_6%,var(--bg-panel))]'
                      : 'border-[var(--border-muted)] bg-[var(--bg-panel)]',
                  ].join(' ')}
                >
                  {/* Encabezado de Pregunta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[var(--brand-primary)] text-white text-xs font-display font-bold flex items-center justify-center shrink-0">
                        {p.indice}
                      </span>
                      <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">
                        {p.enunciado}
                      </h4>
                    </div>

                    <Badge variant={p.aciertoPorcentaje >= 85 ? 'correcto' : p.aciertoPorcentaje >= 70 ? 'xp' : 'incorrecto'}>
                      {p.aciertoPorcentaje}% acierto
                    </Badge>
                  </div>

                  {/* Detalle de Confusión Común */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-muted)]">
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-crimson)] block">
                        Opción Incorrecta más Frecuente:
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {p.opcionMasFallada}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-muted)]">
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                        Dificultad Estimada:
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {p.nivelDificultad}
                      </span>
                    </div>
                  </div>

                  {/* Diagnóstico pedagógico explicativo */}
                  <div className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-muted)] text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)]">Análisis Didáctico: </strong>
                    {p.diagnosticoPedagogico}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricasAula;
