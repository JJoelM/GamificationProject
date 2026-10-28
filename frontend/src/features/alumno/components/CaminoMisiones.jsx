import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Compass, Swords, Clock, CheckCircle2, Sparkles, Award,
  ArrowRight, GitFork, AlertCircle, Play
} from 'lucide-react';
import { useCaminoAlumno } from '../../../hooks/useCamino';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import ErrorBanner from '../../../components/ui/ErrorBanner';

const TIPO_ICONOS = {
  OpcionMultiple: Compass,
  BatallaDeJefe: Swords,
  LineaTemporal: Clock,
};

const TIPO_COLORES = {
  OpcionMultiple: 'text-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] border-[var(--brand-primary)]',
  BatallaDeJefe: 'text-[var(--brand-crimson)] bg-red-500/10 border-red-500',
  LineaTemporal: 'text-[var(--brand-violet)] bg-purple-500/10 border-purple-500',
};

/**
 * CaminoMisiones — Visualizador SVG artesanal del Grafo Acíclico Dirigido (DAG) curricular.
 * Respeta el Principio de Autonomía: Todas las misiones activas son clickeables.
 */
function CaminoMisiones({ misionesActivas = [], onSelectMision }) {
  const { data: caminoData, isLoading, error } = useCaminoAlumno();

  const nodos = caminoData?.nodos || [];
  const aristas = caminoData?.aristas || [];

  // Mapeo de misiones completas para pasar todos los datos al modal de resolución
  const misionesMap = useMemo(() => {
    const map = new Map();
    misionesActivas.forEach((m) => map.set(m.misionId, m));
    return map;
  }, [misionesActivas]);

  // Identificar misiones del grafo vs independientes
  const { nodosGrafo, nodosIndependientes, posiciones, widthSvg, heightSvg } = useMemo(() => {
    if (!nodos.length) {
      return { nodosGrafo: [], nodosIndependientes: [], posiciones: {}, widthSvg: 600, heightSvg: 300 };
    }

    const idsConAristas = new Set();
    aristas.forEach((a) => {
      idsConAristas.add(a.origen);
      idsConAristas.add(a.destino);
    });

    const grafo = [];
    const independientes = [];

    nodos.forEach((n) => {
      if (idsConAristas.has(n.misionId) || n.nivel > 0) {
        grafo.push(n);
      } else {
        independientes.push(n);
      }
    });

    // Si no hay aristas en absoluto, mostrar todas en el lienzo ordenadas por nivel
    const itemsGrafo = grafo.length > 0 ? grafo : nodos;
    const itemsIndependientes = grafo.length > 0 ? independientes : [];

    // Agrupar por nivel
    const columnas = {};
    itemsGrafo.forEach((nodo) => {
      const niv = nodo.nivel || 0;
      if (!columnas[niv]) columnas[niv] = [];
      columnas[niv].push(nodo);
    });

    const niveles = Object.keys(columnas).map(Number).sort((a, b) => a - b);
    const maxNivel = niveles.length > 0 ? Math.max(...niveles) : 0;
    const maxFilas = Math.max(...Object.values(columnas).map((c) => c.length), 1);

    const COL_WIDTH = 280;
    const ROW_HEIGHT = 150;
    const PADDING_X = 60;
    const PADDING_Y = 50;

    const totalWidth = Math.max(760, (maxNivel + 1) * COL_WIDTH + PADDING_X * 2);
    const totalHeight = Math.max(360, maxFilas * ROW_HEIGHT + PADDING_Y * 2);

    const pos = {};

    niveles.forEach((niv) => {
      const colItems = columnas[niv];
      const colHeight = colItems.length * ROW_HEIGHT;
      const offsetY = (totalHeight - colHeight) / 2;

      colItems.forEach((nodo, rowIdx) => {
        const x = PADDING_X + niv * COL_WIDTH;
        const y = offsetY + rowIdx * ROW_HEIGHT;
        pos[nodo.misionId] = {
          x,
          y,
          width: 220,
          height: 100,
          anchorRight: { x: x + 220, y: y + 50 },
          anchorLeft: { x: x, y: y + 50 },
        };
      });
    });

    return {
      nodosGrafo: itemsGrafo,
      nodosIndependientes: itemsIndependientes,
      posiciones: pos,
      widthSvg: totalWidth,
      heightSvg: totalHeight,
    };
  }, [nodos, aristas]);

  // Verificar si un nodo es sugerido (no resuelto pero al menos un padre sí está resuelto o es raíz no resuelta)
  const nodosResueltosIds = useMemo(() => {
    return new Set(nodos.filter((n) => n.resuelta).map((n) => n.misionId));
  }, [nodos]);

  const esSugerido = (nodo) => {
    if (nodo.resuelta) return false;
    const aristasEntrantes = aristas.filter((a) => a.destino === nodo.misionId);
    if (!aristasEntrantes.length) return true; // Raíz no resuelta
    return aristasEntrantes.some((a) => nodosResueltosIds.has(a.origen));
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Spinner size="lg" label="Trazando el camino de aprendizaje..." />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner error={error} />;
  }

  if (!nodos.length) {
    return (
      <Card className="p-12 text-center flex flex-col items-center gap-3">
        <GitFork size={36} className="text-[var(--text-muted)]" />
        <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
          Camino curricular en construcción
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-md">
          Aún no se han configurado rutas de aprendizaje para esta aula. Podés resolver cualquier misión disponible en la vista de cartas.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Leyenda Pedagógica del Camino ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-panel)] border-2 border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2">
          <GitFork size={18} className="text-[var(--brand-primary)]" />
          <span className="text-xs font-display font-bold text-[var(--text-primary)]">
            Ruta de Progresión
          </span>
          <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">
            — Elige tu propia aventura curricular con autonomía
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
            <span className="text-[var(--text-secondary)] font-medium">Resuelta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--brand-violet)] animate-pulse shadow-xs" />
            <span className="text-[var(--text-secondary)] font-medium">Sugerida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--brand-primary)] shadow-xs" />
            <span className="text-[var(--text-secondary)] font-medium">Disponible</span>
          </div>
        </div>
      </div>

      {/* ── Lienzo SVG del Grafo DAG ── */}
      <div className="relative w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--bg-panel)] shadow-[var(--shadow-c)] overflow-x-auto">
        <div style={{ minWidth: widthSvg, minHeight: heightSvg }} className="relative select-none p-4">
          <svg
            width={widthSvg}
            height={heightSvg}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <defs>
              <linearGradient id="grad-arista-activa" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <linearGradient id="grad-arista-inactiva" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748B" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#64748B" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Trazado de Aristas Curvas Bézier */}
            {aristas.map((arista, idx) => {
              const posOrigen = posiciones[arista.origen];
              const posDestino = posiciones[arista.destino];

              if (!posOrigen || !posDestino) return null;

              const x1 = posOrigen.anchorRight.x;
              const y1 = posOrigen.anchorRight.y;
              const x2 = posDestino.anchorLeft.x;
              const y2 = posDestino.anchorLeft.y;

              const dx = Math.max(40, (x2 - x1) / 2);
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              const origenResuelto = nodosResueltosIds.has(arista.origen);

              return (
                <g key={`arista-${idx}`}>
                  {/* Sombra de la arista */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={origenResuelto ? '#10B981' : '#000'}
                    strokeWidth={origenResuelto ? '5' : '3'}
                    strokeOpacity={origenResuelto ? '0.2' : '0.08'}
                  />
                  {/* Línea principal Bézier */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={origenResuelto ? 'url(#grad-arista-activa)' : 'url(#grad-arista-inactiva)'}
                    strokeWidth={origenResuelto ? '3' : '2'}
                    strokeDasharray={origenResuelto ? 'none' : '5 4'}
                    className={origenResuelto ? 'transition-all' : ''}
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodos del Grafo (Tarjetas HTML interactivas colocadas sobre el SVG) */}
          {nodosGrafo.map((nodo) => {
            const pos = posiciones[nodo.misionId];
            if (!pos) return null;

            const resuelta = Boolean(nodo.resuelta);
            const sugerida = esSugerido(nodo);
            const Icono = TIPO_ICONOS[nodo.tipoPlantilla] || Compass;
            const fullMision = misionesMap.get(nodo.misionId) || nodo;

            return (
              <motion.div
                key={nodo.misionId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectMision && onSelectMision(fullMision)}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: pos.width,
                  height: pos.height,
                }}
                className={[
                  'rounded-[14px_18px_14px_16px] p-3.5 border-2 flex flex-col justify-between cursor-pointer transition-all duration-150 select-none shadow-sm',
                  resuelta
                    ? 'border-emerald-500 bg-[color-mix(in_oklch,var(--color-emerald-500,#10b981)_12%,var(--bg-panel))] shadow-[3px_3px_0px_#059669]'
                    : sugerida
                      ? 'border-[var(--brand-violet)] bg-[color-mix(in_oklch,var(--brand-violet)_10%,var(--bg-panel))] shadow-[0_0_18px_rgba(124,58,237,0.3)] ring-2 ring-[var(--brand-violet)]'
                      : 'border-[var(--border)] bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${TIPO_COLORES[nodo.tipoPlantilla] || ''}`}>
                      <Icono size={13} />
                    </div>
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-secondary)] truncate">
                      {nodo.tipoPlantilla}
                    </span>
                  </div>

                  {resuelta ? (
                    <Badge variant="correcto" className="text-[9px] px-1.5 py-0">
                      <CheckCircle2 size={10} /> Resuelta
                    </Badge>
                  ) : sugerida ? (
                    <Badge variant="violet" className="text-[9px] px-1.5 py-0 animate-pulse">
                      <Sparkles size={10} /> Sugerida
                    </Badge>
                  ) : (
                    <span className="text-[10px] font-display font-semibold text-[var(--text-muted)]">
                      Nivel {nodo.nivel}
                    </span>
                  )}
                </div>

                <h4 className="font-display font-bold text-xs text-[var(--text-primary)] line-clamp-2 leading-tight">
                  {nodo.temaCurricular || fullMision.narrativa || 'Misión Curricular'}
                </h4>

                <div className="flex items-center justify-between text-[10px] font-display font-bold text-[var(--brand-primary)] pt-1 border-t border-[var(--border-muted)]">
                  <span>{fullMision.recompensaXp ? `+${fullMision.recompensaXp} XP` : 'Desafío'}</span>
                  <div className="flex items-center gap-0.5">
                    <span>{resuelta ? 'Repasar' : 'Resolver'}</span>
                    <Play size={10} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Sección de Misiones Independientes (Sin Conexiones) ── */}
      {nodosIndependientes.length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-bold text-[var(--text-secondary)]">
              📜 Misiones Independientes ({nodosIndependientes.length})
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              — Misiones complementarias sin dependencias secuenciales
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {nodosIndependientes.map((nodo) => {
              const resuelta = Boolean(nodo.resuelta);
              const Icono = TIPO_ICONOS[nodo.tipoPlantilla] || Compass;
              const fullMision = misionesMap.get(nodo.misionId) || nodo;

              return (
                <div
                  key={nodo.misionId}
                  onClick={() => onSelectMision && onSelectMision(fullMision)}
                  className={[
                    'p-3.5 rounded-xl border-2 flex items-center justify-between gap-3 cursor-pointer transition-all select-none',
                    resuelta
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${TIPO_COLORES[nodo.tipoPlantilla] || ''}`}>
                      <Icono size={16} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-display font-bold text-xs text-[var(--text-primary)] truncate">
                        {nodo.temaCurricular || fullMision.narrativa || 'Misión'}
                      </h5>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {nodo.tipoPlantilla} • {fullMision.recompensaXp ? `+${fullMision.recompensaXp} XP` : 'Activa'}
                      </span>
                    </div>
                  </div>

                  {resuelta ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <Play size={14} className="text-[var(--brand-primary)] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CaminoMisiones;
