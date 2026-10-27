import { Lightbulb, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

/**
 * ModalSinPistas — Diálogo lúdico tipo Painterly RPG cuando el alumno agota sus pistas.
 */
function ModalSinPistas({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleIrAlBazar = () => {
    onClose();
    navigate('/alumno/bazar');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¡Pistas agotadas!"
      size="sm"
    >
      <div className="flex flex-col items-center text-center gap-4 py-2 select-none">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-500 flex items-center justify-center text-amber-500 shadow-[3px_3px_0px_var(--border)]">
          <Lightbulb size={34} className="animate-pulse" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-display font-black text-[var(--text-primary)]">
            (っ- ‸ - ς) No te quedan pistas disponibles
          </span>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Tu reserva de pistas compradas en el Bazar se ha agotado. Podés visitar el Bazar del Alquimista y canjear tus puntos de acción (AP) para adquirir nuevas pistas de descarte.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-xs"
          >
            Continuar Desafío
          </Button>

          <Button
            variant="primary"
            onClick={handleIrAlBazar}
            className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-[2px_2px_0px_#78350f]"
          >
            <ShoppingBag size={14} />
            <span>Ir al Bazar</span>
            <ArrowRight size={13} />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalSinPistas;
