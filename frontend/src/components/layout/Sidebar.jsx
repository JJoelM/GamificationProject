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
  { to: '/alumno/ranking', label: 'Salón de Aventureros', Icon: Trophy },
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

function MentorHombreSvg({ className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="46" fill="#1E1B4B" />
      <path d="M22 88 Q50 64 78 88 L72 100 L28 100 Z" fill="#1E3A8A" />
      <path d="M50 70 L50 96 M36 82 L50 88 M64 82 L50 88" stroke="#93C5FD" strokeWidth="1.5" />
      <circle cx="50" cy="46" r="18" fill="#FDE68A" />
      <circle cx="43" cy="45" r="2" fill="#1E1B4B" />
      <circle cx="57" cy="45" r="2" fill="#1E1B4B" />
      <path d="M40 40 Q44 38 47 41" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M60 40 Q56 38 53 41" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 48 Q50 76 62 48 Q58 58 50 64 Q42 58 38 48 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
      <path d="M26 36 Q50 20 74 36 L70 42 Q50 28 30 42 Z" fill="#2563EB" stroke="#60A5FA" strokeWidth="1.5" />
      <circle cx="50" cy="24" r="4" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
    </svg>
  );
}

function MentoraMujerSvg({ className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="46" fill="#2E1065" />
      <path d="M22 88 Q50 64 78 88 L72 100 L28 100 Z" fill="#581C87" />
      <path d="M50 70 L50 96 M36 82 L50 88 M64 82 L50 88" stroke="#C084FC" strokeWidth="1.5" />
      <path d="M32 38 Q24 64 32 76 Q38 56 36 38 Z" fill="#3B0764" />
      <path d="M68 38 Q76 64 68 76 Q62 56 64 38 Z" fill="#3B0764" />
      <circle cx="50" cy="46" r="18" fill="#FDE68A" />
      <circle cx="43" cy="45" r="2.5" fill="#2E1065" />
      <circle cx="57" cy="45" r="2.5" fill="#2E1065" />
      <circle cx="44" cy="44" r="1" fill="#FFFFFF" />
      <circle cx="58" cy="44" r="1" fill="#FFFFFF" />
      <path d="M46 54 Q50 57 54 54" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M28 36 Q50 24 72 36" stroke="#FCD34D" strokeWidth="2.5" fill="none" />
      <polygon points="50,22 54,28 50,34 46,28" fill="#A855F7" stroke="#FCD34D" strokeWidth="1" />
      <circle cx="50" cy="28" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

function DirectivoCancillerSvg({ className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <defs>
        <radialGradient id="grad-canciller-bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4338CA" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0B091A" />
        </radialGradient>
        <linearGradient id="grad-canciller-toga" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="grad-canciller-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Fondo celestial de rectoría */}
      <circle cx="50" cy="50" r="46" fill="url(#grad-canciller-bg)" stroke="#F59E0B" strokeWidth="1.2" />
      <circle cx="28" cy="24" r="0.9" fill="#FDE047" opacity="0.8" />
      <circle cx="72" cy="20" r="1.1" fill="#FDE047" opacity="0.9" />

      {/* Toga doctoral de la Rectoría */}
      <path d="M20 90 Q50 64 80 90 L74 100 L26 100 Z" fill="url(#grad-canciller-toga)" />
      {/* Estola de armiño y oro */}
      <path d="M36 74 L50 96 L64 74" stroke="url(#grad-canciller-gold)" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Gran Medallón de la Orden Institucional */}
      <circle cx="50" cy="80" r="4.5" fill="#FDE047" stroke="#78350F" strokeWidth="1" />
      <path d="M50 77 L51.5 80 L50 83 L48.5 80 Z" fill="#4338CA" />

      {/* Rostro sabio */}
      <circle cx="50" cy="46" r="17" fill="#FED7AA" />

      {/* Cabello canoso respetable */}
      <path d="M33 46 Q31 30 50 28 Q69 30 67 46" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* Barba distinguida de rector */}
      <path d="M40 54 Q50 70 60 54 Q56 62 50 64 Q44 62 40 54 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.8" />

      {/* Ojos y cejas nobles */}
      <circle cx="44" cy="45" r="2" fill="#1E1B4B" />
      <circle cx="56" cy="45" r="2" fill="#1E1B4B" />
      <path d="M41 41 Q44 39 47 41" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M59 41 Q56 39 53 41" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Monóculo de oro en ojo derecho */}
      <circle cx="56" cy="45" r="4.2" stroke="#F59E0B" strokeWidth="1.2" fill="#60A5FA" fillOpacity="0.25" />
      <path d="M59 48 Q64 56 62 68" stroke="#F59E0B" strokeWidth="0.9" fill="none" />

      {/* Corona de Laureles Dorados de Canciller */}
      <path d="M30 35 Q36 22 50 22 Q64 22 70 35" stroke="url(#grad-canciller-gold)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="30" r="2.2" fill="#FDE047" />
      <circle cx="42" cy="24" r="2.2" fill="#FDE047" />
      <circle cx="50" cy="21" r="2.8" fill="#FDE047" stroke="#B45309" strokeWidth="0.6" />
      <circle cx="58" cy="24" r="2.2" fill="#FDE047" />
      <circle cx="66" cy="30" r="2.2" fill="#FDE047" />
    </svg>
  );
}

