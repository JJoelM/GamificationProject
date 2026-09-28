import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShieldCheck, UserCheck, UserX, RefreshCw, Search,
  Clock, CheckCircle2, XCircle, AlertTriangle, Shield, Filter,
  ChevronDown, ChevronUp, Mail,
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
 * GestionDocentes v2 — Panel completo de gestión de cuentas para Directivos.
 *
 * Funcionalidades:
 * - Tabs de filtro por estado (Todas / Pendientes / Activas / Suspendidas)
 * - Búsqueda por nombre o email
 * - Confirmación modal antes de acciones destructivas
 * - Stats en cards animadas
 * - Fila expandible con detalles
 */

const ESTADOS = [
  { key: 'todas', label: 'Todas', icon: Users },
  { key: 'Pendiente', label: 'Pendientes', icon: Clock },
  { key: 'Activa', label: 'Activas', icon: CheckCircle2 },
  { key: 'Suspendida', label: 'Suspendidas', icon: XCircle },
];

const estadoBadge = (estado) => {
  if (estado === 'Activa') return 'correcto';
  if (estado === 'Pendiente' || estado === 'PendienteDeAprobacionParental') return 'xp';
  if (estado === 'Suspendida') return 'incorrecto';
  return 'info';
};

const estadoLabel = (estado) => {
  if (estado === 'PendienteDeAprobacionParental') return 'Pendiente (Parental)';
  return estado;
};

