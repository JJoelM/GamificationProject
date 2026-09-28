import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  InboxIcon,
  Swords,
  Trophy,
  LogOut,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';
import useSessionStore from '../../store/useSessionStore';
import { usuariosApi } from '../../services/api';
import ArtFrame from '../ui/ArtFrame';

/**
 * Sidebar v3 — Navegación lateral rol-aware completa con Bazar, Grimorio y Diagnóstico
 */

const NAV_DOCENTE = [
  { to: '/docente/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/docente/misiones/pendientes', label: 'Inbox de Misiones', Icon: InboxIcon },
  { to: '/docente/metricas', label: 'Diagnóstico & Métricas', Icon: BarChart3 },
];

const NAV_ALUMNO = [
  { to: '/alumno/dashboard', label: 'Mi Personaje', Icon: GraduationCap },
  { to: '/alumno/misiones', label: 'Tablero de Misiones', Icon: Swords },
  { to: '/alumno/grimorio', label: 'Grimorio del Saber', Icon: BookOpen },
  { to: '/alumno/bazar', label: 'Bazar del Alquimista', Icon: ShoppingBag },
];

const NAV_DIRECTIVO = [
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

function Sidebar() {
  const { usuario, clearUsuario, resetearProgreso } = useSessionStore();
  const navigate = useNavigate();

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
    // Limpiar progreso de juego ANTES de limpiar el usuario
    // para evitar que el próximo usuario herede XP/avatar/inventario
    resetearProgreso();
    clearUsuario();
    navigate('/');
  };

  return (
    <aside
      className={[
        'flex flex-col h-full',
        'bg-gradient-to-b from-[var(--bg-panel)] to-[var(--bg-muted)]',
        'border-r-2 border-[var(--border)]',
        'w-64 shrink-0',
      ].join(' ')}
    >
      {/* ── Logo / Título ── */}
      <div className="px-5 pt-6 pb-4 border-b border-[var(--border-muted)]">
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
      </div>

      {/* ── Indicador de usuario y rol ── */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex flex-col gap-1.5 p-2.5 rounded-[10px_14px_12px_12px] bg-[color-mix(in_oklch,var(--brand-primary)_8%,var(--bg-panel))] border border-[var(--border-muted)]">
          <div className="flex items-center gap-2">
            <RolIcon size={14} className="text-[var(--brand-primary)] shrink-0" />
            <span className="text-xs font-display font-bold text-[var(--brand-primary)] uppercase tracking-wide">
              {rol}
            </span>
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
            {usuario?.nombreCompleto || 'Usuario Conectado'}
          </span>
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 px-3 pt-2 pb-2 flex flex-col gap-1 overflow-y-auto" aria-label="Navegación principal">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
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

      {/* ── Footer: Cerrar sesión ── */}
      <div className="px-3 pb-4 pt-2 border-t border-[var(--border-muted)]">
        <button
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
    </aside>
  );
}

export default Sidebar;
