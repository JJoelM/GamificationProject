import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import SoundToggle from './SoundToggle';
import LevelUpModal from '../ui/LevelUpModal';
import SelectorAulaModal from './SelectorAulaModal';
import useSessionStore from '../../store/useSessionStore';
import { useMisAulas } from '../../hooks/useAulas';

/**
 * AppShell — Layout principal con Sidebar, TopBar, Selector de Aula interactivo, Sonido y Tema
 */
function AppShell() {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const [isSelectorAulaOpen, setIsSelectorAulaOpen] = useState(false);

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

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Área principal ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar */}
        <header
          className={[
            'flex items-center justify-between px-6 py-3',
            'bg-[var(--bg-panel)] border-b-2 border-[var(--border)]',
            'shrink-0',
          ].join(' ')}
        >
          {/* Selector de Aula Activa */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-semibold text-[var(--text-muted)] hidden sm:inline">
              Aula Activa:
            </span>
            <button
              type="button"
              onClick={() => setIsSelectorAulaOpen(true)}
              className="flex items-center gap-2 text-xs font-display font-bold text-[var(--brand-primary)] px-3 py-1.5 rounded-lg bg-[var(--bg-accent)] hover:bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] border border-[var(--border)] hover:border-[var(--brand-primary)] transition-all shadow-[2px_2px_0px_var(--border)] hover:shadow-[2px_2px_0px_var(--brand-primary)] cursor-pointer group"
              title="Cambiar de aula o gestionar comisiones"
            >
              <School size={14} className="text-[var(--brand-primary)]" />
              <span className="max-w-[200px] truncate">{nombreAula}</span>
              <ChevronDown size={14} className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <SoundToggle />
            <ThemeToggle />
          </div>
        </header>

        {/* Contenido — scrolleable independientemente */}
        <motion.main
          key={usuario.rol}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-6"
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
