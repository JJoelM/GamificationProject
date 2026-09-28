import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swords, ArrowRight, Compass, Sparkles, Map, RefreshCw, BookOpen, Zap } from 'lucide-react';
import { useMisionesActivas } from '../../hooks/useMisiones';
import { usePersonaje } from '../../hooks/usePersonaje';
import useSessionStore from '../../store/useSessionStore';
import HojaPersonaje from './components/HojaPersonaje';
import RankingAula from './components/RankingAula';
import VitrinaLogros from './components/VitrinaLogros';
import TarjetaMision from './components/TarjetaMision';
import ResolverMision from './components/ResolverMision';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ArtFrame from '../../components/ui/ArtFrame';

/**
 * DashboardAlumno v3 — Hub central del alumno con personalidad, distinción de nuevas/repaso
 * y avatar interactivo.
 */
function DashboardAlumno() {
  const navigate = useNavigate();
  usePersonaje(); // Sincroniza XP, AP y racha con backend
  const { data: misiones, isLoading } = useMisionesActivas();
  const [misionSeleccionada, setMisionSeleccionada] = useState(null);

  const misionesResueltas = useSessionStore((s) => s.misionesResueltas) || {};

  // Ordenamos para priorizar misiones NUEVAS en la vista rápida del dashboard
  const { misionesOrdenadas, cantNuevas, cantRepaso } = useMemo(() => {
    if (!misiones) return { misionesOrdenadas: [], cantNuevas: 0, cantRepaso: 0 };
    const nuevas = [];
    const resueltas = [];

    misiones.forEach((m) => {
      if (misionesResueltas[m.misionId]?.completada) {
        resueltas.push(m);
      } else {
        nuevas.push(m);
      }
    });

    return {
      misionesOrdenadas: [...nuevas, ...resueltas],
      cantNuevas: nuevas.length,
      cantRepaso: resueltas.length,
    };
  }, [misiones, misionesResueltas]);

  const misionesDestacadas = misionesOrdenadas.slice(0, 2);
  const cantTotal = misiones?.length ?? 0;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">

      {/* ── 1. Hoja de Personaje y Progreso ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <HojaPersonaje />
      </motion.div>

      {/* ── 2. Grid: Misiones Destacadas + Ranking ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Columna izquierda (2/3): Misiones activas */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Compass className="text-[var(--brand-primary)]" size={20} />
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
                Misiones del Aula
              </h3>
              {cantNuevas > 0 ? (
                <Badge variant="violet" glow>
                  <Sparkles size={10} /> {cantNuevas} {cantNuevas === 1 ? 'nueva' : 'nuevas'}
                </Badge>
              ) : cantTotal > 0 ? (
                <Badge variant="repaso">
                  <RefreshCw size={10} /> {cantRepaso} para repaso
                </Badge>
              ) : null}
            </div>

            {cantTotal > 0 && (
              <button
                onClick={() => navigate('/alumno/misiones')}
                className="text-xs font-display font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas ({cantTotal})</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Spinner size="md" label="Explorando misiones disponibles..." />
            </div>
          ) : misionesDestacadas.length === 0 ? (
            /* Estado vacío narrativo */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <Card className="flex flex-col sm:flex-row items-center gap-6 p-8">
                <ArtFrame
                  label="Ilustración: Mapa en blanco esperando aventuras"
                  shape="scroll"
                  aspectRatio="1/1"
                  className="w-28 shrink-0"
                />
                <div className="flex flex-col gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Map size={18} className="text-[var(--brand-gold)]" />
                    <h4 className="font-display font-bold text-lg text-[var(--text-primary)]">
                      El tablero aguarda...
                    </h4>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
                    Tu docente aún no ha publicado misiones activas. Mientras tanto, podés explorar tus logros
                    o personalizar tu personaje. ¡Las aventuras están por llegar!
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {misionesDestacadas.map((mision, i) => (
                <TarjetaMision
                  key={mision.misionId}
                  mision={mision}
                  onResolver={setMisionSeleccionada}
                  index={i}
                />
              ))}
            </div>
          )}

          {cantTotal > 2 && (
            <div className="text-center pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/alumno/misiones')}
              >
                <Compass size={15} />
                Explorar el Tablero Completo ({cantTotal} misiones)
              </Button>
            </div>
          )}
        </div>

        {/* Columna derecha (1/3): Ranking */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.15 }}
          className="lg:col-span-1"
        >
          <RankingAula mejoraSemanal={28} />
        </motion.div>
      </div>

      {/* ── Accesos Rápidos: Grimorio del Saber & Bazar del Alquimista ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner Grimorio */}
        <Card
          hoverable
          onClick={() => navigate('/alumno/grimorio')}
          className="flex items-center justify-between gap-4 p-5 border-2 border-[var(--border-muted)] bg-gradient-to-br from-[var(--bg-panel)] to-[color-mix(in_oklch,var(--brand-primary)_8%,var(--bg-panel))] cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[10px_14px_12px_12px] bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_var(--border)] group-hover:scale-105 transition-transform">
              <BookOpen size={24} />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[var(--text-primary)]">
                Grimorio del Saber
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Consulta tus cartas de conocimiento curricular desbloqueadas.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[var(--brand-primary)] transition-transform group-hover:translate-x-1 shrink-0" />
        </Card>

        {/* Banner Bazar */}
        <Card
          hoverable
          onClick={() => navigate('/alumno/bazar')}
          className="flex items-center justify-between gap-4 p-5 border-2 border-[var(--border-muted)] bg-gradient-to-br from-[var(--bg-panel)] to-[color-mix(in_oklch,var(--brand-violet)_8%,var(--bg-panel))] cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[10px_14px_12px_12px] bg-[var(--brand-violet)] text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_var(--border)] group-hover:scale-105 transition-transform">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-base text-[var(--text-primary)]">
                  Bazar del Alquimista
                </h4>
                <Badge variant="violet">
                  {useSessionStore.getState().apTotal || 0} AP
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Equipa mascotas, marcos de retrato y escudos de estudio.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[var(--brand-violet)] transition-transform group-hover:translate-x-1 shrink-0" />
        </Card>
      </div>

      {/* ── 3. Vitrina de Logros ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.25 }}
      >
        <VitrinaLogros />
      </motion.div>

      {/* Modal de Resolución interactiva */}
      <ResolverMision
        mision={misionSeleccionada}
        isOpen={Boolean(misionSeleccionada)}
        onClose={() => setMisionSeleccionada(null)}
      />
    </div>
  );
}

export default DashboardAlumno;
