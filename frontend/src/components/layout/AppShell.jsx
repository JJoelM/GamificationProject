import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, ChevronDown, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import SoundToggle from './SoundToggle';
import LevelUpModal from '../ui/LevelUpModal';
import SelectorAulaModal from './SelectorAulaModal';
import useSessionStore from '../../store/useSessionStore';
import { useMisAulas } from '../../hooks/useAulas';

/**
 * AppShell — Layout principal responsive con Drawer Móvil, Sidebar Desktop, TopBar y Selector de Aula
 */
function AppShell() {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const [isSelectorAulaOpen, setIsSelectorAulaOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { data: aulas } = useMisAulas();

  // Nombre del aula activa actual
  const aulaActual = aulas?.find((a) => a.aulaId === aulaActivaId);
  const nombreAula = aulaActual?.nombre || 'Laboratorio de Sistemas';

  // Guard de sesión — si no está autenticado, vuelve a la pantalla de login/registro
  if (!usuario) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      {/* ── Modal global de Level Up ── */}
      <LevelUpModal />

      {/* ── Modal interactivo de Selector de Aula ── */}
      <SelectorAulaModal
        isOpen={isSelectorAulaOpen}
        onClose={() => setIsSelectorAulaOpen(false)}
      />

      {/* ── Sidebar (Desktop estático + Mobile Drawer) ── */}
      <Sidebar
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* ── Área principal ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar */}
        <header
          className={[
            'flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3',
            'bg-[var(--bg-panel)] border-b-2 border-[var(--border)]',
            'shrink-0 gap-2',
          ].join(' ')}
        >
          {/* Selector de Aula Activa & Botón Hamburguesa */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 rounded-lg bg-[var(--bg-accent)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--brand-primary)] cursor-pointer shrink-0 transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={18} />
            </button>

            <span className="text-xs font-display font-semibold text-[var(--text-muted)] hidden lg:inline shrink-0">
              Aula Activa:
            </span>

            <button
              type="button"
              onClick={() => setIsSelectorAulaOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs font-display font-bold text-[var(--brand-primary)] px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--bg-accent)] hover:bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] border border-[var(--border)] hover:border-[var(--brand-primary)] transition-all shadow-[2px_2px_0px_var(--border)] hover:shadow-[2px_2px_0px_var(--brand-primary)] cursor-pointer group min-w-0"
              title="Cambiar de aula o gestionar comisiones"
            >
              <School size={14} className="text-[var(--brand-primary)] shrink-0" />
              <span className="max-w-[120px] sm:max-w-[220px] truncate">{nombreAula}</span>
              <ChevronDown size={14} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-transform group-hover:translate-y-0.5 shrink-0" />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SoundToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Contenido — scrolleable independientemente y responsivo */}
        <motion.main
          key={usuario.rol}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-3 sm:p-6"
          id="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

export default AppShell;
