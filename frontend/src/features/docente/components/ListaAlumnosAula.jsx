import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Star, Flame, Swords, Shield,
  Award, Sparkles, Copy, Check, UserCheck
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import ArtFrame from '../../../components/ui/ArtFrame';
import { useAlumnosAula } from '../../../hooks/useMetricas';
import useSessionStore, { formatearTitulo } from '../../../store/useSessionStore';
import { playSuccess, playParchment } from '../../../utils/audio';

const MASCOTA_IMG = {
  buho: '/images/mascotas/buho.png',
  dragon: '/images/mascotas/dragon.png',
  gato: '/images/mascotas/gato.png',
  'mascota-lechuza': '/images/mascotas/buho.png',
  'mascota_buho': '/images/mascotas/buho.png',
  'mascota_dragon': '/images/mascotas/dragon.png',
  'mascota_gato': '/images/mascotas/gato.png',
};

export default function ListaAlumnosAula({ aulaId }) {
  const storeAulaId = useSessionStore((s) => s.aulaActivaId);
  const targetAulaId = aulaId || storeAulaId;
  const codigoInvitacion = useSessionStore((s) => s.codigoInvitacionAula);

  const { data: alumnos, isLoading, isError } = useAlumnosAula(targetAulaId);
  const [busqueda, setBusqueda] = useState('');
  const [copiado, setCopiado] = useState(false);

  const alumnosFiltrados = useMemo(() => {
    if (!alumnos || !Array.isArray(alumnos)) return [];
    if (!busqueda.trim()) return alumnos;
    const q = busqueda.toLowerCase().trim();
    return alumnos.filter(
      (a) =>
        a.nombreCompleto?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.tituloEquipado?.toLowerCase().includes(q)
    );
  }, [alumnos, busqueda]);

  const handleCopyCode = () => {
    if (!codigoInvitacion) return;
    navigator.clipboard?.writeText(codigoInvitacion);
    setCopiado(true);
    playSuccess();
    setTimeout(() => setCopiado(false), 2000);
  };

  const total = alumnos?.length || 0;

  return (
    <Card className="flex flex-col gap-5">
      {/* ── Encabezado de la lista ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-muted)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[8px_12px_10px_10px] bg-[color-mix(in_oklch,var(--brand-primary)_15%,var(--bg-panel))] flex items-center justify-center text-[var(--brand-primary)] shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                Alumnos del Aula
              </h3>
              <Badge variant="violet">{total} inscriptos</Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Retratos, equipamiento y avance individual pedagógico de tu curso.
            </p>
          </div>
        </div>

        {/* Buscador */}
        {total > 0 && (
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o título..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        )}
      </div>

      {/* ── Contenido: Spinner / Vacío / Grid ── */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="md" label="Cargando expedientes de los alumnos..." />
        </div>
      ) : isError ? (
        <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
          No se pudieron cargar los datos de los alumnos en este momento.
        </div>
      ) : total === 0 ? (
        /* Estado vacío: sin alumnos inscriptos aún */
        <div className="p-8 text-center flex flex-col items-center gap-4 bg-[var(--bg-muted)]/50 rounded-2xl border border-[var(--border-muted)]">
          <div className="w-14 h-14 rounded-full bg-[var(--bg-accent)] flex items-center justify-center text-[var(--brand-primary)]">
            <Users size={28} />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h4 className="font-display font-bold text-base text-[var(--text-primary)]">
              Tu aula aún no tiene alumnos inscriptos
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Comparte el código de invitación con tus estudiantes para que creen su cuenta y se unan al aula.
            </p>
          </div>
          {codigoInvitacion && (
            <div className="flex items-center gap-2 pt-1">
              <span className="font-display font-black text-lg tracking-widest text-[var(--brand-primary)] bg-[var(--bg-panel)] px-3 py-1 rounded-lg border border-[var(--border-muted)]">
                {codigoInvitacion}
              </span>
              <Button size="sm" variant={copiado ? 'primary' : 'ghost'} onClick={handleCopyCode}>
                {copiado ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiado ? '¡Copiado!' : 'Copiar Código'}</span>
              </Button>
            </div>
          )}
        </div>
      ) : alumnosFiltrados.length === 0 ? (
        <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
          No se encontraron alumnos con el término "{busqueda}".
        </div>
      ) : (
        /* Grid de Alumnos */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alumnosFiltrados.map((alumno, idx) => {
            const petImg = alumno.mascotaEquipada ? MASCOTA_IMG[alumno.mascotaEquipada] : null;

            return (
              <motion.div
                key={alumno.alumnoId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-4 rounded-[14px_18px_16px_16px] bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-accent)] border-2 border-[var(--border)] shadow-[var(--shadow-c)] flex gap-3.5 items-start relative group hover:border-[var(--brand-primary)] transition-all"
              >
                {/* Avatar y Mascota */}
                <div className="relative shrink-0">
                  <ArtFrame
                    avatarId={alumno.avatarEquipado || 'erudito_arcano'}
                    shape={alumno.marcoEquipado || 'scroll'}
                    aspectRatio="1/1"
                    className="w-16 h-16 shadow-sm"
                  />
                  {petImg && (
                    <div
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full border border-[var(--brand-gold)] overflow-hidden shadow-xs bg-[var(--bg-panel)] p-0.5 z-10"
                      title={`Mascota equipada: ${alumno.mascotaEquipada}`}
                    >
                      <img src={petImg} alt="Mascota" className="w-full h-full object-cover rounded-full" />
                    </div>
                  )}
                </div>

                {/* Info & Avance */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <h4 className="font-display font-bold text-sm text-[var(--text-primary)] truncate" title={alumno.nombreCompleto}>
                      {alumno.nombreCompleto}
                    </h4>
                    <Badge variant="nivel">Nv. {alumno.nivel}</Badge>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="violet" className="text-[10px] py-0 px-2 truncate max-w-[170px]">
                      {formatearTitulo(alumno.tituloEquipado)}
                    </Badge>
                  </div>

                  {/* Micro-stats individuales */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-display font-semibold text-[var(--text-secondary)] border-t border-[var(--border-muted)]">
                    <span className="flex items-center gap-1 text-[var(--brand-primary)]" title="Experiencia acumulada">
                      <Star size={12} className="text-[#FCD34D]" />
                      <strong>{alumno.experienciaXP}</strong> XP
                    </span>
                    <span className="flex items-center gap-1" title="Días de racha activa">
                      <Flame size={12} className="text-amber-500" />
                      <strong>{alumno.rachaDiasActivos}</strong> d
                    </span>
                    <span className="flex items-center gap-1 text-[var(--brand-emerald)]" title="Misiones resueltas">
                      <Swords size={12} />
                      <strong>{alumno.misionesCompletadas}</strong>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
