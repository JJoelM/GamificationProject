import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, Check, Wand2, Palette, Shield, User, Loader2, AlertCircle } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { AVATARES_RPG, AURAS_DISPONIBLES, getAvatarPorId } from './AvataresData';
import useSessionStore, { calcularNivel } from '../../../store/useSessionStore';
import { usePersonaje } from '../../../hooks/usePersonaje';
import { usePersonalizarPersonaje } from '../../../hooks/useBazarMutations';
import { playParchment, playSuccess } from '../../../utils/audio';

function SelectorAvatarModal({ isOpen, onClose }) {
  const xpTotal = useSessionStore((s) => s.xpTotal);
  const avatarEquipado = useSessionStore((s) => s.avatarEquipado) || 'erudito_arcano';
  const auraColorActual = useSessionStore((s) => s.auraColor) || '#2563EB';
  const marcoEstiloActual = useSessionStore((s) => s.marcoEstilo) || 'scroll';

  const setAvatarEquipado = useSessionStore((s) => s.setAvatarEquipado);
  const setAuraColor = useSessionStore((s) => s.setAuraColor);
  const setMarcoEstilo = useSessionStore((s) => s.setMarcoEstilo);

  const { data: personaje } = usePersonaje();
  const { mutate: personalizar, isPending: isGuardando } = usePersonalizarPersonaje();

  const cosmeticosComprados = personaje?.cosmeticosComprados || [];
  const nivelInfo = calcularNivel(xpTotal);
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatarEquipado);
  const [selectedAura, setSelectedAura] = useState(auraColorActual);
  const [selectedMarco, setSelectedMarco] = useState(marcoEstiloActual);
  const [guardarError, setGuardarError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarId(personaje?.avatarEquipado || avatarEquipado);
      setSelectedAura(auraColorActual);
      setSelectedMarco(personaje?.marcoEquipado || marcoEstiloActual);
      setGuardarError(null);
    }
  }, [isOpen, avatarEquipado, auraColorActual, marcoEstiloActual, personaje]);

  const avatarSeleccionado = getAvatarPorId(selectedAvatarId);
  const AvatarIcon = avatarSeleccionado.IconoPreview;

  const handleSelectAvatar = (avatar, isUnlocked) => {
    if (!isUnlocked) return;
    playParchment();
    setSelectedAvatarId(avatar.id);
  };

  const handleSelectAura = (hex) => {
    playParchment();
    setSelectedAura(hex);
  };

  const handleGuardar = () => {
    setGuardarError(null);
    setAuraColor(selectedAura);
    setMarcoEstilo(selectedMarco);

    // Enviar personalización al backend asegurando compatibilidad CQRS
    personalizar(
      {
        avatarId: selectedAvatarId,
      },
      {
        onSuccess: () => {
          setAvatarEquipado(selectedAvatarId);
          playSuccess();
          onClose();
        },
        onError: (err) => {
          setGuardarError(
            err.mensajeAmigable ||
            '(っ•﹏•)っ ¡Ups! No se pudo equipar el retrato seleccionado todavía.'
          );
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizar Retrato de Aventurero"
      size="lg"
    >
      <div className="flex flex-col gap-6 pb-2">
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

        {/* Vista previa en vivo */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-[16px_22px_18px_20px] bg-gradient-to-br from-[var(--bg-accent)] to-[var(--bg-panel)] border-2 border-[var(--border)] shadow-[var(--shadow-c)]">
          <div className="relative shrink-0">
            <div
              className="w-28 h-28 rounded-2xl overflow-hidden p-2 flex items-center justify-center transition-all duration-300"
              style={{
                boxShadow: `0 0 20px ${selectedAura}55, 4px 4px 0px ${selectedAura}`,
                border: `2px solid ${selectedAura}`,
                background: 'var(--bg-panel)',
              }}
            >
              <AvatarIcon className="w-full h-full object-contain filter drop-shadow-md" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <Badge variant="nivel">Nv. {avatarSeleccionado.nivelRequerido}</Badge>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                {avatarSeleccionado.clase}
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
              {avatarSeleccionado.nombre}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm">
              {avatarSeleccionado.descripcion}
            </p>
          </div>
        </div>

        {/* 1. Selector de Arquetipos / Retratos */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <User size={14} className="text-[var(--brand-primary)]" />
              Elige tu Arquetipo
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              Tu nivel actual: <strong className="text-[var(--text-primary)]">Nivel {nivelInfo.nivel}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  onClick={() => handleSelectAvatar(avatar, isUnlocked)}
                  className={[
                    'relative p-3 rounded-[12px_16px_14px_14px] border-2 flex flex-col items-center gap-2 text-center transition-all cursor-pointer text-left',
                    isSelected
                      ? 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-primary)] scale-[1.02]'
                      : isUnlocked
                        ? 'border-[var(--border-muted)] bg-[var(--bg-panel)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-accent)]'
                        : 'border-[var(--border-muted)] bg-[var(--bg-muted)] opacity-50 cursor-not-allowed',
                  ].join(' ')}
                >
                  {/* Ícono de Check o Candado */}
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

        {/* 2. Selector de Color de Aura / Estandarte */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
            <Palette size={14} className="text-[var(--brand-primary)]" />
            Color de Aura y Sombra
          </span>

          <div className="flex items-center gap-3 flex-wrap">
            {AURAS_DISPONIBLES.map((aura) => {
              const isSelected = selectedAura === aura.hex;
              return (
                <button
                  key={aura.id}
                  type="button"
                  disabled={isGuardando}
                  onClick={() => handleSelectAura(aura.hex)}
                  className={[
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-display font-semibold transition-all cursor-pointer',
                    isSelected
                      ? 'border-[var(--text-primary)] bg-[var(--bg-panel)] shadow-[2px_2px_0px_var(--text-primary)] scale-105'
                      : 'border-[var(--border-muted)] bg-[var(--bg-base)] hover:bg-[var(--bg-accent)]',
                  ].join(' ')}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-inner"
                    style={{ backgroundColor: aura.hex }}
                  />
                  <span>{aura.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
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
                <span>Confirmar Retrato</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SelectorAvatarModal;
