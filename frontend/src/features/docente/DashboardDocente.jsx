import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Inbox, Swords, ArrowRight, BookOpen,
  Copy, Check, KeyRound, TrendingUp, Clock, Award,
  Lightbulb, Users, ChevronRight
} from 'lucide-react';
import { useBorradoresDocente } from '../../hooks/useMisiones';
import { useMisAulas } from '../../hooks/useAulas';
import useSessionStore from '../../store/useSessionStore';
import FormGenerarMision from './components/FormGenerarMision';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ArtFrame from '../../components/ui/ArtFrame';
import { playSuccess } from '../../utils/audio';

/** Animación de entrada escalonada para las tarjetas de stat */
const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22, delay: i * 0.08 },
  }),
};

/**
 * StatCard — Tarjeta métrica del dashboard con animación de entrada
 */
function StatCard({ icon: Icon, iconBg, iconColor, label, value, badge, sub, onClick, index }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card
        hoverable={Boolean(onClick)}
        onClick={onClick}
        className="flex flex-col justify-between gap-4 h-full"
      >
        <div className="flex items-center justify-between">
          <div className={`w-10 h-10 rounded-[8px_12px_10px_10px] ${iconBg} flex items-center justify-center`}>
            <Icon size={20} className={iconColor} />
          </div>
          {badge}
        </div>
        <div>
          <span className="text-3xl font-display font-black text-[var(--text-primary)]">
            {value}
          </span>
          <p className="text-xs font-display font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
            {label}
          </p>
          {sub && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">{sub}</p>
          )}
        </div>
        {onClick && (
          <div className="flex items-center gap-1 text-xs font-display font-semibold text-[var(--brand-primary)]">
            <span>Ver detalles</span>
            <ArrowRight size={13} />
          </div>
        )}
      </Card>
    </motion.div>
  );
}

/**
 * Consejos pedagógicos rotativos — añaden vida al panel docente
 */
const TIPS = [
  { icon: Lightbulb, text: 'Una narrativa inmersiva aumenta un 40% la retención del contenido en juegos educativos.' },
  { icon: TrendingUp, text: 'Las misiones con 4-5 preguntas tienen la mejor relación entre esfuerzo y aprendizaje.' },
  { icon: Award, text: 'Calibrar el XP entre 80 y 200 puntos mantiene la motivación sin trivializar el logro.' },
  { icon: BookOpen, text: 'Textos de fuente entre 200 y 800 palabras generan las mejores propuestas de la IA.' },
];

/**
 * DashboardDocente v3 — Panel principal del Docente (HITL + Diagnóstico)
 */
