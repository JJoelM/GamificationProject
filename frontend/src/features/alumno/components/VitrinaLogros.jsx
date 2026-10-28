import { useMemo } from 'react';
import { Trophy, Lock, Sparkles, CheckCircle2, Compass, Flame, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import useSessionStore from '../../../store/useSessionStore';
import { useMisionesActivas } from '../../../hooks/useMisiones';

/**
 * VitrinaLogros v2 — Galería de medallas con animación de desbloqueo,
 * tooltip expandible, y efecto "recién obtenida" para logros nuevos.
 */

export const LOGROS_DISPONIBLES = [
  {
    id: 'primer_paso',
    nombre: 'Primer Paso',
    descripcion: 'Completar con éxito tu primera misión del aula.',
    pista: 'Resuelve cualquier misión activa en el tablero.',
    Icon: Star,
    color: '#FCD34D',
    xpReward: 50,
  },
  {
    id: 'mente_critica',
    nombre: 'Mente Crítica',
    descripcion: 'Obtener un 100% de precisión en un desafío interactivo.',
    pista: 'Responde todas las preguntas de una misión sin fallar.',
    Icon: Sparkles,
    color: '#34D399',
    xpReward: 100,
  },
  {
    id: 'sabio_constante',
    nombre: 'Sabio Constante',
    descripcion: 'Mantener un hábito activo de estudio de 5 días.',
    pista: 'Ingresá a la plataforma y participá durante 5 días.',
    Icon: Flame,
    color: '#F59E0B',
    xpReward: 150,
  },
  {
    id: 'explorador_curioso',
    nombre: 'Explorador Curioso',
    descripcion: 'Resolver 3 o más misiones de diferentes temas curriculares.',
    pista: 'Explorá diversos temas disponibles en el tablero.',
    Icon: Compass,
    color: '#38BDF8',
    xpReward: 120,
  },
  {
    id: 'repaso_magistral',
    nombre: 'Repaso Magistral',
    descripcion: 'Consolidar tu aprendizaje resolviendo una misión en modo repaso.',
    pista: 'Volvé a practicar una misión ya completada.',
    Icon: BookOpen,
    color: '#A78BFA',
    xpReward: 80,
  },
  {
    id: 'maestro_del_saber',
    nombre: 'Maestro del Saber',
    descripcion: 'Alcanzar el Nivel 4 y desbloquear el rango Erudito de las Runas.',
    pista: 'Acumulá más de 1200 XP en tus misiones.',
    Icon: Trophy,
    color: '#E879F9',
    xpReward: 250,
  },
];

/** Staggered card animation */
const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 240, damping: 20, delay: i * 0.07 },
  }),
};

function VitrinaLogros() {
  const storeLogros = useSessionStore((s) => s.logrosDesbloqueados) || [];
  const xpTotal = useSessionStore((s) => s.xpTotal) || 0;
  const rachaDias = useSessionStore((s) => s.rachaDias) || 0;
  const { data: misiones } = useMisionesActivas();
  const misionesResueltasStore = useSessionStore((s) => s.misionesResueltas) || {};

  const logrosDesbloqueados = useMemo(() => {
    const setLogros = new Set(storeLogros);

    const misionesArray = Array.isArray(misiones) ? misiones : [];
    const completadas = misionesArray.filter(
      (m) => m.completada || misionesResueltasStore[m.misionId]?.completada
    );

    // 1. Primer Paso: completó al menos una misión
    if (completadas.length > 0) setLogros.add('primer_paso');

    // 2. Mente Crítica: 100% de precisión
    if (
      completadas.some(
        (m) => (m.mejorPorcentaje === 100) || (misionesResueltasStore[m.misionId]?.mejorPuntaje === 100)
      )
    ) {
      setLogros.add('mente_critica');
    }

    // 3. Sabio Constante: 5 o más días de racha activa
    if (rachaDias >= 5) setLogros.add('sabio_constante');

    // 4. Explorador Curioso: 3 o más misiones completadas
    if (completadas.length >= 3) setLogros.add('explorador_curioso');

    // 5. Repaso Magistral: misión resuelta más de una vez
    if (
      completadas.some(
        (m) => (m.intentos > 1) || (misionesResueltasStore[m.misionId]?.intentos > 1)
      )
    ) {
      setLogros.add('repaso_magistral');
    }

    // 6. Maestro del Saber: alcanzar 1200+ XP
    if (xpTotal >= 1200) setLogros.add('maestro_del_saber');

    return Array.from(setLogros);
  }, [storeLogros, misiones, misionesResueltasStore, rachaDias, xpTotal]);

  const countDesbloqueados = logrosDesbloqueados.length;
  const total = LOGROS_DISPONIBLES.length;
  const progreso = Math.round((countDesbloqueados / total) * 100);

  return (
    <Card className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[6px_10px_8px_8px] bg-[var(--brand-gold)] flex items-center justify-center text-[#1C0A00]">
            <Trophy size={16} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
              Vitrina de Logros
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              {countDesbloqueados} de {total} medallas obtenidas
            </span>
          </div>
        </div>

        <Badge variant="racha">
          <Sparkles size={11} /> {progreso}% completado
        </Badge>
      </div>

      {/* Barra de progreso de colección */}
      <div className="w-full h-2 rounded-full bg-[var(--bg-accent)] border border-[var(--border-muted)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-secondary)]"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
        />
      </div>

      {/* Grid de medallas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {LOGROS_DISPONIBLES.map((logro, i) => {
          const isUnlocked = logrosDesbloqueados.includes(logro.id);
          const Icon = logro.Icon;

          return (
            <motion.div
              key={logro.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={[
                'p-3.5 rounded-[12px_16px_14px_14px] border-2 flex flex-col justify-between gap-2.5 transition-all relative overflow-hidden group',
                isUnlocked
                  ? 'bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-accent)] border-[var(--brand-gold)] shadow-[3px_3px_0px_var(--border)]'
                  : 'bg-[var(--bg-muted)] border-[var(--border-muted)] opacity-60',
              ].join(' ')}
            >
              {/* Glow recién desbloqueado */}
              {isUnlocked && (
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 blur-xl pointer-events-none"
                  style={{ background: logro.color }}
                  aria-hidden="true"
                />
              )}

              <div className="flex items-start justify-between gap-2">
                <motion.div
                  className={[
                    'w-11 h-11 rounded-[10px_14px_12px_12px] flex items-center justify-center shrink-0 border shadow-sm',
                    isUnlocked
                      ? 'bg-[var(--bg-panel)] border-[var(--brand-gold)]'
                      : 'bg-[var(--bg-panel)] border-[var(--border-muted)] text-[var(--text-muted)]',
                  ].join(' ')}
                  style={{ color: isUnlocked ? logro.color : 'inherit' }}
                  whileHover={isUnlocked ? { rotate: [0, -8, 8, -4, 0], scale: 1.1 } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Icon size={22} strokeWidth={isUnlocked ? 2.5 : 1.5} />
                </motion.div>

                {isUnlocked ? (
                  <Badge variant="correcto">
                    <CheckCircle2 size={11} /> Obtenida
                  </Badge>
                ) : (
                  <Badge variant="pendiente">
                    <Lock size={10} /> Bloqueada
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">
                  {logro.nombre}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                  {isUnlocked ? logro.descripcion : logro.pista}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-muted)] flex items-center justify-between text-[11px] font-display font-bold text-[var(--text-muted)]">
                <span>Recompensa:</span>
                <span className="text-[var(--brand-gold)]">+{logro.xpReward} XP</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export default VitrinaLogros;
