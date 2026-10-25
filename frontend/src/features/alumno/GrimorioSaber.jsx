import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, ArrowLeft, Search, CheckCircle2,
  Lock, RefreshCw, GraduationCap, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useGrimorioAula } from '../../hooks/useGrimorioAula';
import { FICHAS_GRIMORIO } from './components/GrimorioData';
import { playParchment } from '../../utils/audio';

function GrimorioSaber() {
  const navigate = useNavigate();
  const { data: grimorioData, isLoading } = useGrimorioAula();

  const [busqueda, setBusqueda] = useState('');
  const [fichaSeleccionadaId, setFichaSeleccionadaId] = useState(null);

  // Unificar fichas del backend con metadatos visuales de GrimorioData
  const fichasCombinadas = useMemo(() => {
    const rawFichas = grimorioData?.fichas || [];

    if (rawFichas.length === 0) {
      // Si aún no hay fichas en backend, usar fichas base de ejemplo
      return FICHAS_GRIMORIO.map((f, idx) => ({
        fichaId: f.id,
        misionId: f.misionIdAsociada,
        temaCurricular: f.temaCurricular,
        narrativa: f.resumenConceptual,
        conceptosClave: f.conceptosClave.map((c) =>
          typeof c === 'string' ? c : `${c.termino}: ${c.definicion}`
        ),
        desbloqueada: idx === 0,
        area: f.area,
        IconoVisual: f.IconoVisual,
        sabiduriaCurricular: f.sabiduriaCurricular,
      }));
    }

    return rawFichas.map((f, idx) => {
      const match = FICHAS_GRIMORIO.find(
        (fg) => fg.misionIdAsociada === f.misionId || fg.temaCurricular === f.temaCurricular
      ) || FICHAS_GRIMORIO[idx % FICHAS_GRIMORIO.length];

      return {
        fichaId: f.fichaId,
        misionId: f.misionId,
        temaCurricular: f.temaCurricular,
        narrativa: f.narrativa || match?.resumenConceptual || '',
        conceptosClave: f.conceptosClave || [],
        desbloqueada: Boolean(f.desbloqueada),
        area: match?.area || 'Conocimiento Curricular',
        IconoVisual: match?.IconoVisual || FICHAS_GRIMORIO[0].IconoVisual,
        sabiduriaCurricular:
          match?.sabiduriaCurricular || 'El conocimiento asimilado es la mayor fortaleza del aventurero.',
      };
    });
  }, [grimorioData]);

  // Selección de ficha activa
  const fichaSeleccionada = useMemo(() => {
    if (fichasCombinadas.length === 0) return null;
    return (
      fichasCombinadas.find((f) => f.fichaId === fichaSeleccionadaId) ||
      fichasCombinadas[0]
    );
  }, [fichasCombinadas, fichaSeleccionadaId]);

  const fichasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return fichasCombinadas;
    const q = busqueda.toLowerCase();
    return fichasCombinadas.filter(
      (f) =>
        f.temaCurricular.toLowerCase().includes(q) ||
        f.area.toLowerCase().includes(q) ||
        f.narrativa.toLowerCase().includes(q)
    );
  }, [fichasCombinadas, busqueda]);

  const totalDesbloqueadas =
    grimorioData?.totalDesbloqueadas ??
    fichasCombinadas.filter((f) => f.desbloqueada).length;
  const total = grimorioData?.total ?? fichasCombinadas.length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <button
              onClick={() => navigate('/alumno/dashboard')}
              className="flex items-center gap-1 text-sm font-display font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <BookOpen className="text-[var(--brand-primary)]" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Grimorio del Saber
            </h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Compendio de cartas curriculares desbloqueadas al resolver misiones del aula.
          </p>
        </div>

        {/* Progreso del Grimorio */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[var(--bg-panel)] border-2 border-[var(--border)] shadow-[3px_3px_0px_var(--border)]">
          <GraduationCap size={22} className="text-[var(--brand-primary)]" />
          <div className="text-left">
            <span className="font-display font-bold text-sm text-[var(--text-primary)] block leading-none">
              {totalDesbloqueadas} de {total} Cartas
            </span>
            <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
              Colección Curricular
            </span>
          </div>
        </div>
      </div>

      {/* ── Barra de Búsqueda ── */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Buscar conceptos, temas o áreas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-[10px_14px_12px_12px] border-2 border-[var(--border-muted)] bg-[var(--bg-panel)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none transition-colors"
        />
      </div>

      {/* ── Grid Principal: Lista de Cartas + Visor Detallado ── */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
          <Loader2 size={32} className="animate-spin text-[var(--brand-primary)]" />
          <span className="text-sm font-display font-semibold">Cargando compendio del Grimorio...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Cartas Coleccionables (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {fichasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-panel)] rounded-xl border-2 border-[var(--border-muted)]">
                No se encontraron cartas con "{busqueda}".
              </div>
            ) : (
              fichasFiltradas.map((ficha) => {
                const isSelected = fichaSeleccionada?.fichaId === ficha.fichaId;
                const IconVisual = ficha.IconoVisual;

                return (
                  <button
                    key={ficha.fichaId}
                    type="button"
                    onClick={() => {
                      playParchment();
                      setFichaSeleccionadaId(ficha.fichaId);
                    }}
                    className={[
                      'p-4 rounded-[12px_16px_14px_14px] border-2 text-left transition-all cursor-pointer flex items-center gap-3.5',
                      isSelected
                        ? 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-primary)] translate-x-1'
                        : ficha.desbloqueada
                          ? 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]'
                          : 'border-[var(--border-muted)] bg-[var(--bg-muted)] opacity-60',
                    ].join(' ')}
                  >
                    <div className="shrink-0">
                      {ficha.desbloqueada ? (
                        <IconVisual className="w-12 h-12" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] flex items-center justify-center text-[var(--text-secondary)]">
                          <Lock size={20} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-primary)] truncate">
                          {ficha.area}
                        </span>
                        {ficha.desbloqueada ? (
                          <Badge variant="correcto">Dominada</Badge>
                        ) : (
                          <Badge variant="pendiente">Bloqueada</Badge>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-sm text-[var(--text-primary)] leading-tight mt-0.5 truncate">
                        {ficha.temaCurricular}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                        {ficha.desbloqueada
                          ? ficha.narrativa
                          : 'Resuelve la misión asociada en el aula para revelar.'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Columna Derecha: Visor de Carta de Conocimiento (7 cols) */}
          <div className="lg:col-span-7">
            {fichaSeleccionada ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={fichaSeleccionada.fichaId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="flex flex-col gap-5 border-2 border-[var(--brand-primary)] bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-muted)] shadow-[var(--shadow-c)] p-6">
                    {/* Encabezado de la Carta */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-muted)]">
                      <div className="flex items-center gap-3.5">
                        <fichaSeleccionada.IconoVisual className="w-14 h-14 shrink-0" />
                        <div>
                          <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                            {fichaSeleccionada.area}
                          </span>
                          <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
                            {fichaSeleccionada.temaCurricular}
                          </h3>
                        </div>
                      </div>

                      {fichaSeleccionada.desbloqueada ? (
                        <Badge variant="repaso">
                          <CheckCircle2 size={11} /> Desbloqueada
                        </Badge>
                      ) : (
                        <Badge variant="pendiente">
                          <Lock size={11} /> Requiere Misión
                        </Badge>
                      )}
                    </div>

                    {/* Resumen Pedagógico Clave */}
                    <div className="p-4 rounded-xl bg-[color-mix(in_oklch,var(--brand-primary)_8%,var(--bg-panel))] border border-[var(--border-muted)] flex flex-col gap-1.5">
                      <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--brand-primary)] flex items-center gap-1.5">
                        <BookOpen size={13} />
                        Lección Principal del Saber
                      </span>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                        {fichaSeleccionada.desbloqueada
                          ? fichaSeleccionada.narrativa
                          : 'Esta ficha curricular permanece sellada. Completa la misión correspondiente en el tablero de aventuras para acceder a sus conocimientos y conceptos clave.'}
                      </p>
                    </div>

                    {/* Glosario de Conceptos Clave */}
                    {fichaSeleccionada.desbloqueada && (
                      <div className="flex flex-col gap-2.5">
                        <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                          Conceptos Fundamentales
                        </span>
                        <div className="flex flex-col gap-2">
                          {fichaSeleccionada.conceptosClave?.map((c, i) => {
                            const partes = String(c).split(':');
                            const termino = partes[0];
                            const definicion = partes.slice(1).join(':').trim();

                            return (
                              <div
                                key={i}
                                className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-muted)] flex flex-col gap-0.5"
                              >
                                <span className="font-display font-bold text-xs text-[var(--brand-primary)]">
                                  ✦ {termino}
                                </span>
                                {definicion && (
                                  <p className="text-xs text-[var(--text-secondary)] leading-snug">
                                    {definicion}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cita de Sabiduría Curricular */}
                    <div className="p-3 rounded-xl bg-[var(--bg-accent)] border-l-4 border-[var(--brand-gold)] text-xs text-[var(--text-secondary)] italic">
                      "{fichaSeleccionada.sabiduriaCurricular}"
                    </div>

                    {/* CTA para practicar */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-muted)]">
                      <span className="text-xs text-[var(--text-secondary)] font-display font-medium">
                        {fichaSeleccionada.desbloqueada
                          ? 'Ficha disponible para consulta curricular.'
                          : 'Misión aún no realizada en esta aula.'}
                      </span>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/alumno/misiones')}
                      >
                        <RefreshCw size={14} />
                        Ir a Misiones
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            ) : (
              <Card className="p-12 text-center text-[var(--text-secondary)]">
                Selecciona una carta del Grimorio para leer sus lecciones.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GrimorioSaber;