function DashboardDocente() {
  const navigate = useNavigate();
  const [isGenerarOpen, setIsGenerarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));

  useMisAulas(); // Sincroniza las aulas y el código de invitación activo
  const usuario = useSessionStore((s) => s.usuario);
  const codigoInvitacion = useSessionStore((s) => s.codigoInvitacionAula);

  const { data: borradores } = useBorradoresDocente();

  const cantBorradores = borradores?.length ?? 0;

  const tip = TIPS[tipIdx];
  const TipIcon = tip.icon;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(codigoInvitacion);
    setCopied(true);
    playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const primerNombre = usuario?.nombreCompleto?.split(' ')[0] ?? 'Docente';

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">

      {/* ── Banner de bienvenida ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-[16px_22px_18px_20px] bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-muted)] border-2 border-[var(--border)] shadow-[var(--shadow-c)]"
      >
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Badge variant="nivel">Panel Docente</Badge>
            <span className="text-xs font-display text-[var(--text-muted)] uppercase tracking-wider">
              Control Pedagógico HITL
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl text-[var(--text-primary)]">
            Bienvenido, {primerNombre} 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Supervisa el contenido gamificado, valida las propuestas de IA y mantené el aula activa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            variant="primary"
            onClick={() => setIsGenerarOpen(true)}
            className="whitespace-nowrap"
          >
            <Sparkles size={16} className="text-[#FCD34D]" />
            Generar Misión con IA
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/docente/misiones/pendientes')}
            className="whitespace-nowrap"
          >
            <Inbox size={16} />
            Ir al Inbox
          </Button>
        </div>
      </motion.div>

      {/* ── Grid de métricas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Stat 1: Borradores */}
        <StatCard
          index={0}
          icon={Inbox}
          iconBg="bg-[var(--brand-primary)]"
          iconColor="text-white"
          label="Borradores por Validar"
          value={cantBorradores}
          badge={
            cantBorradores > 0 ? (
              <Badge variant="racha" glow>{cantBorradores} pendientes</Badge>
            ) : (
              <Badge variant="correcto">Al día</Badge>
            )
          }
          onClick={() => navigate('/docente/misiones/pendientes')}
        />

        {/* Stat 2: Diagnóstico & Métricas del Aula */}
        <StatCard
          index={1}
          icon={TrendingUp}
          iconBg="bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))]"
          iconColor="text-[var(--brand-emerald)]"
          label="Participación del Aula"
          value="92%"
          badge={<Badge variant="correcto">Excelente</Badge>}
          sub="Tasa de actividad semanal y análisis de errores."
          onClick={() => navigate('/docente/metricas')}
        />

        {/* Stat 3: Código de Invitación */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="sm:col-span-2 lg:col-span-1"
        >
          <Card className="flex flex-col justify-between gap-3 h-full border-2 border-[var(--brand-primary)]">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-[8px_12px_10px_10px] bg-[var(--bg-accent)] flex items-center justify-center text-[var(--brand-primary)]">
                <KeyRound size={20} />
              </div>
              <Badge variant="correcto">Inscripción Abierta</Badge>
            </div>
            <div>
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Código de Invitación del Aula
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                {codigoInvitacion ? (
                  <span className="font-display font-black text-2xl tracking-[0.25em] text-[var(--brand-primary)] bg-[var(--bg-base)] px-3 py-1 rounded-lg border border-[var(--border-muted)]">
                    {codigoInvitacion}
                  </span>
                ) : (
                  <span className="h-9 w-32 rounded-lg bg-[var(--bg-muted)] animate-pulse block" aria-label="Cargando código de invitación" />
                )}
                <Button
                  size="sm"
                  variant={copied ? 'primary' : 'ghost'}
                  onClick={handleCopyCode}
                  disabled={!codigoInvitacion}
                  title="Copiar código para los alumnos"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Compartí este código con tu curso para que los alumnos se registren e ingresen a esta Aula.
            </p>
          </Card>
        </motion.div>
      </div>

      {/* ── Sección inferior: ArtFrame + Tip pedagógico ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <ArtFrame
          label="Ilustración: Grimorio del Mentor Docente"
          shape="scroll"
          aspectRatio="16/9"
        />

        <div className="flex flex-col gap-4 justify-center">
          {/* Tip pedagógico */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-start gap-3 p-4 rounded-[12px_16px_14px_14px] bg-[color-mix(in_oklch,var(--brand-gold)_10%,var(--bg-panel))] border border-[color-mix(in_oklch,var(--brand-gold)_30%,transparent)]"
          >
            <TipIcon size={18} className="text-[var(--brand-gold)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-gold)] mb-1">
                Consejo pedagógico
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {tip.text}
              </p>
            </div>
          </motion.div>

          {/* Info HITL */}
          <div className="flex flex-col gap-2">
            <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
              Agencia Pedagógica & IA
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              La plataforma usa un modelo <strong>HITL</strong> donde la IA asiste pero nunca reemplaza tu criterio pedagógico. Calibrás el XP, corregís opciones y enriquecés la narrativa antes de cada publicación.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/docente/misiones/pendientes')}
            >
              <BookOpen size={15} />
              Inbox de Misiones
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/docente/metricas')}
            >
              <TrendingUp size={15} />
              Diagnóstico de Aula
              <ChevronRight size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsGenerarOpen(true)}
            >
              <Sparkles size={15} className="text-[#FCD34D]" />
              Nueva misión
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Generar con IA */}
      <FormGenerarMision
        isOpen={isGenerarOpen}
        onClose={() => setIsGenerarOpen(false)}
      />
    </div>
  );
}

export default DashboardDocente;
