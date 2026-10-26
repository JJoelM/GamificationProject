import { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Zap, BookOpen, Loader2, Compass, Swords, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import { useGenerarMisionIa } from '../../../hooks/useMisionMutations';
import { playChime, playParchment } from '../../../utils/audio';

/**
 * Plantillas disponibles para la invocación de la IA
 */
const PLANTILLAS = [
  {
    id: 'OpcionMultiple',
    titulo: 'Opción Múltiple',
    badge: 'Quiz Clásico',
    descripcion: 'Preguntas conceptuales directas con retroalimentación didáctica inmediata.',
    Icono: Compass,
    colorBorde: 'border-[var(--brand-primary)]',
    bgActivo: 'bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))]',
    textColor: 'text-[var(--brand-primary)]',
  },
  {
    id: 'BatallaDeJefe',
    titulo: 'Batalla de Jefe',
    badge: 'Combate Épico',
    descripcion: 'Enfrentamiento táctico por turnos contra una criatura con 100 HP y fases de daño.',
    Icono: Swords,
    colorBorde: 'border-[var(--brand-crimson)]',
    bgActivo: 'bg-[color-mix(in_oklch,var(--brand-crimson)_12%,var(--bg-panel))]',
    textColor: 'text-[var(--brand-crimson)]',
  },
  {
    id: 'LineaTemporal',
    titulo: 'Línea Temporal',
    badge: 'Orden Forense',
    descripcion: 'Reconstrucción cronológica de hitos históricos y deducción de la anomalía.',
    Icono: Clock,
    colorBorde: 'border-[var(--brand-violet)]',
    bgActivo: 'bg-[color-mix(in_oklch,var(--brand-violet)_12%,var(--bg-panel))]',
    textColor: 'text-[var(--brand-violet)]',
  },
];

/**
 * Mensajes animados mientras la IA trabaja — agregan vida al estado de espera
 */
const MENSAJES_IA = [
  'Consultando el grimorio digital...',
  'La IA está tramando la narrativa...',
  'Calibrando las preguntas pedagógicas...',
  'Tejiendo el hilo argumentativo...',
  'Revisando coherencia curricular...',
  'Ajustando nivel de dificultad...',
  'Casi listo el borrador...',
];

function PantallaGenerando() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MENSAJES_IA.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 px-4">
      {/* Orbe animado */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Anillo exterior giratorio */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--brand-primary)] border-r-[var(--brand-secondary)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
        {/* Anillo interior contrarotatorio */}
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-transparent border-b-[var(--brand-gold)] border-l-[var(--brand-emerald)]"
          animate={{ rotate: -360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Ícono central */}
        <div className="w-10 h-10 rounded-full bg-[var(--bg-accent)] flex items-center justify-center">
          <BrainCircuit size={22} className="text-[var(--brand-primary)]" />
        </div>
        {/* Partículas orbitales */}
        {[0, 120, 240].map((deg) => (
          <motion.div
            key={deg}
            className="absolute w-2 h-2 rounded-full bg-[var(--brand-gold)]"
            style={{ transformOrigin: '48px 48px' }}
            animate={{ rotate: [deg, deg + 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: deg / 360 }}
          />
        ))}
      </div>

      {/* Mensaje rotativo */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="font-display font-semibold text-[var(--text-primary)] text-sm"
          >
            {MENSAJES_IA[idx]}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Esto tarda entre 10 y 30 segundos según la longitud del texto.
        </p>
      </div>

      {/* Barra de progreso indeterminada */}
      <div className="w-full max-w-xs h-1.5 rounded-full bg-[var(--bg-accent)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-gold)]"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '50%' }}
        />
      </div>
    </div>
  );
}

/**
 * FormGenerarMision v2 — Modal para invocar la generación con IA de una nueva misión.
 *
 * Mejoras:
 * - Estado de generación con spinner narrativo animado
 * - Pantalla de éxito con acceso directo al borrador
 * - Contador de caracteres para el texto fuente
 * - Tips de uso visible en el formulario
 */