function GestionDocentes() {
  const queryClient = useQueryClient();

  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { usuario, nuevoEstado }

  const { data: docentes, isLoading, error, refetch } = useQuery({
    queryKey: ['usuarios', 'docentes'],
    queryFn: async () => {
      try {
        return await usuariosApi.getDocentes();
      } catch (err) {
        if (!err.isApiError) {
          return [
            { usuarioId: '11111111-1111-1111-1111-111111111111', email: 'docente@unne.edu.ar', nombreCompleto: 'Prof. Arduino Marcori', estadoCuenta: 'Activa', rol: 'Docente', fechaRegistro: '2025-03-15' },
            { usuarioId: '55555555-5555-5555-5555-555555555555', email: 'laura.garcia@unne.edu.ar', nombreCompleto: 'Prof. Laura García', estadoCuenta: 'Pendiente', rol: 'Docente', fechaRegistro: '2025-09-10' },
            { usuarioId: '66666666-6666-6666-6666-666666666666', email: 'carlos.mendez@unne.edu.ar', nombreCompleto: 'Prof. Carlos Méndez', estadoCuenta: 'Suspendida', rol: 'Docente', fechaRegistro: '2025-06-22' },
            { usuarioId: '77777777-7777-7777-7777-777777777777', email: 'maria.lopez@unne.edu.ar', nombreCompleto: 'Prof. María López', estadoCuenta: 'Activa', rol: 'Docente', fechaRegistro: '2025-04-01' },
            { usuarioId: '88888888-8888-8888-8888-888888888888', email: 'pedro.alumno@unne.edu.ar', nombreCompleto: 'Pedro Ramírez', estadoCuenta: 'PendienteDeAprobacionParental', rol: 'Alumno', fechaRegistro: '2025-09-13' },
          ];
        }
        throw err;
      }
    },
  });

  const { mutate: cambiarEstado, isPending: isUpdating } = useMutation({
    mutationFn: ({ usuarioId, nuevoEstado }) =>
      usuariosApi.cambiarEstado(usuarioId, { nuevoEstado }),
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['usuarios', 'docentes'] });
      setConfirmAction(null);
    },
    onError: () => {
      setConfirmAction(null);
    },
  });

  // Filtrado y búsqueda
  const docentesFiltrados = useMemo(() => {
    if (!docentes) return [];
    let resultado = docentes;

    if (filtro !== 'todas') {
      resultado = resultado.filter((d) => {
        if (filtro === 'Pendiente') return d.estadoCuenta === 'Pendiente' || d.estadoCuenta === 'PendienteDeAprobacionParental';
        return d.estadoCuenta === filtro;
      });
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(
        (d) => d.nombreCompleto?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q)
      );
    }

    return resultado;
  }, [docentes, filtro, busqueda]);

  // Stats
  const stats = useMemo(() => {
    if (!docentes) return { total: 0, activas: 0, pendientes: 0, suspendidas: 0 };
    return {
      total: docentes.length,
      activas: docentes.filter((d) => d.estadoCuenta === 'Activa').length,
      pendientes: docentes.filter((d) => d.estadoCuenta === 'Pendiente' || d.estadoCuenta === 'PendienteDeAprobacionParental').length,
      suspendidas: docentes.filter((d) => d.estadoCuenta === 'Suspendida').length,
    };
  }, [docentes]);

  const handleAction = (usuario, nuevoEstado) => {
    playParchment();
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
            <ShieldCheck className="text-[var(--brand-primary)]" size={24} />
            <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">
              Panel de Gestión de Cuentas
            </h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Supervisá los accesos, aprobá registros pendientes y gestioná el estado de las cuentas del cuerpo docente y alumnos.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw size={14} />
          Actualizar
        </Button>
      </div>

      {error && <ErrorBanner error={error} onDismiss={() => refetch()} />}

      {isLoading ? (
        <div className="py-24 flex justify-center items-center">
          <Spinner size="lg" label="Consultando nómina de cuentas..." />
        </div>
      ) : (
        <>
          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, icon: Users, color: 'text-[var(--brand-primary)]', bg: 'bg-[color-mix(in_oklch,var(--brand-primary)_10%,var(--bg-panel))]' },
              { label: 'Activas', value: stats.activas, icon: CheckCircle2, color: 'text-[var(--brand-emerald)]', bg: 'bg-[color-mix(in_oklch,var(--brand-emerald)_10%,var(--bg-panel))]' },
              { label: 'Pendientes', value: stats.pendientes, icon: Clock, color: 'text-[var(--brand-gold)]', bg: 'bg-[color-mix(in_oklch,var(--brand-gold)_10%,var(--bg-panel))]' },
              { label: 'Suspendidas', value: stats.suspendidas, icon: XCircle, color: 'text-[var(--brand-crimson)]', bg: 'bg-[color-mix(in_oklch,var(--brand-crimson)_10%,var(--bg-panel))]' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 22 }}
              >
                <Card className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-[8px_12px_10px_10px] ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <span className="font-display font-black text-2xl text-[var(--text-primary)]">{stat.value}</span>
                    <p className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ── Filtros + Búsqueda ── */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Tabs de estado */}
            <div className="flex p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-muted)] gap-0.5">
              {ESTADOS.map(({ key, label, icon: TabIcon }) => (
                <button
                  key={key}
                  onClick={() => setFiltro(key)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all cursor-pointer',
                    filtro === key
                      ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-accent)]',
                  ].join(' ')}
                >
                  <TabIcon size={13} />
                  {label}
                  {key !== 'todas' && (
                    <span className={`text-[10px] font-bold ${filtro === key ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                      ({key === 'Pendiente' ? stats.pendientes : key === 'Activa' ? stats.activas : stats.suspendidas})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[8px_12px_10px_10px] border border-[var(--border-muted)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs font-sans focus:border-[var(--brand-primary)] outline-none transition-colors"
              />
            </div>
          </div>

          {/* ── Tabla de cuentas ── */}
          <Card className="flex flex-col gap-0 p-0 overflow-hidden">
            {/* Header de tabla */}
            <div className="p-4 bg-[var(--bg-muted)] border-b border-[var(--border-muted)] flex items-center justify-between">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                {docentesFiltrados.length} {docentesFiltrados.length === 1 ? 'cuenta' : 'cuentas'}
                {filtro !== 'todas' && ` — ${ESTADOS.find((e) => e.key === filtro)?.label}`}
              </span>
              <Badge variant="violet">
                <Shield size={10} /> Panel Directivo
              </Badge>
            </div>

            {/* Filas */}
            {docentesFiltrados.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  No se encontraron cuentas con los filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-muted)]">
                <AnimatePresence>
                  {docentesFiltrados.map((d, idx) => {
                    const isActiva = d.estadoCuenta === 'Activa';
                    const isPendiente = d.estadoCuenta === 'Pendiente' || d.estadoCuenta === 'PendienteDeAprobacionParental';
                    const isExpanded = expandedId === d.usuarioId;

                    return (
                      <motion.div
                        key={d.usuarioId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        {/* Fila principal */}
                        <div
                          className={[
                            'p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors',
                            isExpanded ? 'bg-[var(--bg-accent)]' : 'hover:bg-[var(--bg-accent)]',
                          ].join(' ')}
                        >
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : d.usuarioId)}
                            className="flex items-center gap-3.5 text-left cursor-pointer flex-1 min-w-0"
                          >
                            {/* Avatar */}
                            <div className={[
                              'w-10 h-10 rounded-[10px_14px_12px_12px] flex items-center justify-center shrink-0 font-display font-bold text-sm',
                              isActiva
                                ? 'bg-[var(--brand-primary)] text-white'
                                : isPendiente
                                  ? 'bg-[var(--brand-gold)] text-[#1C0A00]'
                                  : 'bg-[var(--border-muted)] text-[var(--text-muted)]',
                            ].join(' ')}>
                              {d.nombreCompleto?.charAt(0) || 'U'}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-display font-bold text-sm text-[var(--text-primary)] truncate">
                                {d.nombreCompleto}
                              </h4>
                              <p className="text-xs text-[var(--text-muted)] truncate">{d.email}</p>
                            </div>

                            {isExpanded ? (
                              <ChevronUp size={14} className="text-[var(--text-muted)] shrink-0" />
                            ) : (
                              <ChevronDown size={14} className="text-[var(--text-muted)] shrink-0" />
                            )}
                          </button>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {d.rol && d.rol !== 'Docente' && (
                              <Badge variant="violet">{d.rol}</Badge>
                            )}
                            <Badge variant={estadoBadge(d.estadoCuenta)}>
                              {estadoLabel(d.estadoCuenta)}
                            </Badge>

                            {isPendiente ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="primary"
                                  disabled={isUpdating}
                                  onClick={() => handleAction(d, 'Activa')}
                                >
                                  <UserCheck size={14} />
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  disabled={isUpdating}
                                  onClick={() => handleAction(d, 'Suspendida')}
                                >
                                  <UserX size={14} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant={isActiva ? 'danger' : 'primary'}
                                disabled={isUpdating}
                                onClick={() => handleAction(d, isActiva ? 'Suspendida' : 'Activa')}
                              >
                                {isActiva ? (
                                  <>
                                    <UserX size={14} />
                                    Suspender
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={14} />
                                    Reactivar
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
                              <div className="px-5 pb-4 pt-1 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)] bg-[var(--bg-accent)] border-t border-[var(--border-muted)]">
                                <div className="flex items-center gap-1.5">
                                  <Mail size={12} className="text-[var(--text-muted)]" />
                                  <span>{d.email}</span>
                                </div>
                                {d.rol && (
                                  <div className="flex items-center gap-1.5">
                                    <Shield size={12} className="text-[var(--text-muted)]" />
                                    <span>Rol: <strong>{d.rol}</strong></span>
                                  </div>
                                )}
                                {d.fechaRegistro && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-[var(--text-muted)]" />
                                    <span>Registro: {new Date(d.fechaRegistro).toLocaleDateString('es-AR')}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[var(--text-muted)]">ID:</span>
                                  <code className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-1.5 py-0.5 rounded">
                                    {d.usuarioId?.substring(0, 8)}...
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
            )}
          </Card>
        </>
      )}

      {/* ── Modal de Confirmación ── */}
      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.nuevoEstado === 'Activa'
            ? 'Confirmar Activación de Cuenta'
            : 'Confirmar Suspensión de Cuenta'
        }
        size="sm"
      >
        {confirmAction && (
          <div className="flex flex-col gap-5">
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
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {confirmAction.nuevoEstado === 'Activa'
                    ? 'La cuenta podrá iniciar sesión y acceder a la plataforma inmediatamente.'
                    : 'La cuenta perderá acceso a la plataforma hasta que sea reactivada por un directivo.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-muted)]">
              <Button variant="ghost" onClick={() => setConfirmAction(null)} disabled={isUpdating}>
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
