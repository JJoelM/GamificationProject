import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, X, Edit3, Award, ChevronDown, ChevronUp, Eye, EyeOff, BookOpen, Clock, Swords
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { playParchment } from '../../../utils/audio';

/**
 * TarjetaBorrador v3 — Tarjeta de misión interactiva del docente:
 * - Soporta estados 'Pendiente', 'Validado' y 'Oculto'
 * - Vista expandible adaptada a OpcionMultiple, BatallaDeJefe y LineaTemporal
 * - Botón de previsualización como alumno integrado
 */
function TarjetaBorrador({
  borrador,
  onAprobar,
  onRechazar,
  onOcultar,
  onRepublicar,
  onPrevisualizar,
  isApproving,
  isRejecting,
  isHiding,
  isRepublicating,
}) {
  const navigate = useNavigate();
  const [expandida, setExpandida] = useState(false);

  const estado = borrador.estadoValidacion || 'Pendiente';
  const esPendiente = estado === 'Pendiente';
  const esValidado = estado === 'Validado';
  const esOculto = estado === 'Oculto';

  let parsed = null;
  try {
    parsed = typeof borrador.payloadJson === 'string'
      ? JSON.parse(borrador.payloadJson)
      : borrador.payloadJson;
  } catch {
    parsed = {};
  }

  const tipoPlantilla = borrador.tipoPlantilla || 'OpcionMultiple';
  const preguntas = parsed?.preguntas ?? [];
  const fases = parsed?.fases ?? [];
  const eventos = parsed?.eventosDesordenados ?? [];

  const itemsCount = preguntas.length || fases.length || eventos.length;
  const itemLabel = preguntas.length > 0
    ? (itemsCount === 1 ? 'pregunta' : 'preguntas')
    : fases.length > 0
    ? (itemsCount === 1 ? 'fase de jefe' : 'fases de jefe')
    : eventos.length > 0
    ? (itemsCount === 1 ? 'evento secuencial' : 'eventos secuenciales')
    : 'elementos';

  const rawConfianza = borrador.nivelConfianzaIA;
  const confianza = rawConfianza != null
    ? (rawConfianza <= 1 ? Math.round(rawConfianza * 100) : Math.round(rawConfianza))
    : null;
  const confianzaColor = confianza == null ? 'info'
    : confianza >= 85 ? 'correcto'
    : confianza >= 60 ? 'xp'
    : 'racha';

  const handleToggleExpand = () => {
    playParchment();
    setExpandida((p) => !p);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: isApproving ? 90 : -90, rotate: isApproving ? 5 : -5 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full gap-0 overflow-hidden p-0 border-2">
        {/* Header de la tarjeta */}
        <div className="flex flex-col gap-3 p-5">
          {/* Badges superiores */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)] line-clamp-1">
              {borrador.temaCurricular || 'Misión sin tema'}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {esPendiente && confianza != null && (
                <Badge variant={confianzaColor}>
                  <Sparkles size={11} className="text-[#FCD34D]" />
                  IA {confianza}%
                </Badge>
              )}
              {esPendiente && (
                <Badge variant="racha">
                  Por Validar
                </Badge>
              )}
              {esValidado && (
                <Badge variant="correcto">
                  En Aula (Pública)
                </Badge>
              )}
              {esOculto && (
                <Badge variant="info">
                  Oculta
                </Badge>
              )}
              <Badge variant="xp">
                <Award size={12} />
                {borrador.recompensaXpSugerida ?? 100} XP
              </Badge>
            </div>
          </div>

          {/* Narrativa snippet */}
          <p className="text-sm text-[var(--text-primary)] font-medium line-clamp-3 leading-relaxed">
            {borrador.narrativa || 'Sin narrativa especificada.'}
          </p>

          {/* Meta info & template badge */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-muted)]">
            <span className="text-xs text-[var(--text-muted)] font-display flex items-center gap-1.5">
              {tipoPlantilla === 'BatallaDeJefe' ? <Swords size={13} className="text-amber-500" />
               : tipoPlantilla === 'LineaTemporal' ? <Clock size={13} className="text-indigo-400" />
               : <BookOpen size={13} className="text-[var(--brand-primary)]" />}
              {itemsCount} {itemLabel}
            </span>

            {itemsCount > 0 && (
              <button
                onClick={handleToggleExpand}
                className="flex items-center gap-1 text-xs font-display font-semibold text-[var(--brand-primary)] hover:underline transition-colors"
                aria-expanded={expandida}
                aria-label={expandida ? 'Ocultar detalles' : 'Ver detalles'}
              >
                {expandida ? (
                  <>
                    <ChevronUp size={13} /> Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} /> Ver detalles
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Sección expandible — detalles según tipo de plantilla */}
        <AnimatePresence initial={false}>
          {expandida && (
            <motion.div
              key="detalles"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 px-5 pb-4 border-t border-[var(--border-muted)] pt-3">
                {/* Preguntas de Opción Múltiple */}
                {preguntas.slice(0, 4).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-muted)]"
                  >
                    <span className="w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">
                        {p.enunciado}
                      </p>
                      <p className="text-[10px] text-[var(--brand-emerald)] font-display">
                        ✓ {p.respuestaCorrecta}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Fases de Batalla de Jefe */}
                {fases.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-muted)]"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">
                        {f.enunciado}
                      </p>
                      <p className="text-[10px] text-[var(--brand-emerald)] font-display">
                        ✓ {f.respuestaCorrecta} · Daño: {f.danioAlJefe} HP
                      </p>
                    </div>
                  </div>
                ))}

                {/* Eventos de Línea Temporal */}
                {eventos.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-muted)]"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {ev.ordenCorrecto ?? idx + 1}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2">
                        {ev.descripcion}
                      </p>
                      {ev.id === parsed.eventoCulpableId && (
                        <p className="text-[10px] text-amber-400 font-display font-semibold">
                          ⚡ Causa raíz de la anomalía
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {preguntas.length > 4 && (
                  <p className="text-[11px] text-[var(--text-muted)] text-center font-display">
                    + {preguntas.length - 4} más — abrí el editor para ver todas
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer de acciones táctiles */}
        <div className="flex items-center justify-between gap-2 p-4 border-t border-[var(--border-muted)] mt-auto bg-[var(--bg-muted)] flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/docente/misiones/${borrador.misionId}/validar`)}
            >
              <Edit3 size={14} />
              Editar
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPrevisualizar(borrador)}
              aria-label={`Previsualizar misión ${borrador.temaCurricular} como alumno`}
            >
              <Eye size={14} className="text-[var(--brand-primary)]" />
              Previsualizar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {esPendiente && (
              <>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onRechazar(borrador)}
                  disabled={isApproving || isRejecting}
                  aria-label={`Rechazar misión ${borrador.temaCurricular}`}
                >
                  <X size={14} />
                  Rechazar
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAprobar(borrador.misionId)}
                  loading={isApproving}
                  disabled={isRejecting}
                  aria-label={`Aprobar misión ${borrador.temaCurricular}`}
                >
                  <Check size={14} />
                  Aprobar
                </Button>
              </>
            )}

            {esValidado && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOcultar(borrador.misionId)}
                loading={isHiding}
                className="text-[var(--text-secondary)] hover:text-amber-400"
                aria-label={`Ocultar misión ${borrador.temaCurricular}`}
              >
                <EyeOff size={14} />
                Ocultar
              </Button>
            )}

            {esOculto && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onRepublicar(borrador.misionId)}
                loading={isRepublicating}
                aria-label={`Hacer pública misión ${borrador.temaCurricular}`}
              >
                <Sparkles size={14} />
                Hacer Pública
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default TarjetaBorrador;
