import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import PreviewAlumno from './PreviewAlumno';
import { Eye, Award, Sparkles, BookOpen } from 'lucide-react';

export default function ModalPreviewAlumno({ mision, isOpen, onClose }) {
  if (!mision || !isOpen) return null;

  const tipo = mision.tipoPlantilla || 'OpcionMultiple';
  const xp = mision.recompensaXpSugerida ?? mision.recompensaXp ?? 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Eye size={20} className="text-[var(--brand-primary)]" />
          <span className="font-display font-bold">Vista de Alumno: {mision.temaCurricular}</span>
        </div>
      }
      size="lg"
    >
      <div className="flex flex-col gap-4">
        {/* Cabecera con etiquetas */}
        <div className="flex items-center gap-2 flex-wrap border-b border-[var(--border-muted)] pb-3">
          <Badge variant="info">
            <BookOpen size={12} />
            {tipo === 'BatallaDeJefe' ? 'Batalla de Jefe' : tipo === 'LineaTemporal' ? 'Línea Temporal' : 'Opción Múltiple'}
          </Badge>
          <Badge variant="xp">
            <Award size={12} />
            {xp} XP
          </Badge>
          {mision.nivelConfianzaIA != null && (
            <Badge variant="correcto">
              <Sparkles size={11} className="text-[#FCD34D]" />
              Confianza IA {Math.round(mision.nivelConfianzaIA * 100)}%
            </Badge>
          )}
        </div>

        {/* Simulador interactivo */}
        <PreviewAlumno
          narrativa={mision.narrativa}
          payload={mision.payloadJson}
          recompensaXp={xp}
          temaCurricular={mision.temaCurricular}
          tipoPlantilla={tipo}
        />

        <div className="flex justify-end pt-3 border-t border-[var(--border-muted)]">
          <Button variant="ghost" onClick={onClose}>
            Cerrar Vista Previa
          </Button>
        </div>
      </div>
    </Modal>
  );
}
