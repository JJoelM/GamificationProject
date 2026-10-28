import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Lock, Check, Wand2, Shield, User, Loader2, AlertCircle,
  Award, Heart, Crown, Layers
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ArtFrame from '../../../components/ui/ArtFrame';
import { AVATARES_RPG, getAvatarPorId } from './AvataresData';
import useSessionStore, { calcularNivel } from '../../../store/useSessionStore';
import { usePersonaje } from '../../../hooks/usePersonaje';
import { usePersonalizarPersonaje } from '../../../hooks/useBazarMutations';
import { playParchment, playSuccess } from '../../../utils/audio';

const MARCOS_DISPONIBLES = [
  { id: 'scroll', nombre: 'Pergamino Clásico', shape: 'scroll', base: true, descripcion: 'Borde orgánico de pergamino doblado.' },
  { id: 'orlado_dorado', nombre: 'Orlado de Oro', shape: 'orlado_dorado', base: false, descripcion: 'Octógono noble con filigrana dorada.' },
  { id: 'cristal_celeste', nombre: 'Prisma Astral', shape: 'cristal_celeste', base: false, descripcion: 'Prisma facetado con destellos celestes.' },
  { id: 'runa_violeta', nombre: 'Runas Arcanas', shape: 'runa_violeta', base: false, descripcion: 'Corte rúnico de alta magia arcana.' },
];

const MASCOTAS_DISPONIBLES = [
  { id: 'ninguna', valor: null, nombre: 'Sin Mascota', descripcion: 'Viajar en solitario.', imagenSrc: null },
  { id: 'buho', valor: 'buho', nombre: 'Búho Erudito', descripcion: 'Sabiduría en lecturas nocturnas.', imagenSrc: '/images/mascotas/buho.png' },
  { id: 'dragon', valor: 'dragon', nombre: 'Dragón Guardián', descripcion: 'Fuego y valentía ante los desafíos.', imagenSrc: '/images/mascotas/dragon.png' },
  { id: 'gato', valor: 'gato', nombre: 'Gato Místico', descripcion: 'Serenidad y cariño en tus horas de estudio.', imagenSrc: '/images/mascotas/gato.png' },
];

const TITULOS_DISPONIBLES = [
  { id: 'Iniciado del Saber', nombre: 'Iniciado del Saber', nivelReq: 1 },
  { id: 'Buscador de Respuestas', nombre: 'Buscador de Respuestas', nivelReq: 2 },
  { id: 'Explorador Curioso', nombre: 'Explorador Curioso', nivelReq: 3 },
  { id: 'Erudito de las Runas', nombre: 'Erudito de las Runas', nivelReq: 4 },
  { id: 'Maestro Alquimista', nombre: 'Maestro Alquimista', nivelReq: 5 },
  { id: 'titulo_centinela', nombre: 'Centinela del Saber', deBazar: true },
  { id: 'titulo_erudito', nombre: 'Erudito Arcano', deBazar: true },
  { id: 'titulo_maestro_grimorios', nombre: 'Maestro de Grimorios', deBazar: true },
];

