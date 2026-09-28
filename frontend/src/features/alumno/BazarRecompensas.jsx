import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Zap, Shield, Check, ShoppingBag, ArrowLeft,
  Crown, Heart, AlertCircle, Info, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useSessionStore from '../../store/useSessionStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ARTICULOS_BAZAR, CATEGORIAS_BAZAR } from './components/BazarData';
import { playSuccess, playParchment, playChime } from '../../utils/audio';

function BazarRecompensas() {
  const navigate = useNavigate();
  const apTotal = useSessionStore((s) => s.apTotal) || 0;
  const escudosRacha = useSessionStore((s) => s.escudosRacha) || 0;
  const articulosComprados = useSessionStore((s) => s.articulosComprados) || [];
  const marcoEstilo = useSessionStore((s) => s.marcoEstilo);
  const mascotaEquipada = useSessionStore((s) => s.mascotaEquipada);
  const tituloEquipado = useSessionStore((s) => s.tituloEquipado);

  const comprarArticulo = useSessionStore((s) => s.comprarArticulo);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [feedbackMensaje, setFeedbackMensaje] = useState(null);

  const articulosFiltrados = categoriaSeleccionada === 'todas'
    ? ARTICULOS_BAZAR
    : ARTICULOS_BAZAR.filter((a) => a.categoria === categoriaSeleccionada);

  const handleAccionArticulo = (articulo) => {
    const yaComprado = articulosComprados.includes(articulo.id);

    if (!yaComprado && apTotal < articulo.costoAp) {
      setFeedbackMensaje({
        tipo: 'error',
        texto: `Necesitas ${articulo.costoAp} AP para adquirir "${articulo.nombre}". ¡Resuelve misiones para ganar más AP!`,
      });
      return;
    }

    const res = comprarArticulo({
      id: articulo.id,
      costoAp: articulo.costoAp,
      tipo: articulo.tipo,
      valor: articulo.valor,
    });

    if (res.exito) {
      if (yaComprado) {
        playParchment();
        setFeedbackMensaje({
          tipo: 'info',
          texto: `¡Equipaste "${articulo.nombre}" con éxito!`,
        });
      } else {
        playSuccess();
        setFeedbackMensaje({
          tipo: 'exito',
          texto: `¡Adquiriste "${articulo.nombre}"! Ya está disponible en tu inventario.`,
        });
      }
    }
  };

  const getEstadoArticulo = (articulo) => {
    if (articulo.tipo === 'escudo') {
      return { esEquipado: false, yaComprado: false, label: 'Adquirir Escudo' };
    }

    const yaComprado = articulosComprados.includes(articulo.id);
    let esEquipado = false;

    if (articulo.tipo === 'marco') esEquipado = marcoEstilo === articulo.valor;
    if (articulo.tipo === 'mascota') esEquipado = mascotaEquipada === articulo.valor;
    if (articulo.tipo === 'titulo') esEquipado = tituloEquipado === articulo.valor;

    return {
      yaComprado,
      esEquipado,
      label: esEquipado ? 'Equipado' : yaComprado ? 'Equipar' : `Comprar por ${articulo.costoAp} AP`,
    };
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
            Canjea tus Puntos de Habilidad (AP) por acompañantes, marcos de honor y escudos de estudio.
          </p>
        </div>

        {/* Recursos del Alumno */}
        <div className="flex items-center gap-3">
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

      {/* ── Banner de Notificación de Compra / Info ── */}
      <AnimatePresence>
        {feedbackMensaje && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={[
              'p-3.5 rounded-xl border-2 flex items-center justify-between text-xs font-semibold gap-3',
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

      {/* ── Categorías del Bazar ── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-panel)] border-2 border-[var(--border)] shadow-[var(--shadow-c)] overflow-x-auto">
        {CATEGORIAS_BAZAR.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playParchment();
              setCategoriaSeleccionada(cat.id);
            }}
            className={[
              'px-4 py-2 rounded-xl text-xs font-display font-bold whitespace-nowrap transition-all cursor-pointer',
              categoriaSeleccionada === cat.id
                ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
            ].join(' ')}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Cuadrícula de Artículos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articulosFiltrados.map((articulo, idx) => {
          const { yaComprado, esEquipado, label } = getEstadoArticulo(articulo);
          const IconVisual = articulo.IconoVisual;

          return (
            <motion.div
              key={articulo.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 220, damping: 22 }}
            >
              <Card
                className={[
                  'flex flex-col justify-between gap-4 h-full relative group transition-all',
                  esEquipado
                    ? 'border-2 border-[var(--brand-violet)] bg-gradient-to-br from-[var(--bg-panel)] to-[color-mix(in_oklch,var(--brand-violet)_8%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-violet)]'
                    : 'border-2 border-[var(--border)] bg-[var(--bg-panel)]',
                ].join(' ')}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconVisual />
                    <div>
                      <span className={`text-[10px] font-display font-bold uppercase tracking-wider ${articulo.colorRareza}`}>
                        ✦ {articulo.rareza}
                      </span>
                      <h3 className="font-display font-bold text-base text-[var(--text-primary)] leading-tight mt-0.5">
                        {articulo.nombre}
                      </h3>
                    </div>
                  </div>

                  {esEquipado && (
                    <Badge variant="violet">
                      <Check size={10} /> Equipado
                    </Badge>
                  )}
                </div>

                {/* Descripción */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">
                  {articulo.descripcion}
                </p>

                {/* Footer de acción */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-muted)] mt-auto gap-2">
                  <div className="flex items-center gap-1 text-xs font-display font-bold text-[var(--brand-violet)]">
                    <Zap size={14} />
                    <span>{articulo.costoAp} AP</span>
                  </div>

                  <Button
                    size="sm"
                    variant={esEquipado ? 'ghost' : yaComprado ? 'secondary' : 'primary'}
                    disabled={esEquipado}
                    onClick={() => handleAccionArticulo(articulo)}
                  >
                    {esEquipado ? (
                      <>
                        <Check size={13} />
                        En Uso
                      </>
                    ) : yaComprado ? (
                      <>
                        <Sparkles size={13} />
                        Equipar
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={13} />
                        {articulo.costoAp} AP
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default BazarRecompensas;
