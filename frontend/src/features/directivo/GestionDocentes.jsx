import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShieldCheck, UserCheck, UserX, RefreshCw, Search,
  Clock, CheckCircle2, XCircle, AlertTriangle, Shield,
  ChevronDown, ChevronUp, Mail, GraduationCap, BookOpen, AlertCircle
} from 'lucide-react';
import { usuariosApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Modal from '../../components/ui/Modal';
import { playSuccess, playParchment } from '../../utils/audio';

/**
 * GestionDocentes v3 — Panel completo de gestión de cuentas (Docentes y Alumnos) para Directivos.
 *
 * Funcionalidades:
 * - Filtros por rol (Todos / Docentes / Alumnos) y estado (Todas / Pendientes / Activas / Suspendidas)
 * - Visualización de email de tutores para alumnos menores de edad
 * - Activación, Aprobación y Suspensión reactiva vía React Query
 * - Mensajes kaomoji amigables ante excepciones
 * - Diseño táctil Painterly RPG completamente responsivo en móviles
 */

const ESTADOS = [
  { key: 'todas', label: 'Todas', icon: Users },
  { key: 'Pendiente', label: 'Pendientes', icon: Clock },
  { key: 'Activa', label: 'Activas', icon: CheckCircle2 },
  { key: 'Suspendida', label: 'Suspendidas', icon: XCircle },
];

const ROLES = [
  { key: 'todos', label: 'Todos los Roles' },
  { key: 'Docente', label: 'Docentes' },
  { key: 'Alumno', label: 'Alumnos' },
];

const estadoBadge = (estado) => {
  if (estado === 'Activa') return 'correcto';
  if (estado === 'Pendiente' || estado === 'PendienteDeAprobacion' || estado === 'PendienteDeAprobacionParental') return 'xp';
  if (estado === 'Suspendida') return 'incorrecto';
  return 'info';
};

const estadoLabel = (estado) => {
  if (estado === 'PendienteDeAprobacion') return 'Pendiente de Aprobación';
  if (estado === 'PendienteDeAprobacionParental') return 'Pendiente (Parental)';
  return estado;
};

function GestionDocentes() {
  const queryClient = useQueryClient();

  const [filtro, setFiltro] = useState('todas');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { usuario, nuevoEstado }
  const [errorAccion, setErrorAccion] = useState(null);

  const { data: usuarios, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['usuarios', 'docentes'],
    queryFn: () => usuariosApi.getDocentes(),
  });

  const { mutate: cambiarEstado, isPending: isUpdating } = useMutation({
    mutationFn: ({ usuarioId, nuevoEstado }) =>
      usuariosApi.cambiarEstado(usuarioId, { nuevoEstado }),
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'docentes'] });
      setConfirmAction(null);
      setErrorAccion(null);
    },
    onError: (err) => {
      setErrorAccion(
        err?.message ||
        'No se pudo actualizar el estado de la cuenta en este momento (´;ω;｀). Por favor, intenta de nuevo.'
      );
    },
  });

  // Filtrado y búsqueda
  const usuariosFiltrados = useMemo(() => {
    if (!usuarios) return [];
    let resultado = usuarios;

    if (filtroRol !== 'todos') {
      resultado = resultado.filter((u) => u.rol === filtroRol);
    }

    if (filtro !== 'todas') {
      resultado = resultado.filter((u) => {
        if (filtro === 'Pendiente') {
          return u.estadoCuenta === 'Pendiente' ||
                 u.estadoCuenta === 'PendienteDeAprobacion' ||
                 u.estadoCuenta === 'PendienteDeAprobacionParental';
        }
        return u.estadoCuenta === filtro;
      });
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(
        (u) => u.nombreCompleto?.toLowerCase().includes(q) ||
               u.email?.toLowerCase().includes(q) ||
               u.emailTutor?.toLowerCase().includes(q)
      );
    }

    return resultado;
  }, [usuarios, filtro, filtroRol, busqueda]);

  // Stats
  const stats = useMemo(() => {
    if (!usuarios) return { total: 0, activas: 0, pendientes: 0, suspendidas: 0 };
    return {
      total: usuarios.length,
      activas: usuarios.filter((u) => u.estadoCuenta === 'Activa').length,
      pendientes: usuarios.filter((u) =>
        u.estadoCuenta === 'Pendiente' ||
        u.estadoCuenta === 'PendienteDeAprobacion' ||
        u.estadoCuenta === 'PendienteDeAprobacionParental'
      ).length,
      suspendidas: usuarios.filter((u) => u.estadoCuenta === 'Suspendida').length,
    };
  }, [usuarios]);

  const handleAction = (usuario, nuevoEstado) => {
    playParchment();
    setErrorAccion(null);
    setConfirmAction({ usuario, nuevoEstado });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    cambiarEstado({
      usuarioId: confirmAction.usuario.usuarioId,
      nuevoEstado: confirmAction.nuevoEstado,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <ShieldCheck className="text-[var(--brand-primary)] shrink-0" size={24} />
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[var(--text-primary)]">
              Panel de Gestión de Cuentas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Aprobación parental, supervisión de docentes y control institucional de accesos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>{isFetching ? 'Actualizando...' : 'Refrescar'}</span>
          </Button>
        </div>
      </div>

      {/* ── Métricas rápidas ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="default" className="p-3 sm:p-4 text-center">
          <span className="text-xl sm:text-2xl font-display font-black text-[var(--brand-primary)] block">
            {stats.total}
          </span>
          <span className="text-[10px] sm:text-xs font-display font-semibold uppercase text-[var(--text-muted)]">
            Total Cuentas
          </span>
        </Card>

        <Card variant="default" className="p-3 sm:p-4 text-center">
          <span className="text-xl sm:text-2xl font-display font-black text-[var(--brand-emerald)] block">
            {stats.activas}
          </span>
          <span className="text-[10px] sm:text-xs font-display font-semibold uppercase text-[var(--text-muted)]">
            Activas
          </span>
        </Card>

        <Card variant="default" className="p-3 sm:p-4 text-center">
          <span className="text-xl sm:text-2xl font-display font-black text-[var(--brand-gold)] block">
            {stats.pendientes}
          </span>
          <span className="text-[10px] sm:text-xs font-display font-semibold uppercase text-[var(--text-muted)]">
            Por Aprobar
          </span>
        </Card>

        <Card variant="default" className="p-3 sm:p-4 text-center">
          <span className="text-xl sm:text-2xl font-display font-black text-[var(--brand-crimson)] block">
            {stats.suspendidas}
          </span>
          <span className="text-[10px] sm:text-xs font-display font-semibold uppercase text-[var(--text-muted)]">
            Suspendidas
          </span>
        </Card>
      </div>

      {/* ── Controles: Filtros por Rol, Estado y Buscador ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs de Filtro de Estado */}
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-accent)] rounded-xl border border-[var(--border-muted)] overflow-x-auto">
            {ESTADOS.map(({ key, label, icon: Icon }) => {
              const activo = filtro === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { playParchment(); setFiltro(key); }}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer whitespace-nowrap shrink-0',
                    activo
                      ? 'bg-[var(--bg-panel)] text-[var(--brand-primary)] shadow-xs border border-[var(--border)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  <Icon size={13} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Filtro por Rol */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {ROLES.map(({ key, label }) => {
              const activo = filtroRol === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { playParchment(); setFiltroRol(key); }}
                  className={[
                    'px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer border',
                    activo
                      ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-xs'
                      : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-muted)] hover:border-[var(--brand-primary)]',
                  ].join(' ')}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, email o correo del tutor..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
          />
        </div>
      </div>

      {/* ── Lista de Cuentas ── */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-display font-semibold text-[var(--text-muted)]">
            Consultando registros de cuentas institucionales...
          </p>
        </div>
      ) : error ? (
        <ErrorBanner error={error} onRetry={() => refetch()} />
      ) : usuariosFiltrados.length === 0 ? (
        <Card variant="parchment" className="p-8 text-center flex flex-col items-center gap-2">
          <Users size={32} className="text-[var(--text-muted)]" />
          <p className="font-display font-bold text-sm text-[var(--text-primary)]">
            No se encontraron cuentas
          </p>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm">
            {busqueda
              ? `No hay resultados para "${busqueda}". Intenta con otro término o limpia los filtros.`
              : 'No hay cuentas registradas que coincidan con los filtros seleccionados.'}
          </p>
        </Card>
      ) : (
        <Card variant="default" className="divide-y divide-[var(--border-muted)] overflow-hidden">
          <div className="flex flex-col">
            <AnimatePresence>
              {usuariosFiltrados.map((u) => {
                const isActiva = u.estadoCuenta === 'Activa';
                const isPendiente =
                  u.estadoCuenta === 'Pendiente' ||
                  u.estadoCuenta === 'PendienteDeAprobacion' ||
                  u.estadoCuenta === 'PendienteDeAprobacionParental';
                const isExpanded = expandedId === u.usuarioId;
                const isDocente = u.rol === 'Docente';

                return (
                  <motion.div
                    key={u.usuarioId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col border-b border-[var(--border-muted)] last:border-b-0"
                  >
                    {/* Fila principal */}
                    <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--bg-accent)] transition-colors">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : u.usuarioId)}
                        className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0"
                      >
                        {/* Avatar / Inicial */}
                        <div className={[
                          'w-9 h-9 sm:w-10 sm:h-10 rounded-[10px_14px_12px_12px] flex items-center justify-center shrink-0 font-display font-bold text-sm shadow-xs',
                          isActiva
                            ? 'bg-[var(--brand-primary)] text-white'
                            : isPendiente
                              ? 'bg-[var(--brand-gold)] text-[#1C0A00]'
                              : 'bg-[var(--border-muted)] text-[var(--text-muted)]',
                        ].join(' ')}>
                          {u.nombreCompleto?.charAt(0) || 'U'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-sm text-[var(--text-primary)] truncate">
                              {u.nombreCompleto}
                            </h4>
                            {isDocente ? (
                              <BookOpen size={12} className="text-[var(--brand-primary)] shrink-0" title="Docente" />
                            ) : (
                              <GraduationCap size={12} className="text-amber-500 shrink-0" title="Alumno" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                        </div>

                        {isExpanded ? (
                          <ChevronUp size={14} className="text-[var(--text-muted)] shrink-0 ml-auto" />
                        ) : (
                          <ChevronDown size={14} className="text-[var(--text-muted)] shrink-0 ml-auto" />
                        )}
                      </button>

                      {/* Badges y Acciones */}
                      <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center shrink-0">
                        {u.rol && (
                          <Badge variant={isDocente ? 'info' : 'violet'}>
                            {u.rol}
                          </Badge>
                        )}
                        <Badge variant={estadoBadge(u.estadoCuenta)}>
                          {estadoLabel(u.estadoCuenta)}
                        </Badge>

                        {isPendiente ? (
                          <div className="flex gap-1.5 sm:gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isUpdating}
                              onClick={() => handleAction(u, 'Activa')}
                              title="Aprobar y activar cuenta"
                            >
                              <UserCheck size={14} />
                              <span className="hidden xs:inline">Aprobar</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isUpdating}
                              onClick={() => handleAction(u, 'Suspendida')}
                              title="Rechazar o suspender cuenta"
                            >
                              <UserX size={14} />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant={isActiva ? 'danger' : 'primary'}
                            disabled={isUpdating}
                            onClick={() => handleAction(u, isActiva ? 'Suspendida' : 'Activa')}
                          >
                            {isActiva ? (
                              <>
                                <UserX size={14} />
                                <span>Suspender</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} />
                                <span>Reactivar</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Fila expandida con detalles */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-6 pb-4 pt-1.5 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)] bg-[var(--bg-accent)] border-t border-[var(--border-muted)]">
                            <div className="flex items-center gap-1.5">
                              <Mail size={12} className="text-[var(--text-muted)]" />
                              <span>Email: <strong>{u.email}</strong></span>
                            </div>

                            {u.emailTutor && (
                              <div className="flex items-center gap-1.5 p-1 px-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                                <Shield size={12} />
                                <span>Email del Tutor (Menor de edad): <strong>{u.emailTutor}</strong></span>
                              </div>
                            )}

                            {u.fechaNacimiento && (
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-[var(--text-muted)]" />
                                <span>Nacimiento: {u.fechaNacimiento}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5">
                              <span className="text-[var(--text-muted)]">ID:</span>
                              <code className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-1.5 py-0.5 rounded">
                                {u.usuarioId}
                              </code>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* ── Modal de Confirmación de Cambio de Estado ── */}
      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => { if (!isUpdating) setConfirmAction(null); }}
        title={
          confirmAction?.nuevoEstado === 'Activa'
            ? 'Confirmar Activación de Cuenta'
            : 'Confirmar Suspensión de Cuenta'
        }
      >
        {confirmAction && (
          <div className="flex flex-col gap-4">
            {errorAccion && (
              <div className="p-3 rounded-xl bg-crimson-500/10 border border-crimson-500/30 text-[var(--brand-crimson)] text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorAccion}</span>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className={[
                'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                confirmAction.nuevoEstado === 'Activa'
                  ? 'bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] text-[var(--brand-emerald)]'
                  : 'bg-[color-mix(in_oklch,var(--brand-crimson)_15%,var(--bg-panel))] text-[var(--brand-crimson)]',
              ].join(' ')}>
                {confirmAction.nuevoEstado === 'Activa' ? <UserCheck size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <p className="text-sm text-[var(--text-primary)] font-medium">
                  {confirmAction.nuevoEstado === 'Activa'
                    ? `¿Activar la cuenta de ${confirmAction.usuario.nombreCompleto}?`
                    : `¿Suspender la cuenta de ${confirmAction.usuario.nombreCompleto}?`}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {confirmAction.nuevoEstado === 'Activa'
                    ? 'La cuenta podrá iniciar sesión y acceder a la plataforma de inmediato con sus permisos correspondientes.'
                    : 'La cuenta perderá acceso al sistema y no podrá iniciar sesión hasta que sea reactivada por la dirección escolar.'}
                </p>
                {confirmAction.usuario.emailTutor && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-semibold">
                    Cuenta de menor registrada con tutor: {confirmAction.usuario.emailTutor}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-muted)]">
              <Button
                variant="ghost"
                disabled={isUpdating}
                onClick={() => setConfirmAction(null)}
              >
                Cancelar
              </Button>
              <Button
                variant={confirmAction.nuevoEstado === 'Activa' ? 'primary' : 'danger'}
                loading={isUpdating}
                onClick={handleConfirm}
              >
                {confirmAction.nuevoEstado === 'Activa' ? (
                  <><UserCheck size={14} /> Activar Cuenta</>
                ) : (
                  <><UserX size={14} /> Suspender Cuenta</>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default GestionDocentes;
