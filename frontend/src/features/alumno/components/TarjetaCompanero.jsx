import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, ArrowRight, MessageSquareQuote } from 'lucide-react';
import useSessionStore from '../../../store/useSessionStore';
import { usePersonaje } from '../../../hooks/usePersonaje';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const MASCOTAS_INFO = {
  buho: {
    id: 'buho',
    nombre: 'Búho Erudito',
    arquetipo: 'Centinela de la Sabiduría',
    imagenSrc: '/images/mascotas/buho.png',
    colorAura: 'from-amber-500/20 to-sky-500/20',
    colorBorde: 'border-amber-500',
    colorTexto: 'text-amber-500',
    dialogo: '«¡Atención al detalle, explorador! La lectura atenta y las pistas reveladas son nuestro mejor hechizo ante la duda.»',
  },
  dragon: {
    id: 'dragon',
    nombre: 'Dragón Guardián',
    arquetipo: 'Protector del Coraje',
    imagenSrc: '/images/mascotas/dragon.png',
    colorAura: 'from-red-500/20 to-orange-500/20',
    colorBorde: 'border-orange-500',
    colorTexto: 'text-orange-500',
    dialogo: '«¡El fuego del saber arde con fuerza! Cada anomalía y cada jefe que enfrentemos templará nuestro coraje.»',
  },
  gato: {
    id: 'gato',
    nombre: 'Gato Místico',
    arquetipo: 'Guía de la Serenidad',
    imagenSrc: '/images/mascotas/gato.png',
    colorAura: 'from-pink-500/20 to-purple-500/20',
    colorBorde: 'border-pink-500',
    colorTexto: 'text-pink-500',
    dialogo: '««Ronroneo arcano» Respirá hondo y analizá con calma; la respuesta correcta siempre se revela al atento.»',
  },
};

// Alias de compatibilidad hacia atrás
MASCOTAS_INFO['buho_erudito'] = MASCOTAS_INFO.buho;
MASCOTAS_INFO['mascota-lechuza'] = MASCOTAS_INFO.buho;
MASCOTAS_INFO['mascota_dragon'] = MASCOTAS_INFO.dragon;
MASCOTAS_INFO['mascota_gato'] = MASCOTAS_INFO.gato;

/**
 * TarjetaCompanero — Destaca a la mascota activa en el Dashboard del Alumno.
 * Otorga peso lúdico y narrativo a las mascotas desbloqueadas en el Bazar.
 */
function TarjetaCompanero() {
  const navigate = useNavigate();
  const { data: personaje } = usePersonaje();
  const storeMascota = useSessionStore((s) => s.mascotaEquipada);

  const mascotaEquipada = personaje?.mascotaEquipada || storeMascota;

  const infoMascota = useMemo(() => {
    if (!mascotaEquipada) return null;
    return MASCOTAS_INFO[mascotaEquipada] || null;
  }, [mascotaEquipada]);

  if (!infoMascota) {
    return (
      <Card className="p-5 border-2 border-dashed border-[var(--border-muted)] bg-gradient-to-b from-[var(--bg-panel)] to-[var(--bg-muted)] text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[var(--bg-accent)] border-2 border-[var(--border-muted)] flex items-center justify-center text-2xl shadow-inner">
          🐾
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="font-display font-bold text-base text-[var(--text-primary)]">
            ¿Viajando en solitario?
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
            En el Bazar podés adoptar un compañero místico (Búho, Dragón o Gato) para que te acompañe en cada desafío.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/alumno/bazar')}
          className="mt-1"
        >
          <Sparkles size={14} />
          <span>Explorar Bazar (250 AP)</span>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-2 border-[var(--brand-gold)] bg-gradient-to-b from-[var(--bg-panel)] to-[color-mix(in_oklch,var(--brand-gold)_6%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-gold)] relative overflow-hidden">
      {/* Aura de fondo */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none bg-gradient-to-br from-[var(--brand-gold)] to-orange-500"
        aria-hidden="true"
      />

      {/* Header de la tarjeta */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Heart size={14} className="text-[var(--brand-gold)] fill-[var(--brand-gold)] animate-pulse" />
          <span className="font-display font-black text-xs uppercase tracking-wider text-[var(--brand-gold)]">
            Compañero Fiel
          </span>
        </div>
        <Badge variant="gold">Leal</Badge>
      </div>

      {/* Cuerpo principal: Retrato circular ampliado + Datos */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="relative shrink-0"
        >
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-[var(--brand-gold)] via-[#FDE047] to-[var(--brand-gold)] shadow-[0_4px_16px_rgba(217,119,6,0.35),2px_2px_0px_#000]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-panel)] flex items-center justify-center">
              <img
                src={infoMascota.imagenSrc}
                alt={infoMascota.nombre}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h4 className="font-display font-black text-lg text-[var(--text-primary)] leading-tight truncate">
            {infoMascota.nombre}
          </h4>
          <span className="text-xs font-display font-bold text-[var(--text-secondary)]">
            {infoMascota.arquetipo}
          </span>

          <button
            type="button"
            onClick={() => navigate('/alumno/bazar')}
            className="inline-flex items-center gap-1 text-[11px] font-display font-semibold text-[var(--brand-primary)] hover:underline mt-1 cursor-pointer"
          >
            <span>Bazar del Alquimista</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Bocadillo de diálogo con personalidad RPG */}
      <div className="mt-3.5 p-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-muted)] relative shadow-inner">
        <div className="flex items-start gap-2">
          <MessageSquareQuote size={15} className="text-[var(--brand-gold)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-primary)] italic leading-snug">
            {infoMascota.dialogo}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default TarjetaCompanero;
