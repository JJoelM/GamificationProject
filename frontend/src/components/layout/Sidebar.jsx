import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  InboxIcon,
  Swords,
  Trophy,
  LogOut,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ShoppingBag,
  BarChart3,
  GitFork,
  Settings,
  X,
} from 'lucide-react';
import useSessionStore from '../../store/useSessionStore';
import { usuariosApi } from '../../services/api';
import ArtFrame from '../ui/ArtFrame';
import PerfilModal from './PerfilModal';
import { playParchment } from '../../utils/audio';

/**
 * Sidebar v4 — Navegación lateral rol-aware responsiva (Desktop + Mobile Drawer)
 */

const NAV_DOCENTE = [
  { to: '/docente/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/docente/misiones/pendientes', label: 'Inbox de Misiones', Icon: InboxIcon },
  { to: '/docente/camino', label: 'Secuencia Curricular', Icon: GitFork },
  { to: '/docente/metricas', label: 'Diagnóstico & Métricas', Icon: BarChart3 },
];

const NAV_ALUMNO = [
  { to: '/alumno/dashboard', label: 'Mi Personaje', Icon: GraduationCap },
  { to: '/alumno/misiones', label: 'Tablero de Misiones', Icon: Swords },
  { to: '/alumno/grimorio', label: 'Grimorio del Saber', Icon: BookOpen },
  { to: '/alumno/bazar', label: 'Bazar del Alquimista', Icon: ShoppingBag },
];

const NAV_DIRECTIVO = [
  { to: '/directivo/dashboard', label: 'Métricas Globales', Icon: BarChart3 },
  { to: '/directivo/docentes', label: 'Gestión de Cuentas', Icon: ShieldCheck },
];

const navLinkBase = [
  'flex items-center gap-3 px-4 py-2.5 rounded-[10px_14px_12px_12px]',
  'text-xs font-display font-semibold',
  'text-[var(--text-secondary)]',
  'transition-all duration-150',
  'hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)]',
  'hover:shadow-[2px_2px_0px_var(--border-muted)]',
].join(' ');

const navLinkActive = [
  'bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))]',
  'text-[var(--brand-primary)] font-bold',
  'border border-[var(--brand-primary)]',
  'shadow-[2px_2px_0px_var(--brand-primary)]',
].join(' ');