function DirectivaCancillerSvg({ className = 'w-full h-full' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <defs>
        <radialGradient id="grad-cancillera-bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#31104B" />
          <stop offset="100%" stopColor="#0B091A" />
        </radialGradient>
        <linearGradient id="grad-cancillera-toga" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6D28D9" />
          <stop offset="50%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#2E1065" />
        </linearGradient>
        <linearGradient id="grad-cancillera-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="46" fill="url(#grad-cancillera-bg)" stroke="#F59E0B" strokeWidth="1.2" />
      <circle cx="26" cy="22" r="1" fill="#FDE047" opacity="0.8" />
      <circle cx="74" cy="24" r="1.1" fill="#FDE047" opacity="0.9" />

      {/* Toga y capa consular */}
      <path d="M20 90 Q50 64 80 90 L74 100 L26 100 Z" fill="url(#grad-cancillera-toga)" />
      {/* Hombreras y cuello ceremonial bordado */}
      <path d="M34 72 Q50 86 66 72" stroke="url(#grad-cancillera-gold)" strokeWidth="2.5" fill="none" />
      {/* Medallón de zafiro de la Rectoría */}
      <polygon points="50,74 54,80 50,86 46,80" fill="#2563EB" stroke="#FDE047" strokeWidth="1.2" />
      <circle cx="50" cy="80" r="1.5" fill="#FFFFFF" />

      {/* Peinado noble recogido */}
      <path d="M30 46 Q26 26 50 24 Q74 26 70 46" stroke="#451A03" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="20" r="7" fill="#451A03" />

      {/* Rostro distinguido */}
      <circle cx="50" cy="46" r="17" fill="#FED7AA" />

      {/* Ojos expresivos y serenos */}
      <circle cx="44" cy="46" r="2.2" fill="#31104B" />
      <circle cx="56" cy="46" r="2.2" fill="#31104B" />
      <circle cx="45" cy="45" r="0.8" fill="#FFFFFF" />
      <circle cx="57" cy="45" r="0.8" fill="#FFFFFF" />
      <path d="M46 54 Q50 57 54 54" stroke="#9A3412" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Gafas finas doradas de decana */}
      <circle cx="44" cy="46" r="4.2" stroke="#F59E0B" strokeWidth="1" fill="#67E8F9" fillOpacity="0.2" />
      <circle cx="56" cy="46" r="4.2" stroke="#F59E0B" strokeWidth="1" fill="#67E8F9" fillOpacity="0.2" />
      <path d="M48.2 46 L51.8 46" stroke="#F59E0B" strokeWidth="1.2" />

      {/* Tiara de laureles dorados con gema */}
      <path d="M32 32 Q50 20 68 32" stroke="url(#grad-cancillera-gold)" strokeWidth="2.2" fill="none" />
      <polygon points="50,19 53,24 50,29 47,24" fill="#A855F7" stroke="#FDE047" strokeWidth="0.8" />
      <circle cx="36" cy="28" r="2" fill="#FDE047" />
      <circle cx="64" cy="28" r="2" fill="#FDE047" />
    </svg>
  );
}

function SidebarContent({ onCloseMobile }) {
  const { usuario, logout, mentorAvatar = 'hombre', setMentorAvatar } = useSessionStore();
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
    logout();
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
      <div className="px-5 pb-2 flex flex-col items-center gap-1.5">
        <ArtFrame
          label={
            rol === 'Alumno'
              ? 'Tu Personaje'
              : rol === 'Directivo' || rol === 'Administrador'
              ? `Arte: Rectoría (${mentorAvatar === 'mujer' ? 'Cancillera' : 'Canciller'})`
              : `Arte: Mentor (${mentorAvatar === 'mujer' ? 'Mentora' : 'Mentor'})`
          }
          shape="scroll"
          aspectRatio="1/1"
          avatarId={rol === 'Alumno' ? (useSessionStore.getState().avatarEquipado || 'erudito_arcano') : null}
          auraColor={rol === 'Alumno' ? useSessionStore.getState().auraColor : null}
          className="w-20 mx-auto opacity-95 shadow-sm"
        >
          {rol === 'Docente' && (
            mentorAvatar === 'mujer' ? <MentoraMujerSvg /> : <MentorHombreSvg />
          )}
          {(rol === 'Directivo' || rol === 'Administrador') && (
            mentorAvatar === 'mujer' ? <DirectivaCancillerSvg /> : <DirectivoCancillerSvg />
          )}
        </ArtFrame>

        {/* Selector de Mentor / Canciller interactivo para Docente y Directivo */}
        {(rol === 'Docente' || rol === 'Directivo' || rol === 'Administrador') && (
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-muted)] text-[10px] font-display font-bold">
            <button
              type="button"
              onClick={() => { playParchment(); setMentorAvatar('hombre'); }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                mentorAvatar === 'hombre'
                  ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {rol === 'Directivo' || rol === 'Administrador' ? '🏛️ Canciller' : '🧙‍♂️ Mentor'}
            </button>
            <button
              type="button"
              onClick={() => { playParchment(); setMentorAvatar('mujer'); }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                mentorAvatar === 'mujer'
                  ? 'bg-[var(--brand-violet)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {rol === 'Directivo' || rol === 'Administrador' ? '🏛️ Cancillera' : '🧙‍♀️ Mentora'}
            </button>
          </div>
        )}
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