function FormGenerarMision({ isOpen, onClose }) {
  const [temaCurricular, setTemaCurricular] = useState('');
  const [textoFuente, setTextoFuente] = useState('');
  const [tipoPlantilla, setTipoPlantilla] = useState('OpcionMultiple');
  const [misionGeneradaId, setMisionGeneradaId] = useState(null);

  const { mutate: generarMision, isPending, error, reset } = useGenerarMisionIa();

  const handleClose = () => {
    reset();
    setTemaCurricular('');
    setTextoFuente('');
    setTipoPlantilla('OpcionMultiple');
    setMisionGeneradaId(null);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!temaCurricular.trim() || !textoFuente.trim()) return;

    generarMision(
      {
        temaCurricular: temaCurricular.trim(),
        textoFuente: textoFuente.trim(),
        tipoPlantilla,
      },
      {
        onSuccess: (data) => {
          playChime();
          setMisionGeneradaId(data?.misionId ?? 'nuevo');
        },
      }
    );
  };

  const textoLen = textoFuente.length;
  const textoOk = textoLen >= 50;
  const textoWarn = textoLen > 4000;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? undefined : handleClose}
      title={misionGeneradaId ? '¡Borrador Creado!' : 'Invocar Nueva Misión con IA'}
      size="lg"
    >
      {/* Estado: generando */}
      {isPending && <PantallaGenerando />}

      {/* Estado: éxito */}
      {!isPending && misionGeneradaId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5 py-8 px-4 text-center"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-4 border-[var(--brand-emerald)] flex items-center justify-center"
            >
              <Sparkles size={32} className="text-[var(--brand-emerald)]" />
            </motion.div>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
              ¡Borrador listo para revisión!
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xs">
              La IA generó el desafío pedagógico. Ahora es tu turno de validarlo, editarlo y calibrarlo en tu Inbox antes de publicarlo al aula.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <Button variant="ghost" onClick={handleClose} className="flex-1">
              Ir al Inbox
            </Button>
            {misionGeneradaId !== 'nuevo' && (
              <Button
                variant="primary"
                onClick={() => {
                  handleClose();
                }}
                className="flex-1"
              >
                <Zap size={15} />
                Revisar ahora
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Estado: formulario */}
      {!isPending && !misionGeneradaId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Descripción del flujo */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[color-mix(in_oklch,var(--brand-primary)_8%,var(--bg-panel))] border border-[color-mix(in_oklch,var(--brand-primary)_20%,transparent)]">
            <BookOpen size={16} className="text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              La IA analizará el material curricular y diseñará la narrativa y desafíos lúdicos correspondientes. El resultado quedará en tu <strong>Inbox como borrador (HITL)</strong> para que lo calibres antes de activarlo.
            </p>
          </div>

          {error && <ErrorBanner error={error} onDismiss={reset} />}

          {/* Selector de Tipo de Plantilla */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Tipo de Desafío Lúdico
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PLANTILLAS.map((p) => {
                const isSelected = tipoPlantilla === p.id;
                const Icon = p.Icono;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      playParchment();
                      setTipoPlantilla(p.id);
                    }}
                    disabled={isPending}
                    className={[
                      'relative flex flex-col items-start text-left p-3 rounded-xl border-2 transition-all cursor-pointer',
                      isSelected
                        ? `${p.colorBorde} ${p.bgActivo} shadow-md scale-[1.01]`
                        : 'border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-panel)] opacity-85 hover:opacity-100',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className={`p-1.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-muted)] ${p.textColor}`}>
                        <Icon size={16} />
                      </div>
                      {isSelected ? (
                        <span className={`w-5 h-5 rounded-full ${p.textColor} bg-[var(--bg-panel)] flex items-center justify-center border border-current`}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="text-[10px] font-display font-bold px-1.5 py-0.5 rounded bg-[var(--bg-accent)] text-[var(--text-muted)]">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-display font-bold text-sm text-[var(--text-primary)] leading-tight">
                      {p.titulo}
                    </span>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                      {p.descripcion}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="temaCurricular"
              className="text-xs font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider"
            >
              Tema Curricular
            </label>
            <input
              id="temaCurricular"
              type="text"
              required
              disabled={isPending}
              placeholder="Ej: La Revolución de Mayo y el Cabildo Abierto"
              value={temaCurricular}
              onChange={(e) => setTemaCurricular(e.target.value)}
              className="px-3.5 py-2.5 rounded-[8px_12px_10px_10px] border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] outline-none text-sm font-sans placeholder:text-[var(--text-muted)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="textoFuente"
                className="text-xs font-display font-semibold text-[var(--text-primary)] uppercase tracking-wider"
              >
                Texto / Material Fuente
              </label>
              <span className={[
                'text-[11px] font-display font-semibold',
                textoWarn ? 'text-[var(--brand-crimson)]' : textoOk ? 'text-[var(--brand-emerald)]' : 'text-[var(--text-muted)]',
              ].join(' ')}>
                {textoLen} / 4000 {textoWarn && '— muy largo, considera recortar'}
              </span>
            </div>
            <textarea
              id="textoFuente"
              required
              rows={7}
              disabled={isPending}
              placeholder="Pegá aquí el contenido educativo, fragmento de libro, apuntes o cualquier material del que la IA va a extraer el conocimiento para construir la misión..."
              value={textoFuente}
              onChange={(e) => setTextoFuente(e.target.value)}
              className={[
                'px-3.5 py-2.5 rounded-[8px_12px_10px_10px] border-2 bg-[var(--bg-base)] text-[var(--text-primary)] outline-none text-sm font-sans placeholder:text-[var(--text-muted)] resize-y transition-colors',
                textoWarn ? 'border-[var(--brand-crimson)]' : 'border-[var(--border)] focus:border-[var(--brand-primary)]',
              ].join(' ')}
            />
            {!textoOk && textoLen > 0 && (
              <p className="text-[11px] text-[var(--brand-gold)] font-display">
                Mínimo 50 caracteres para un resultado óptimo.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[var(--border-muted)]">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
              disabled={!temaCurricular.trim() || !textoOk}
            >
              <Sparkles size={16} className="text-[#FCD34D]" />
              Generar Borrador
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default FormGenerarMision;
