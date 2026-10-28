import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Zap, Shield, Check, ShoppingBag, ArrowLeft,
  Crown, Info, Loader2, Lightbulb, Feather, Heart, Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSessionStore from '../../store/useSessionStore';
import { usePersonaje } from '../../hooks/usePersonaje';
import { useCatalogoBazar, useComprarArticulo, usePersonalizarPersonaje } from '../../hooks/useBazarMutations';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ArtFrame from '../../components/ui/ArtFrame';
import { playSuccess, playParchment } from '../../utils/audio';
import { AVATARES_RPG, getAvatarPorId } from './components/AvataresData';

/** Metadatos visuales complementarios según el ID y tipo del catálogo del backend */
const METADATOS_VISUALES = {
  pista: {
    descripcion: 'Descarta una opción incorrecta en misiones de opción múltiple o batallas de jefe.',
    rareza: 'Consumible',
    colorRareza: 'text-amber-500',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-amber-500/15 border-2 border-amber-500 text-amber-500 shadow-sm`}>
        <Lightbulb size={30} className="animate-pulse" />
      </div>
    ),
  },
  'escudo-racha': {
    descripcion: 'Protege tu racha de días activos por 1 día si no puedes ingresar a estudiar.',
    rareza: 'Consumible',
    colorRareza: 'text-[var(--brand-emerald)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-2 border-[var(--brand-emerald)] text-[var(--brand-emerald)] shadow-sm`}>
        <Shield size={30} className="animate-pulse" />
      </div>
    ),
  },
  scroll: {
    descripcion: 'Marco clásico artesanal con madera noble, cuero y esquineros de bronce.',
    rareza: 'Común',
    colorRareza: 'text-amber-700 dark:text-amber-400',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <ArtFrame shape="scroll" aspectRatio="1/1" className={`${className} shrink-0`}>
        <span className="text-xs font-bold opacity-60">🖼️</span>
      </ArtFrame>
    ),
  },
  orlado_dorado: {
    descripcion: 'Marco noble forjado en oro imperial con bisel brillante y filigrana.',
    rareza: 'Legendario',
    colorRareza: 'text-[var(--brand-gold)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <ArtFrame shape="orlado_dorado" aspectRatio="1/1" className={`${className} shrink-0`}>
        <span className="text-xs font-bold opacity-70">✨</span>
      </ArtFrame>
    ),
  },
  cristal_celeste: {
    descripcion: 'Marco tallado en cristal astral con reflejos celestes y prismas enjoyados.',
    rareza: 'Épico',
    colorRareza: 'text-cyan-400',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <ArtFrame shape="cristal_celeste" aspectRatio="1/1" className={`${className} shrink-0`}>
        <span className="text-xs font-bold opacity-70">💎</span>
      </ArtFrame>
    ),
  },
  runa_violeta: {
    descripcion: 'Marco rúnico arcano de amatista y obsidiana con glifos luminosos.',
    rareza: 'Épico',
    colorRareza: 'text-purple-400',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <ArtFrame shape="runa_violeta" aspectRatio="1/1" className={`${className} shrink-0`}>
        <span className="text-xs font-bold opacity-70">🔮</span>
      </ArtFrame>
    ),
  },
  buho: {
    descripcion: 'Acompaña tus lecturas nocturnas y te susurra sabiduría antes de cada desafío.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-[var(--brand-primary)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-full bg-amber-500/10 border-2 border-[var(--brand-gold)] p-0.5 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/buho.png" alt="Búho Erudito" className="w-full h-full object-cover rounded-full" />
      </div>
    ),
  },
  dragon: {
    descripcion: 'Pequeño dragón guardián que enciende tu motivación y valentía ante los jefes.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-orange-500',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-full bg-orange-500/10 border-2 border-orange-500 p-0.5 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/dragon.png" alt="Dragón Guardián" className="w-full h-full object-cover rounded-full" />
      </div>
    ),
  },
  gato: {
    descripcion: 'Fiel compañero felino lleno de serenidad y cariño para tus horas de aprendizaje.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-pink-500',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-full bg-pink-500/10 border-2 border-pink-500 p-0.5 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/gato.png" alt="Gato Místico" className="w-full h-full object-cover rounded-full" />
      </div>
    ),
  },
  'mascota-lechuza': {
    descripcion: 'Acompaña tus lecturas nocturnas y te susurra sabiduría antes de cada desafío.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-[var(--brand-primary)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-full bg-amber-500/10 border-2 border-[var(--brand-gold)] p-0.5 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/buho.png" alt="Búho Erudito" className="w-full h-full object-cover rounded-full" />
      </div>
    ),
  },
  mascota_dragon: {
    descripcion: 'Pequeño dragón guardián que enciende tu motivación y valentía ante los jefes.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-orange-500',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-orange-500/10 border-2 border-orange-500/40 p-1 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/dragon.png" alt="Dragón Guardián" className="w-full h-full object-cover rounded-xl" />
      </div>
    ),
  },
  mascota_gato: {
    descripcion: 'Fiel compañero felino lleno de serenidad y cariño para tus horas de aprendizaje.',
    rareza: 'Compañero Místico',
    colorRareza: 'text-pink-500',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-pink-500/10 border-2 border-pink-500/40 p-1 overflow-hidden shadow-sm`}>
        <img src="/images/mascotas/gato.png" alt="Gato Místico" className="w-full h-full object-cover rounded-xl" />
      </div>
    ),
  },
  titulo_centinela: {
    descripcion: 'Distintivo de honor para quienes protegen el conocimiento con constancia.',
    rareza: 'Épico',
    colorRareza: 'text-[var(--brand-violet)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-indigo-500/15 border-2 border-indigo-500 text-indigo-500 text-2xl`}>
        🛡️
      </div>
    ),
  },
  titulo_erudito: {
    descripcion: 'La máxima distinción para los maestros de la deducción causal.',
    rareza: 'Legendario',
    colorRareza: 'text-[var(--brand-gold)]',
    IconoVisual: ({ className = 'w-14 h-14' }) => (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-amber-500/15 border-2 border-amber-400 text-amber-400 text-2xl shadow-[0_0_15px_rgba(245,158,11,0.35)]`}>
        👑
      </div>
    ),
  },
};

function BazarRecompensas() {
  const navigate = useNavigate();

  const storeAp = useSessionStore((s) => s.apTotal);
  const storeEscudosDisponibles = useSessionStore((s) => s.escudosRachaDisponibles);
  const storeEscudos = useSessionStore((s) => s.escudosRacha);
  const storeCosmeticos = useSessionStore((s) => s.cosmeticosComprados);
  const storeMarco = useSessionStore((s) => s.marcoEstilo);
  const storeMascota = useSessionStore((s) => s.mascotaEquipada);
  const storeTitulo = useSessionStore((s) => s.tituloEquipado);
  const storeAvatar = useSessionStore((s) => s.avatarEquipado);

  const { data: personaje } = usePersonaje();
  const { data: catalogo, isLoading: isLoadingCatalogo } = useCatalogoBazar();
  const { mutate: comprar, isPending: isComprando } = useComprarArticulo();
  const { mutate: personalizar, isPending: isPersonalizando } = usePersonalizarPersonaje();

  const [bloqueActivo, setBloqueActivo] = useState('consumibles'); // 'consumibles' | 'cosmeticos'
  const [subFiltroCosmetico, setSubFiltroCosmetico] = useState('todos');
  const [feedbackMensaje, setFeedbackMensaje] = useState(null);
  const [articuloEnProcesoId, setArticuloEnProcesoId] = useState(null);

  // Estados consolidados
  const apTotal = personaje?.puntosAccionAP ?? storeAp ?? 0;
  const escudosRacha = personaje?.escudosRachaDisponibles ?? storeEscudosDisponibles ?? storeEscudos ?? 0;
  const pistasDisponibles = personaje?.pistasDisponibles ?? 0;
  const cosmeticosComprados = personaje?.cosmeticosComprados ?? storeCosmeticos ?? [];

  const marcoEstilo = personaje?.marcoEquipado || storeMarco;
  const mascotaEquipada = personaje?.mascotaEquipada || storeMascota;
  const tituloEquipado = personaje?.tituloEquipado || storeTitulo;
  const avatarEquipado = personaje?.avatarEquipado || storeAvatar;

  // Catálogo dinámico del backend clasificado
  const articulosConsumibles = (catalogo || []).filter(
    (a) => a.tipo === 'Pista' || a.tipo === 'EscudoRacha'
  );

  // Aseguramos que todos los cosméticos del backend y avatares oficiales figuren siempre
  const cosmeticosMap = new Map();
  (catalogo || [])
    .filter((a) => a.tipo !== 'Pista' && a.tipo !== 'EscudoRacha')
    .forEach((art) => cosmeticosMap.set(art.id, art));

  // Incorporar los 11 avatares comprables de AVATARES_RPG si no vinieron en el payload inicial
  AVATARES_RPG.filter((a) => !a.base).forEach((av) => {
    if (!cosmeticosMap.has(av.id)) {
      cosmeticosMap.set(av.id, {
        id: av.id,
        nombre: av.nombre,
        tipo: 'Avatar',
        costoAp: av.costoAp,
      });
    }
  });

  const articulosCosmeticos = Array.from(cosmeticosMap.values());

  const cosmeticosFiltrados = subFiltroCosmetico === 'todos'
    ? articulosCosmeticos
    : articulosCosmeticos.filter((a) => a.tipo.toLowerCase() === subFiltroCosmetico.toLowerCase());

  // Acción de compra o equipamiento
  const handleAccionArticulo = (articulo) => {
    const esConsumible = articulo.tipo === 'Pista' || articulo.tipo === 'EscudoRacha';
    const yaComprado =
      articulo.costoAp === 0 ||
      cosmeticosComprados.includes(articulo.id) ||
      (articulo.tipo === 'Avatar' &&
        cosmeticosComprados.some((c) => getAvatarPorId(c)?.id === getAvatarPorId(articulo.id)?.id)) ||
      (articulo.tipo === 'Marco' && (articulo.id === 'scroll' || cosmeticosComprados.includes(articulo.id)));

    // Si ya fue comprado y es cosmético -> EQUIPAR
    if (!esConsumible && yaComprado) {
      setArticuloEnProcesoId(articulo.id);
      const payload = {};
      if (articulo.tipo === 'Marco') payload.marco = articulo.id;
      else if (articulo.tipo === 'Mascota') payload.mascota = articulo.id;
      else if (articulo.tipo === 'Titulo') payload.titulo = articulo.id;
      else if (articulo.tipo === 'Avatar') payload.avatarId = articulo.id;

      personalizar(payload, {
        onSuccess: () => {
          setArticuloEnProcesoId(null);
          playParchment();
          setFeedbackMensaje({
            tipo: 'info',
            texto: `(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ ¡Equipaste "${articulo.nombre}" con éxito!`,
          });
        },
        onError: (err) => {
          setArticuloEnProcesoId(null);
          setFeedbackMensaje({
            tipo: 'error',
            texto: err.mensajeAmigable || '(っ•﹏•)っ No se pudo equipar el artículo.',
          });
        },
      });
      return;
    }

    // Si no ha sido comprado -> COMPRAR con AP
    if (apTotal < articulo.costoAp) {
      setFeedbackMensaje({
        tipo: 'error',
        texto: `Necesitas ${articulo.costoAp} AP para adquirir "${articulo.nombre}". ¡Completa más misiones en el aula para ganar AP!`,
      });
      return;
    }

    setArticuloEnProcesoId(articulo.id);
    comprar(
      { articuloId: articulo.id },
      {
        onSuccess: () => {
          setArticuloEnProcesoId(null);
          playSuccess();
          setFeedbackMensaje({
            tipo: 'exito',
            texto: esConsumible
              ? `¡Adquiriste +1 ${articulo.nombre}! Ya está disponible en tus recursos de aventura.`
              : `¡Adquiriste "${articulo.nombre}"! Ya puedes equiparlo cuando gustes.`,
          });
        },
        onError: (err) => {
          setArticuloEnProcesoId(null);
          setFeedbackMensaje({
            tipo: 'error',
            texto: err.mensajeAmigable || 'No se pudo completar la compra en el Bazar.',
          });
        },
      }
    );
  };

  const isEquipado = (articulo) => {
    if (articulo.tipo === 'Marco') return (marcoEstilo || 'scroll') === articulo.id;
    if (articulo.tipo === 'Mascota') return mascotaEquipada === articulo.id;
    if (articulo.tipo === 'Titulo') return tituloEquipado === articulo.id;
    if (articulo.tipo === 'Avatar') return getAvatarPorId(avatarEquipado)?.id === getAvatarPorId(articulo.id)?.id;
    return false;
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* ── Encabezado & Balance de AP ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <button
              onClick={() => navigate('/alumno/dashboard')}
              className="flex items-center gap-1 text-sm font-display font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <ShoppingBag className="text-[var(--brand-primary)]" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Bazar del Alquimista
            </h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Canjea tus Puntos de Acción (AP) por pistas pedagógicas, escudos de racha y personalización cosmética.
          </p>
        </div>

        {/* Recursos del Alumno */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* AP Balance */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[color-mix(in_oklch,var(--brand-violet)_15%,var(--bg-panel))] border-2 border-[var(--brand-violet)] shadow-[3px_3px_0px_var(--brand-violet)]">
            <Zap size={20} className="text-[var(--brand-violet)] animate-bounce" />
            <div className="text-left">
              <span className="font-display font-black text-xl text-[var(--text-primary)] block leading-none">
                {apTotal}
              </span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-violet)]">
                AP Disponibles
              </span>
            </div>
          </div>

          {/* Pistas Disponibles */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/15 border-2 border-amber-500 shadow-[3px_3px_0px_var(--border)]">
            <Lightbulb size={18} className="text-amber-500" />
            <div className="text-left">
              <span className="font-display font-bold text-sm text-[var(--text-primary)] block leading-none">
                {pistasDisponibles}
              </span>
              <span className="text-[9px] font-display font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pistas
              </span>
            </div>
          </div>

          {/* Escudos de Constancia */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-2 border-[var(--brand-emerald)] shadow-[3px_3px_0px_var(--border)]">
            <Shield size={18} className="text-[var(--brand-emerald)]" />
            <div className="text-left">
              <span className="font-display font-bold text-sm text-[var(--text-primary)] block leading-none">
                {escudosRacha}
              </span>
              <span className="text-[9px] font-display font-bold uppercase tracking-wider text-[var(--brand-emerald)]">
                Escudos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Banner de Notificación de Compra / Error ── */}
      <AnimatePresence>
        {feedbackMensaje && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={[
              'p-3.5 rounded-xl border-2 flex items-center justify-between text-xs font-semibold gap-3 shadow-sm',
              feedbackMensaje.tipo === 'exito'
                ? 'bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-[var(--brand-emerald)] text-[var(--brand-emerald)]'
                : feedbackMensaje.tipo === 'error'
                  ? 'bg-[color-mix(in_oklch,var(--brand-crimson)_15%,var(--bg-panel))] border-[var(--brand-crimson)] text-[var(--brand-crimson)]'
                  : 'bg-[color-mix(in_oklch,var(--brand-sky)_15%,var(--bg-panel))] border-[var(--brand-sky)] text-[var(--brand-sky)]',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              {feedbackMensaje.tipo === 'exito' ? <Check size={16} /> : <Info size={16} />}
              <span>{feedbackMensaje.texto}</span>
            </div>
            <button
              onClick={() => setFeedbackMensaje(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selector de Bloques Principales (Consumibles vs Cosméticos) ── */}
      <div className="flex items-center p-1.5 rounded-2xl bg-[var(--bg-panel)] border-2 border-[var(--border)] shadow-[var(--shadow-c)] gap-2">
        <button
          type="button"
          onClick={() => {
            playParchment();
            setBloqueActivo('consumibles');
          }}
          className={[
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer',
            bloqueActivo === 'consumibles'
              ? 'bg-[var(--brand-primary)] text-white shadow-[2px_2px_0px_var(--border)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
          ].join(' ')}
        >
          <Sparkles size={16} />
          <span>Consumibles de Aventura ({articulosConsumibles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playParchment();
            setBloqueActivo('cosmeticos');
          }}
          className={[
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-display text-xs sm:text-sm font-bold transition-all cursor-pointer',
            bloqueActivo === 'cosmeticos'
              ? 'bg-[var(--brand-violet)] text-white shadow-[2px_2px_0px_var(--border)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--brand-violet)] hover:bg-[var(--bg-accent)]',
          ].join(' ')}
        >
          <Crown size={16} />
          <span>Cosméticos & Títulos ({articulosCosmeticos.length})</span>
        </button>
      </div>

      {isLoadingCatalogo ? (
        <div className="py-24 flex justify-center items-center">
          <Spinner size="lg" label="Consultando el catálogo oficial del Bazar..." />
        </div>
      ) : bloqueActivo === 'consumibles' ? (
        /* ════════════ BLOQUE 1: CONSUMIBLES DE AVENTURA ════════════ */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-semibold text-[var(--text-secondary)]">
              Adquiere consumibles para resolver misiones complejas y proteger tu racha académica.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {articulosConsumibles.map((articulo) => {
              const meta = METADATOS_VISUALES[articulo.id] || METADATOS_VISUALES['escudo-racha'];
              const Icono = meta.IconoVisual;
              const tieneSuficiente = apTotal >= articulo.costoAp;
              const enProceso = isComprando && articuloEnProcesoId === articulo.id;
              const cantidadActual =
                articulo.tipo === 'Pista' ? pistasDisponibles : escudosRacha;

              return (
                <Card
                  key={articulo.id}
                  className="p-5 flex flex-col justify-between gap-4 border-2 border-[var(--border)] bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-muted)] shadow-[3px_3px_0px_var(--border)]"
                >
                  <div className="flex items-start gap-4">
                    <Icono className="w-16 h-16 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                          {articulo.nombre}
                        </h3>
                        <Badge variant={articulo.tipo === 'Pista' ? 'xp' : 'racha'}>
                          En inventario: {cantidadActual}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {meta.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-muted)]">
                    <div className="flex items-center gap-1.5 text-[var(--brand-violet)] font-display font-black text-base">
                      <Zap size={16} />
                      <span>{articulo.costoAp} AP</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAccionArticulo(articulo)}
                      disabled={enProceso || !tieneSuficiente}
                      className="font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-[2px_2px_0px_#78350f]"
                    >
                      {enProceso ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ShoppingBag size={14} />
                      )}
                      <span>Comprar +1 ({articulo.costoAp} AP)</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* ════════════ BLOQUE 2: COSMÉTICOS Y TÍTULOS ════════════ */
        <div className="flex flex-col gap-4">
          {/* Subfiltro de categorías cosméticas */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-muted)] overflow-x-auto">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'avatar', label: 'Avatares' },
              { id: 'marco', label: 'Marcos' },
              { id: 'mascota', label: 'Mascotas' },
              { id: 'titulo', label: 'Títulos' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playParchment();
                  setSubFiltroCosmetico(f.id);
                }}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all cursor-pointer',
                  subFiltroCosmetico === f.id
                    ? 'bg-[var(--brand-violet)] text-white shadow-xs font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--brand-violet)]',
                ].join(' ')}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cosmeticosFiltrados.map((articulo) => {
              const meta = METADATOS_VISUALES[articulo.id] || (
                articulo.tipo === 'Avatar'
                  ? (() => {
                      const av = getAvatarPorId(articulo.id);
                      const IconComp = av.IconoPreview;
                      const rarezaNombre =
                        av.tier === 'legendario'
                          ? 'Avatar Legendario'
                          : av.tier === 'raro'
                            ? 'Avatar Raro'
                            : 'Avatar RPG';
                      const colorRareza =
                        av.tier === 'legendario'
                          ? 'text-[var(--brand-gold)] font-bold'
                          : av.tier === 'raro'
                            ? 'text-purple-400 font-bold'
                            : 'text-[var(--brand-primary)]';

                      return {
                        descripcion: av.descripcion,
                        rareza: rarezaNombre,
                        colorRareza,
                        IconoVisual: ({ className = 'w-14 h-14' }) => (
                          <div className={`${className} flex items-center justify-center rounded-2xl overflow-hidden border-2 border-[var(--brand-primary)]/40 shadow-sm bg-[var(--bg-base)] p-0.5 shrink-0`}>
                            <IconComp className="w-full h-full object-cover" />
                          </div>
                        ),
                      };
                    })()
                  : {
                      descripcion: 'Artículo de prestigio para personalizar tu perfil.',
                      rareza: 'Especial',
                      colorRareza: 'text-[var(--brand-violet)]',
                      IconoVisual: ({ className = 'w-14 h-14' }) => (
                        <div className={`${className} flex items-center justify-center rounded-2xl bg-[var(--bg-accent)] text-2xl`}>
                          ✨
                        </div>
                      ),
                    }
              );
              const Icono = meta.IconoVisual;
              const yaComprado =
                cosmeticosComprados.includes(articulo.id) ||
                (articulo.tipo === 'Avatar' &&
                  cosmeticosComprados.some((c) => getAvatarPorId(c)?.id === getAvatarPorId(articulo.id)?.id));
              const equipado = isEquipado(articulo);
              const tieneSuficiente = apTotal >= articulo.costoAp;
              const enProceso =
                (isComprando || isPersonalizando) && articuloEnProcesoId === articulo.id;

              return (
                <Card
                  key={articulo.id}
                  className={[
                    'p-4 flex flex-col justify-between gap-3 border-2 transition-all',
                    equipado
                      ? 'border-[var(--brand-gold)] bg-[color-mix(in_oklch,var(--brand-gold)_8%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-gold)]'
                      : yaComprado
                        ? 'border-[var(--brand-emerald)] bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)]'
                        : 'border-[var(--border)] bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--border)]',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <Icono className="w-14 h-14 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[10px] font-display font-black tracking-wider uppercase ${meta.colorRareza}`}>
                          {meta.rareza}
                        </span>
                        {equipado && (
                          <Badge variant="racha" className="text-[10px] px-2 py-0.2">
                            Equipado
                          </Badge>
                        )}
                        {!equipado && yaComprado && (
                          <Badge variant="correcto" className="text-[10px] px-2 py-0.2">
                            Comprado
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-base text-[var(--text-primary)] truncate">
                        {articulo.nombre}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                        {meta.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-muted)]">
                    <div className="flex items-center gap-1 text-[var(--brand-violet)] font-display font-bold text-sm">
                      <Zap size={14} />
                      <span>{articulo.costoAp} AP</span>
                    </div>

                    {equipado ? (
                      <span className="text-xs font-display font-bold text-[var(--brand-gold)] flex items-center gap-1">
                        <Check size={14} /> En Uso
                      </span>
                    ) : yaComprado ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAccionArticulo(articulo)}
                        disabled={enProceso}
                        className="text-xs font-bold"
                      >
                        {enProceso ? <Loader2 size={13} className="animate-spin" /> : null}
                        <span>Equipar</span>
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccionArticulo(articulo)}
                        disabled={enProceso || !tieneSuficiente}
                        className="text-xs font-bold"
                      >
                        {enProceso ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <ShoppingBag size={13} />
                        )}
                        <span>Comprar ({articulo.costoAp} AP)</span>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BazarRecompensas;
