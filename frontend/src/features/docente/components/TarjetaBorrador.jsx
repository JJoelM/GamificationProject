import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, Edit3, Award, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { playParchment } from '../../../utils/audio';

/**
 * TarjetaBorrador v2 — Tarjeta de misión pendiente con vista expandible de preguntas
 * y microinteracciones de carta tipo "flip".
 */
function TarjetaBorrador({ borrador, onAprobar, onRechazar, isApproving, isRejecting }) {
  const navigate = useNavigate();
  const [expandida, setExpandida] = useState(false);

  let preguntas = [];
  try {
    const parsed = typeof borrador.payloadJson === 'string'
      ? JSON.parse(borrador.payloadJson)
      : borrador.payloadJson;
    preguntas = parsed?.preguntas ?? [];
  } catch { /* empty */ }

  const confianza = borrador.nivelConfianzaIA != null ? Math.round(borrador.nivelConfianzaIA * 100) : null;
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
      <Card className="flex flex-col h-full gap-0 overflow-hidden p-0">
        {/* Header de la tarjeta */}
        <div className="flex flex-col gap-3 p-5">
          {/* Badges superiores */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-primary)] line-clamp-1">
              {borrador.temaCurricular || 'Misión sin tema'}
            </span>
            <div className="flex items-center gap-1.5">
              {confianza != null && (
                <Badge variant={confianzaColor}>
                  <Sparkles size={11} className="text-[#FCD34D]" />
                  IA {confianza}%
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

          {/* Meta info */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-muted)] font-display">
              {preguntas.length} {preguntas.length === 1 ? 'pregunta' : 'preguntas'}
            </span>
            {preguntas.length > 0 && (
              <button
                onClick={handleToggleExpand}
                className="flex items-center gap-1 text-xs font-display font-semibold text-[var(--brand-primary)] hover:underline transition-colors"
                aria-expanded={expandida}
                aria-label={expandida ? 'Ocultar preguntas' : 'Ver preguntas'}
              >
                {expandida ? (
                  <>
                    <ChevronUp size={13} /> Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} /> Ver preguntas
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Sección expandible — preguntas */}
        <AnimatePresence initial={false}>
          {expandida && (
            <motion.div
              key="preguntas"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 px-5 pb-4 border-t border-[var(--border-muted)] pt-3">
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
                {preguntas.length > 4 && (
                  <p className="text-[11px] text-[var(--text-muted)] text-center font-display">
                    + {preguntas.length - 4} más — abrí el editor para ver todas
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer de acciones */}
        <div className="flex items-center justify-between gap-2 p-4 border-t border-[var(--border-muted)] mt-auto bg-[var(--bg-muted)] flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/docente/misiones/${borrador.misionId}/validar`)}
          >
            <Edit3 size={14} />
            Editar
          </Button>

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default TarjetaBorrador;