function SelectorAvatarModal({ isOpen, onClose }) {
  const xpTotal = useSessionStore((s) => s.xpTotal);
  const avatarEquipado = useSessionStore((s) => s.avatarEquipado) || 'erudito_arcano';
  const marcoEstiloActual = useSessionStore((s) => s.marcoEstilo) || 'scroll';
  const mascotaEquipadaActual = useSessionStore((s) => s.mascotaEquipada) || null;
  const tituloEquipadoActual = useSessionStore((s) => s.tituloEquipado) || 'Iniciado del Saber';

  const setAvatarEquipado = useSessionStore((s) => s.setAvatarEquipado);
  const setMarcoEstilo = useSessionStore((s) => s.setMarcoEstilo);
  const setMascotaEquipada = useSessionStore((s) => s.setMascotaEquipada);
  const setTituloEquipado = useSessionStore((s) => s.setTituloEquipado);

  const { data: personaje } = usePersonaje();
  const { mutate: personalizar, isPending: isGuardando } = usePersonalizarPersonaje();

  const cosmeticosComprados = personaje?.cosmeticosComprados || [];
  const nivelInfo = calcularNivel(xpTotal);

  const [subTab, setSubTab] = useState('arquetipo'); // 'arquetipo' | 'marcos' | 'mascotas' | 'titulos'
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatarEquipado);
  const [selectedMarco, setSelectedMarco] = useState(marcoEstiloActual);
  const [selectedMascota, setSelectedMascota] = useState(mascotaEquipadaActual);
  const [selectedTitulo, setSelectedTitulo] = useState(tituloEquipadoActual);
  const [guardarError, setGuardarError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarId(personaje?.avatarEquipado || avatarEquipado);
      setSelectedMarco(personaje?.marcoEquipado || marcoEstiloActual);
      setSelectedMascota(personaje?.mascotaEquipada || mascotaEquipadaActual);
      setSelectedTitulo(personaje?.tituloEquipado || tituloEquipadoActual);
      setGuardarError(null);
    }
  }, [isOpen, avatarEquipado, marcoEstiloActual, mascotaEquipadaActual, tituloEquipadoActual, personaje]);

  const avatarSeleccionado = getAvatarPorId(selectedAvatarId);
  const AvatarIcon = avatarSeleccionado?.IconoPreview;
  const mascotaObj = MASCOTAS_DISPONIBLES.find((m) => m.valor === selectedMascota || m.id === selectedMascota);

  const handleGuardar = () => {
    setGuardarError(null);

    personalizar(
      {
        avatarId: selectedAvatarId,
        marco: selectedMarco,
        mascota: selectedMascota,
        titulo: selectedTitulo,
      },
      {
        onSuccess: () => {
          setAvatarEquipado(selectedAvatarId);
          setMarcoEstilo(selectedMarco);
          setMascotaEquipada(selectedMascota);
          setTituloEquipado(selectedTitulo);
          playSuccess();
          onClose();
        },
        onError: (err) => {
          setGuardarError(
            err.mensajeAmigable ||
            '(っ•﹏•)っ ¡Ups! No se pudo equipar la personalización seleccionada.'
          );
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizar Identidad de Aventurero"
      size="lg"
    >
      <div className="flex flex-col gap-5 pb-2">
        {/* Error de guardado */}
        <AnimatePresence>
          {guardarError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 rounded-xl border-2 border-[var(--brand-crimson)] bg-[color-mix(in_oklch,var(--brand-crimson)_12%,var(--bg-panel))] text-[var(--brand-crimson)] text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle size={16} />
              <span>{guardarError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Vista previa en vivo con Marco, Mascota y Título ── */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-[16px_22px_18px_20px] bg-gradient-to-br from-[var(--bg-accent)] to-[var(--bg-panel)] border-2 border-[var(--border)] shadow-[var(--shadow-c)]">
          <div className="relative shrink-0">
            <ArtFrame
              label="Vista Previa de tu Personaje"
              shape={selectedMarco}
              aspectRatio="1/1"
              avatarId={selectedAvatarId}
              className="w-28 h-28 md:w-32 md:h-32 shadow-[0_0_20px_rgba(0,0,0,0.15)]"
            />

            {/* Nivel */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
              <Badge variant="nivel">Nv. {nivelInfo.nivel}</Badge>
            </div>

            {/* Mascota en la esquina si está seleccionada */}
            {mascotaObj?.imagenSrc && (
              <div
                className="absolute -top-2 -right-2 z-20 w-10 h-10 rounded-full border-2 border-[var(--brand-gold)] shadow-md overflow-hidden bg-[var(--bg-panel)] p-0.5"
                title={`Mascota: ${mascotaObj.nombre}`}
              >
                <img src={mascotaObj.imagenSrc} alt={mascotaObj.nombre} className="w-full h-full object-cover rounded-full" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <Badge variant="violet">{selectedTitulo || 'Iniciado del Saber'}</Badge>
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                {avatarSeleccionado?.clase}
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
              {avatarSeleccionado?.nombre}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm">
              {avatarSeleccionado?.descripcion}
            </p>
          </div>
        </div>

        {/* ── Pestañas de Personalización ── */}
        <div className="flex items-center gap-2 border-b-2 border-[var(--border-muted)] pb-2 overflow-x-auto">
          {[
            { id: 'arquetipo', label: 'Arquetipo', Icon: User },
            { id: 'marcos', label: 'Marcos', Icon: Layers },
            { id: 'mascotas', label: 'Mascotas', Icon: Heart },
            { id: 'titulos', label: 'Títulos', Icon: Crown },
          ].map(({ id, label, Icon }) => {
            const isActive = subTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => { playParchment(); setSubTab(id); }}
                className={[
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-[var(--brand-primary)] text-white shadow-[2px_2px_0px_var(--border)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── CONTENIDO: 1. ARQUETIPOS ── */}
        {subTab === 'arquetipo' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {AVATARES_RPG.map((avatar) => {
                const isUnlocked =
                  avatar.nivelRequerido === 1 ||
                  nivelInfo.nivel >= avatar.nivelRequerido ||
                  cosmeticosComprados.includes(avatar.id);
                const isSelected = selectedAvatarId === avatar.id;
                const IconComp = avatar.IconoPreview;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    disabled={!isUnlocked || isGuardando}
                    onClick={() => {
                      if (!isUnlocked) return;
                      playParchment();
                      setSelectedAvatarId(avatar.id);
                    }}
                    className={[
                      'relative p-3 rounded-[12px_16px_14px_14px] border-2 flex flex-col items-center gap-2 text-center transition-all cursor-pointer',
                      isSelected
                        ? 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-primary)] scale-[1.02]'
                        : isUnlocked
                          ? 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]'
                          : 'border-[var(--border-muted)] bg-[var(--bg-muted)] opacity-50 cursor-not-allowed',
                    ].join(' ')}
                  >
                    <div className="absolute top-2 right-2">
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs">
                          <Check size={12} />
                        </span>
                      ) : !isUnlocked ? (
                        <span className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-muted)] text-[var(--text-muted)] flex items-center justify-center text-[10px]">
                          <Lock size={10} />
                        </span>
                      ) : null}
                    </div>

                    <div className="w-14 h-14 shrink-0">
                      <IconComp className="w-full h-full object-contain" />
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-xs text-[var(--text-primary)] leading-tight">
                        {avatar.nombre}
                      </h4>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                        {isUnlocked ? avatar.clase : `Desbloquea en Nv. ${avatar.nivelRequerido}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONTENIDO: 2. MARCOS ── */}
        {subTab === 'marcos' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--text-secondary)]">
              Equipa el marco curricular que viste tu retrato en el aula y en las misiones.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MARCOS_DISPONIBLES.map((marco) => {
                const isUnlocked = marco.base || cosmeticosComprados.includes(marco.id) || cosmeticosComprados.includes(marco.shape);
                const isSelected = selectedMarco === marco.id || selectedMarco === marco.shape;

                return (
                  <button
                    key={marco.id}
                    type="button"
                    disabled={!isUnlocked || isGuardando}
                    onClick={() => {
                      if (!isUnlocked) return;
                      playParchment();
                      setSelectedMarco(marco.id);
                    }}
                    className={[
                      'p-3.5 rounded-xl border-2 flex items-center gap-3.5 text-left transition-all cursor-pointer relative',
                      isSelected
                        ? 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-primary)]'
                        : isUnlocked
                          ? 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--brand-primary)]'
                          : 'border-[var(--border-muted)] bg-[var(--bg-muted)] opacity-50 cursor-not-allowed',
                    ].join(' ')}
                  >
                    <ArtFrame
                      shape={marco.shape}
                      aspectRatio="1/1"
                      className="w-12 h-12 shrink-0 bg-[var(--bg-panel)]"
                    >
                      <span className="text-xs">⚔️</span>
                    </ArtFrame>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-display font-bold text-xs text-[var(--text-primary)]">
                          {marco.nombre}
                        </h4>
                        {isSelected && <Check size={14} className="text-[var(--brand-primary)]" />}
                        {!isUnlocked && <Lock size={12} className="text-[var(--text-muted)]" />}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                        {isUnlocked ? marco.descripcion : 'Adquiérelo en el Bazar.'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONTENIDO: 3. MASCOTAS ── */}
        {subTab === 'mascotas' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--text-secondary)]">
              Elige tu acompañante místico oficial (Búho, Dragón o Gato) para que te acompañe en tu hoja de personaje.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MASCOTAS_DISPONIBLES.map((mascota) => {
                const isUnlocked =
                  mascota.id === 'ninguna' ||
                  cosmeticosComprados.includes(mascota.id) ||
                  cosmeticosComprados.includes(`mascota_${mascota.id}`) ||
                  cosmeticosComprados.includes('mascota-lechuza') && mascota.id === 'buho';
                const isSelected = selectedMascota === mascota.valor;

                return (
                  <button
                    key={mascota.id}
                    type="button"
                    disabled={!isUnlocked || isGuardando}
                    onClick={() => {
                      if (!isUnlocked) return;
                      playParchment();
                      setSelectedMascota(mascota.valor);
                    }}
                    className={[
                      'p-3.5 rounded-xl border-2 flex items-center gap-3.5 text-left transition-all cursor-pointer relative',
                      isSelected
                        ? 'border-[var(--brand-violet)] bg-[color-mix(in_oklch,var(--brand-violet)_12%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-violet)]'
                        : isUnlocked
                          ? 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--brand-violet)]'
                          : 'border-[var(--border-muted)] bg-[var(--bg-muted)] opacity-50 cursor-not-allowed',
                    ].join(' ')}
                  >
                    <div className="w-12 h-12 rounded-xl border-2 border-[var(--border-muted)] overflow-hidden shrink-0 flex items-center justify-center bg-[var(--bg-base)]">
                      {mascota.imagenSrc ? (
                        <img src={mascota.imagenSrc} alt={mascota.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] font-bold">🚫</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-display font-bold text-xs text-[var(--text-primary)]">
                          {mascota.nombre}
                        </h4>
                        {isSelected && <Check size={14} className="text-[var(--brand-violet)]" />}
                        {!isUnlocked && <Lock size={12} className="text-[var(--text-muted)]" />}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                        {isUnlocked ? mascota.descripcion : 'Disponible en el Bazar (250 AP).'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONTENIDO: 4. TÍTULOS ── */}
        {subTab === 'titulos' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--text-secondary)]">
              Títulos desbloqueados por tu progreso de nivel y adquiridos en el Bazar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {TITULOS_DISPONIBLES.map((titulo) => {
                const isUnlocked =
                  (titulo.nivelReq && nivelInfo.nivel >= titulo.nivelReq) ||
                  cosmeticosComprados.includes(titulo.id) ||
                  cosmeticosComprados.includes(`titulo_${titulo.id}`);
                const isSelected = selectedTitulo === titulo.nombre || selectedTitulo === titulo.id;

                return (
                  <button
                    key={titulo.id}
                    type="button"
                    disabled={!isUnlocked || isGuardando}
                    onClick={() => {
                      if (!isUnlocked) return;
                      playParchment();
                      setSelectedTitulo(titulo.nombre);
                    }}
                    className={[
                      'p-3 rounded-xl border-2 flex items-center justify-between gap-2 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-[var(--brand-gold)] bg-[color-mix(in_oklch,var(--brand-gold)_12%,var(--bg-panel))] shadow-[2px_2px_0px_var(--brand-gold)]'
                        : isUnlocked
                          ? 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--brand-gold)]'
                          : 'border-[var(--border-muted)] bg-[var(--bg-muted)] opacity-50 cursor-not-allowed',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <Award size={16} className={isSelected ? 'text-[var(--brand-gold)]' : 'text-[var(--text-muted)]'} />
                      <span className="font-display font-bold text-xs text-[var(--text-primary)]">
                        {titulo.nombre}
                      </span>
                    </div>
                    {isSelected ? (
                      <Check size={14} className="text-[var(--brand-gold)] shrink-0" />
                    ) : !isUnlocked ? (
                      <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 shrink-0">
                        <Lock size={10} />
                        {titulo.nivelReq ? `Nv. ${titulo.nivelReq}` : 'Bazar'}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-muted)]">
          <Button variant="ghost" onClick={onClose} disabled={isGuardando}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={isGuardando}>
            {isGuardando ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Wand2 size={15} />
                <span>Confirmar Personalización</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SelectorAvatarModal;