function SidebarContent({ onCloseMobile }) {
  const { usuario, clearUsuario, resetearProgreso } = useSessionStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isPerfilOpen, setIsPerfilOpen] = useState(false);

  const rol = usuario?.rol || 'Alumno';
  const navItems =
    rol === 'Docente'
      ? NAV_DOCENTE
      : rol === 'Directivo' || rol === 'Administrador'
      ? NAV_DIRECTIVO
      : NAV_ALUMNO;

  const RolIcon =
    rol === 'Docente'
      ? BookOpen
      : rol === 'Directivo' || rol === 'Administrador'
      ? ShieldCheck
      : Trophy;

  const handleCerrarSesion = async () => {
    try {
      await usuariosApi.logout();
    } catch {
      // Ignorar error en logout — la sesión local se limpia igual
    }
    // Limpiar caché completa de React Query y storage local para evitar fugas entre cuentas
    queryClient.clear();
    useSessionStore.persist.clearStorage();
    resetearProgreso();
    clearUsuario();
    onCloseMobile?.();
    navigate('/');
  };

  const handleOpenPerfil = () => {
    playParchment();
    setIsPerfilOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[var(--bg-panel)] to-[var(--bg-muted)] select-none">
      {/* ── Logo / Título ── */}
      <div className="px-5 pt-5 pb-4 border-b border-[var(--border-muted)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={[
              'w-10 h-10 rounded-[10px_14px_10px_12px] flex items-center justify-center',
              'bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-violet,var(--brand-primary))]',
              'shadow-[2px_2px_0px_var(--border)]',
              'shrink-0',
            ].join(' ')}
            aria-hidden="true"
          >
            <Swords size={18} strokeWidth={2.5} style={{ color: '#FCD34D' }} />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold leading-tight text-[var(--text-primary)]">
              EduQuest
            </h1>
            <p className="text-[11px] text-[var(--text-muted)]">Plataforma RPG Educativa</p>
          </div>
        </div>

        {/* Botón cerrar en mobile */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Indicador de usuario y rol (Click para abrir perfil) ── */}
      <div className="px-4 pt-3 pb-2">
        <button
          type="button"
          onClick={handleOpenPerfil}
          title="Configuración de Cuenta y Perfil"
          className="w-full text-left flex flex-col gap-1.5 p-2.5 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-primary)_8%,var(--bg-panel))] border border-[var(--border-muted)] hover:border-[var(--brand-primary)] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RolIcon size={14} className="text-[var(--brand-primary)] shrink-0" />
              <span className="text-xs font-display font-bold text-[var(--brand-primary)] uppercase tracking-wide">
                {rol}
              </span>
            </div>
            <Settings size={13} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
            {usuario?.nombreCompleto || 'Usuario Conectado'}
          </span>
        </button>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 px-3 pt-2 pb-2 flex flex-col gap-1 overflow-y-auto" aria-label="Navegación principal">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onCloseMobile?.()}
            className={({ isActive }) =>
              [navLinkBase, isActive ? navLinkActive : ''].join(' ')
            }
          >
            <Icon size={16} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── ArtFrame decorativo ── */}
      <div className="px-5 pb-2">
        <ArtFrame
          label={rol === 'Alumno' ? 'Tu Personaje' : 'Arte: Mentor'}
          shape="scroll"
          aspectRatio="1/1"
          avatarId={rol === 'Alumno' ? (useSessionStore.getState().avatarEquipado || 'erudito_arcano') : null}
          auraColor={rol === 'Alumno' ? useSessionStore.getState().auraColor : null}
          className="w-20 mx-auto opacity-90"
        />
      </div>

      {/* ── Footer: Mi Perfil y Cerrar sesión ── */}
      <div className="px-3 pb-4 pt-2 border-t border-[var(--border-muted)] flex flex-col gap-1">
        <button
          type="button"
          onClick={handleOpenPerfil}
          className={[
            'w-full flex items-center gap-3 px-4 py-2 rounded-[8px_12px_10px_10px]',
            'text-xs font-display font-bold text-[var(--text-secondary)] cursor-pointer',
            'hover:bg-[var(--bg-accent)] hover:text-[var(--brand-primary)]',
            'transition-colors duration-150',
          ].join(' ')}
        >
          <Settings size={15} strokeWidth={2} aria-hidden="true" />
          Mi Perfil & Seguridad
        </button>

        <button
          type="button"
          onClick={handleCerrarSesion}
          className={[
            'w-full flex items-center gap-3 px-4 py-2 rounded-[8px_12px_10px_10px]',
            'text-xs font-display font-bold text-[var(--text-muted)] cursor-pointer',
            'hover:bg-[color-mix(in_oklch,var(--brand-crimson)_10%,var(--bg-panel))]',
            'hover:text-[var(--brand-crimson)]',
            'transition-colors duration-150',
          ].join(' ')}
        >
          <LogOut size={15} strokeWidth={2} aria-hidden="true" />
          Cerrar Sesión
        </button>
      </div>

      {/* Modal de Perfil & Configuración */}
      <PerfilModal
        isOpen={isPerfilOpen}
        onClose={() => setIsPerfilOpen(false)}
      />
    </div>
  );
}

export default function Sidebar({ isOpenMobile, onCloseMobile }) {
  return (
    <>
      {/* ── Desktop Sidebar (Fijo en md+) ── */}
      <aside className="hidden md:flex flex-col h-full border-r-2 border-[var(--border)] w-64 shrink-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer (Slide-over con backdrop en < md) ── */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Panel lateral deslizante */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 border-r-2 border-[var(--border)]"
            >
              <SidebarContent onCloseMobile={onCloseMobile} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
