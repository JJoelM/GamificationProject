import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Check, Plus, KeyRound, Copy, ChevronRight, X, Sparkles, BookOpen
} from 'lucide-react';
import { useMisAulas, useCrearAula, useUnirseAula } from '../../hooks/useAulas';
import useSessionStore from '../../store/useSessionStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { playSuccess, playParchment } from '../../utils/audio';

export default function SelectorAulaModal({ isOpen, onClose }) {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const setAulaActivaId = useSessionStore((s) => s.setAulaActivaId);
  const setCodigoInvitacion = useSessionStore((s) => s.setCodigoInvitacion);

  const { data: aulas, isLoading } = useMisAulas();
  const { mutate: crearAula, isPending: isCreando } = useCrearAula();
  const { mutate: unirseAula, isPending: isUniendose, error: errorUnirse } = useUnirseAula();

  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [mostrarUnirse, setMostrarUnirse] = useState(false);
  const [nombreNuevaAula, setNombreNuevaAula] = useState('');
  const [codigoAUnirse, setCodigoAUnirse] = useState('');
  const [copiadoId, setCopiadoId] = useState(null);

  const esDocente = usuario?.rol === 'Docente';
  const esAlumno = usuario?.rol === 'Alumno';

  const handleSeleccionar = (aula) => {
    playParchment();
    setAulaActivaId(aula.aulaId);
    if (aula.codigoInvitacion) {
      setCodigoInvitacion(aula.codigoInvitacion);
    }
    onClose();
  };

  const handleCopiarCodigo = (e, aula) => {
    e.stopPropagation();
    if (aula.codigoInvitacion) {
      navigator.clipboard?.writeText(aula.codigoInvitacion);
      setCopiadoId(aula.aulaId);
      playSuccess();
      setTimeout(() => setCopiadoId(null), 2000);
    }
  };

  const handleCrearSubmit = (e) => {
    e.preventDefault();
    if (!nombreNuevaAula.trim()) return;
    crearAula(
      { nombre: nombreNuevaAula.trim() },
      {
        onSuccess: () => {
          setNombreNuevaAula('');
          setMostrarCrear(false);
          onClose();
        },
      }
    );
  };

  const handleUnirseSubmit = (e) => {
    e.preventDefault();
    if (!codigoAUnirse.trim()) return;
    unirseAula(
      { codigoInvitacion: codigoAUnirse.trim() },
      {
        onSuccess: () => {
          setCodigoAUnirse('');
          setMostrarUnirse(false);
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selector de Aula y Cursos"
      size="lg"
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-[var(--text-secondary)]">
          {esDocente
            ? 'Seleccioná el aula en la que querés gestionar misiones o creá una nueva comisión.'
            : 'Elegí el aula a la que deseás ingresar para realizar misiones o unirte a un nuevo curso.'}
        </p>

        {/* ── Lista de Aulas Disponibles ── */}
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-[var(--text-muted)] animate-pulse">
              Cargando tus aulas...
            </div>
          ) : aulas && aulas.length > 0 ? (
            aulas.map((aula) => {
              const esActiva = aula.aulaId === aulaActivaId;
              const copiado = copiadoId === aula.aulaId;

              return (
                <div
                  key={aula.aulaId}
                  onClick={() => handleSeleccionar(aula)}
                  className={[
                    'p-4 rounded-[12px_16px_14px_14px] border-2 transition-all cursor-pointer flex items-center justify-between gap-3',
                    esActiva
                      ? 'border-[var(--brand-primary)] bg-[color-mix(in_oklch,var(--brand-primary)_10%,var(--bg-panel))] shadow-[3px_3px_0px_var(--brand-primary)]'
                      : 'border-[var(--border)] hover:border-[var(--brand-primary)] bg-[var(--bg-panel)] hover:shadow-[2px_2px_0px_var(--border)]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={[
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        esActiva
                          ? 'bg-[var(--brand-primary)] text-white'
                          : 'bg-[var(--bg-accent)] text-[var(--brand-primary)]',
                      ].join(' ')}
                    >
                      <School size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-[var(--text-primary)] truncate">
                          {aula.nombre}
                        </span>
                        {esActiva && (
                          <Badge variant="correcto">
                            <Check size={11} /> Activa
                          </Badge>
                        )}
                      </div>

                      {aula.codigoInvitacion && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)]">
                          <span>Código:</span>
                          <span className="font-mono font-bold text-[var(--text-primary)] bg-[var(--bg-base)] px-1.5 py-0.5 rounded border border-[var(--border-muted)]">
                            {aula.codigoInvitacion}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopiarCodigo(e, aula)}
                            className="p-1 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
                            title="Copiar código de invitación"
                          >
                            {copiado ? (
                              <Check size={13} className="text-emerald-500" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant={esActiva ? 'primary' : 'ghost'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeleccionar(aula);
                      }}
                    >
                      {esActiva ? 'En curso' : 'Ingresar'}
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-sm text-[var(--text-muted)]">
              No tienes aulas asignadas todavía.
            </div>
          )}
        </div>

        {/* ── Acciones: Crear Aula (Docente) o Unirse (Alumno) ── */}
        <div className="pt-3 border-t border-[var(--border-muted)] flex flex-col gap-3">
          {esDocente && (
            <div>
              {!mostrarCrear ? (
                <Button
                  variant="ghost"
                  onClick={() => setMostrarCrear(true)}
                  className="w-full justify-center"
                >
                  <Plus size={16} />
                  Crear Nueva Aula o Comisión
                </Button>
              ) : (
                <form
                  onSubmit={handleCrearSubmit}
                  className="p-4 rounded-xl bg-[var(--bg-accent)] border border-[var(--border)] flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Nueva Aula
                    </span>
                    <button
                      type="button"
                      onClick={() => setMostrarCrear(false)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={nombreNuevaAula}
                    onChange={(e) => setNombreNuevaAula(e.target.value)}
                    placeholder="Ej. Algoritmos y Estructuras - Comisión B"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setMostrarCrear(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={isCreando || !nombreNuevaAula.trim()}
                    >
                      {isCreando ? 'Creando...' : 'Crear Aula'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {esAlumno && (
            <div>
              {!mostrarUnirse ? (
                <Button
                  variant="ghost"
                  onClick={() => setMostrarUnirse(true)}
                  className="w-full justify-center"
                >
                  <KeyRound size={16} />
                  Unirse a otra Aula con Código
                </Button>
              ) : (
                <form
                  onSubmit={handleUnirseSubmit}
                  className="p-4 rounded-xl bg-[var(--bg-accent)] border border-[var(--border)] flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Ingresar Código del Aula
                    </span>
                    <button
                      type="button"
                      onClick={() => setMostrarUnirse(false)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={codigoAUnirse}
                    onChange={(e) => setCodigoAUnirse(e.target.value.toUpperCase())}
                    placeholder="Código de 8 caracteres (ej. AR92K8X4)"
                    maxLength={10}
                    className="w-full px-3 py-2 text-sm font-mono tracking-widest rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    autoFocus
                  />
                  {errorUnirse && (
                    <p className="text-xs text-[var(--brand-crimson)]">
                      {errorUnirse?.detail || 'No se pudo conectar con esa aula. Revisa el código.'}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setMostrarUnirse(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={isUniendose || !codigoAUnirse.trim()}
                    >
                      {isUniendose ? 'Validando...' : 'Unirse al Aula'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
