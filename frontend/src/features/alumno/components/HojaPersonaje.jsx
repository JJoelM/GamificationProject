import { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles, TrendingUp, ChevronDown, Check, Star, Palette, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import XpBar from '../../../components/ui/XpBar';
import ArtFrame from '../../../components/ui/ArtFrame';
import SelectorAvatarModal from './SelectorAvatarModal';
import useSessionStore, { calcularNivel, NIVELES_RPG, formatearTitulo, TITULOS_MAP } from '../../../store/useSessionStore';
import { usePersonaje } from '../../../hooks/usePersonaje';
import { usePersonalizarPersonaje } from '../../../hooks/useBazarMutations';
import { ARTICULOS_BAZAR } from './BazarData';
import { playParchment } from '../../../utils/audio';

/**
 * HojaPersonaje v3 — Tarjeta viva del personaje del alumno con avatar personalizable,
 * marco activo, mascota animada acompañante, título real del backend, stats reactivas y bienvenida.
 */
function HojaPersonaje() {
  const usuario = useSessionStore((s) => s.usuario);
  const storeXp = useSessionStore((s) => s.xpTotal);
  const storeAp = useSessionStore((s) => s.apTotal);
  const storeRacha = useSessionStore((s) => s.rachaDias);
  const storeEscudosDisponibles = useSessionStore((s) => s.escudosRachaDisponibles);
  const storeEscudos = useSessionStore((s) => s.escudosRacha);
  const mejoraSemanal = useSessionStore((s) => s.mejoraSemanal) || 24;
  const storeTitulo = useSessionStore((s) => s.tituloEquipado);
  const storeAvatar = useSessionStore((s) => s.avatarEquipado);
  const storeAura = useSessionStore((s) => s.auraColor);
  const storeMarco = useSessionStore((s) => s.marcoEstilo);
  const storeMascota = useSessionStore((s) => s.mascotaEquipada);
  const setTituloEquipado = useSessionStore((s) => s.setTituloEquipado);

  const { data: personaje } = usePersonaje();
  const { mutate: personalizar } = usePersonalizarPersonaje();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Valores unificados (Backend como fuente de verdad con fallback reactivo en store)
  const xpTotal = personaje?.experienciaXP ?? storeXp ?? 0;
  const apTotal = personaje?.puntosAccionAP ?? storeAp ?? 0;
  const rachaDias = personaje?.rachaDiasActivos ?? storeRacha ?? 0;
  const escudosRacha =
    personaje?.escudosRachaDisponibles ??
    storeEscudosDisponibles ??
    storeEscudos ??
    0;

  const tituloEquipado = personaje?.tituloEquipado || storeTitulo || 'Iniciado del Saber';
  const avatarEquipado = personaje?.avatarEquipado || storeAvatar || 'erudito_arcano';
  const auraColor = storeAura || '#2563EB';
  const marcoEstilo = personaje?.marcoEquipado || storeMarco || 'scroll';
  const mascotaEquipada = personaje?.mascotaEquipada || storeMascota || 'buho_erudito';

  const nivelInfo = calcularNivel(xpTotal);
  const xpProgreso = xpTotal - nivelInfo.xpMin;
  const xpMetaNivel = nivelInfo.xpMax - nivelInfo.xpMin;

  const cosmeticosComprados = personaje?.cosmeticosComprados || [];
  const titulosNivel = NIVELES_RPG.filter((n) => n.nivel <= nivelInfo.nivel).map((n) => ({
    nivel: `Nv.${n.nivel}`,
    titulo: n.titulo,
    valor: n.titulo,
  }));
  const titulosBazar = Object.entries(TITULOS_MAP)
    .filter(
      ([id, nombre]) =>
        cosmeticosComprados.includes(id) ||
        cosmeticosComprados.includes(`titulo_${id}`) ||
        tituloEquipado === id ||
        tituloEquipado === nombre
    )
    .map(([, nombre]) => ({
      nivel: 'Bazar',
      titulo: nombre,
      valor: nombre,
    }));

  // Deduplicar títulos disponibles
  const titulosDesbloqueados = Array.from(
    new Map([...titulosNivel, ...titulosBazar].map((item) => [item.titulo, item])).values()
  );

  // Buscar mascota equipada para renderizar su icono animado
  const mascotaVisual = ARTICULOS_BAZAR.find(
    (a) => a.tipo === 'mascota' && (
      a.valor === mascotaEquipada ||
      a.id === mascotaEquipada ||
      (mascotaEquipada?.includes('buho') && a.id === 'buho') ||
      (mascotaEquipada?.includes('lechuza') && a.id === 'buho') ||
      (mascotaEquipada?.includes('dragon') && a.id === 'dragon') ||
      (mascotaEquipada?.includes('gato') && a.id === 'gato')
    )
  );

  // Click-outside para cerrar el selector de títulos
  useEffect(() => {
    if (!isSelectorOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSelectorOpen]);

  const handleSelectTitulo = (titulo) => {
    playParchment();
    setTituloEquipado(titulo);
    setIsSelectorOpen(false);

    personalizar({
      titulo,
    });
  };

  const primerNombre = usuario?.nombreCompleto?.split(' ')[0] ?? 'Aventurero';

  // Hora del día para saludo contextual
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <>
      <Card className="flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
        {/* Elemento decorativo de fondo — aura sutil */}
        <div
          className="absolute top-0 right-0 w-52 h-52 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${auraColor}, transparent)` }}
          aria-hidden="true"
        />

        {/* Avatar / Retrato interactivo con marco activo y mascota acompañante */}
        <div className="relative shrink-0 flex flex-col items-center group">
          <div className="relative cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
            <ArtFrame
              label="Retrato de tu Personaje"
              shape={marcoEstilo}
              aspectRatio="1/1"
              avatarId={avatarEquipado}
              auraColor={auraColor}
              className="w-32 md:w-36 transition-transform duration-300 group-hover:scale-105"
            />

            {/* Badge de nivel flotante sobre el avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10"
            >
              <Badge variant="nivel">
                <Star size={10} />
                Nv. {nivelInfo.nivel}
              </Badge>
            </motion.div>

            {/* Mascota acompañante con aura de partículas místicas */}
            {mascotaVisual && (
              <div
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20 flex items-center justify-center cursor-pointer hover:scale-115 transition-transform"
                title={`Compañero leal: ${mascotaVisual.nombre}`}
                onClick={() => setIsAvatarModalOpen(true)}
              >
                {/* Aura suave de resplandor */}
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.35, 0.65, 0.35],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.2,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 -m-1 rounded-full bg-gradient-to-tr from-[var(--brand-gold)] via-amber-300 to-yellow-500 blur-xs pointer-events-none"
                  aria-hidden="true"
                />

                {/* Micro partículas doradas delicadas */}
                <motion.span
                  animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.7, 1.2, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="absolute -top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_5px_#FDE047] pointer-events-none z-10"
                  aria-hidden="true"
                />
                <motion.span
                  animate={{ opacity: [0.8, 0.2, 0.8], scale: [1.2, 0.6, 1.2] }}
                  transition={{ repeat: Infinity, duration: 3.1, delay: 0.8, ease: 'easeInOut' }}
                  className="absolute -bottom-0.5 left-1 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_5px_#F59E0B] pointer-events-none z-10"
                  aria-hidden="true"
                />

                {/* Medallón circular */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 p-1 rounded-full bg-[var(--bg-panel)] border-3 border-[var(--brand-gold)] shadow-[0_6px_16px_rgba(0,0,0,0.35),2px_2px_0px_#000] z-0 overflow-hidden flex items-center justify-center">
                  {mascotaVisual.imagenSrc ? (
                    <img src={mascotaVisual.imagenSrc} alt={mascotaVisual.nombre} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <mascotaVisual.IconoVisual className="w-full h-full" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botón sutil para personalizar retrato */}
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="mt-3.5 flex items-center gap-1 text-[11px] font-display font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary-hov)] hover:underline cursor-pointer"
          >
            <Palette size={12} />
            <span>Personalizar Avatar</span>
          </button>
        </div>

        {/* Datos y progreso */}
        <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
          {/* Header con saludo + título real */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display font-bold text-2xl text-[var(--text-primary)]"
              >
                {saludo}, {primerNombre} 👋
              </motion.h2>

              {/* Selector de Título RPG interactivo */}
              <div className="relative mt-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                  className="flex items-center gap-1.5 text-xs font-display font-bold text-[var(--brand-primary)] px-2.5 py-1 rounded-lg bg-[var(--bg-accent)] border border-[var(--border-muted)] hover:border-[var(--brand-primary)] transition-all cursor-pointer"
                  title="Cambiar título de aventurero"
                  aria-haspopup="listbox"
                  aria-expanded={isSelectorOpen}
                >
                  <Sparkles size={11} className="text-[var(--brand-gold)]" />
                  <span>{formatearTitulo(tituloEquipado)}</span>
                  <ChevronDown
                    size={12}
                    className={`opacity-70 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown de títulos */}
                <AnimatePresence>
                  {isSelectorOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      role="listbox"
                      className="absolute left-0 mt-1 w-64 rounded-xl bg-[var(--bg-panel)] border-2 border-[var(--border)] shadow-[var(--shadow-modal)] p-1.5 z-30"
                    >
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-secondary)] px-2 py-1 block">
                        Títulos Desbloqueados ({titulosDesbloqueados.length})
                      </span>
                      <div className="flex flex-col gap-0.5">
                        {titulosDesbloqueados.map((t) => {
                          const isSelected =
                            t.titulo === tituloEquipado ||
                            t.valor === tituloEquipado ||
                            t.titulo === formatearTitulo(tituloEquipado);
                          return (
                            <button
                              key={t.titulo}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelectTitulo(t.valor)}
                              className={[
                                'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer',
                                isSelected
                                  ? 'bg-[var(--brand-primary)] text-white'
                                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-accent)]',
                              ].join(' ')}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                                  {t.nivel}
                                </span>
                                <span>{t.titulo}</span>
                              </div>
                              {isSelected && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Racha + días activos */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color-mix(in_oklch,var(--brand-secondary)_15%,var(--bg-panel))] border border-[var(--brand-secondary)] shadow-[2px_2px_0px_var(--border)]">
                <Flame size={16} className="text-[var(--brand-secondary)]" />
                <span className="text-xs font-display font-bold text-[var(--text-primary)]">
                  {rachaDias} días activos
                </span>
              </div>
            </div>
          </div>

          {/* Stats compactas en mini grid de 4 columnas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col items-center p-2 rounded-lg bg-[var(--bg-accent)] border border-[var(--border-muted)]">
              <span className="font-display font-black text-lg text-[var(--brand-gold)]">{xpTotal.toLocaleString()}</span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-secondary)]">XP Total</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-[var(--bg-accent)] border border-[var(--border-muted)]">
              <span className="font-display font-black text-lg text-[var(--brand-primary)]">{nivelInfo.nivel}</span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-secondary)]">Nivel</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-[color-mix(in_oklch,var(--brand-violet)_10%,var(--bg-panel))] border border-[var(--brand-violet)]">
              <span className="font-display font-black text-lg text-[var(--brand-violet)]">{apTotal}</span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-violet)] flex items-center gap-0.5">
                <Zap size={10} /> AP Bazar
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-[color-mix(in_oklch,var(--brand-emerald)_10%,var(--bg-panel))] border border-[var(--brand-emerald)]">
              <span className="font-display font-black text-lg text-[var(--brand-emerald)]">
                {escudosRacha > 0 ? `🛡️ ${escudosRacha}` : '0'}
              </span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--brand-emerald)]">
                {escudosRacha > 0 ? 'Escudo Activo' : 'Sin Escudo'}
              </span>
            </div>
          </div>

          {/* Mensaje de refuerzo positivo */}
          <div className="p-2.5 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-emerald)_10%,var(--bg-panel))] border border-[var(--brand-emerald)] flex items-center gap-2.5">
            <TrendingUp size={15} className="text-[var(--brand-emerald)] shrink-0" />
            <p className="text-xs text-[var(--text-primary)] font-medium">
              ¡Gran constancia! Tu rendimiento mejoró un <strong className="text-[var(--brand-emerald)] font-bold">+{mejoraSemanal}%</strong> esta semana. ¡Seguí así!
            </p>
          </div>

          {/* Barra de progreso XP */}
          <XpBar
            current={xpProgreso}
            max={xpMetaNivel}
            label={`Progreso al Nivel ${nivelInfo.nivel + 1}`}
            glowing
          />
        </div>
      </Card>

      {/* Modal para Personalización de Avatar */}
      <SelectorAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </>
  );
}

export default HojaPersonaje;
