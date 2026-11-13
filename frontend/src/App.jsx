import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import useSessionStore from './store/useSessionStore';
import LandingPage from './features/landing/LandingPage';
import AuthPage from './features/auth/AuthPage';
import DashboardDocente from './features/docente/DashboardDocente';
import InboxBorradores from './features/docente/InboxBorradores';
import ValidadorMision from './features/docente/ValidadorMision';
import MetricasAula from './features/docente/MetricasAula';
import SecuenciaCurricularDocente from './features/docente/SecuenciaCurricularDocente';
import DashboardAlumno from './features/alumno/DashboardAlumno';
import TableroMisiones from './features/alumno/TableroMisiones';
import SalonAventureros from './features/alumno/SalonAventureros';
import BazarRecompensas from './features/alumno/BazarRecompensas';
import GrimorioSaber from './features/alumno/GrimorioSaber';
import GestionDocentes from './features/directivo/GestionDocentes';
import DashboardDirectivo from './features/directivo/DashboardDirectivo';

/**
 * App — Configuración de rutas de React Router
 *
 * Rutas según spec.md + extensiones pedagógicas:
 * /                              → LandingPage (Página de captación, propuesta de valor y comercial Painterly RPG)
 * /auth o /login                 → AuthPage (Login universal y autorregistros con cookie HttpOnly)
 *
 * Rutas Docente:
 * /docente/dashboard             → DashboardDocente (métricas, código de aula y accesos rápidos)
 * /docente/misiones/pendientes   → InboxBorradores (inbox HITL de misiones IA con salida de cartas)
 * /docente/misiones/:id/validar  → ValidadorMision (editor HITL de borrador y calibración de XP)
 * /docente/metricas              → MetricasAula (analítica pedagógica y mapa de calor de errores)
 *
 * Rutas Alumno:
 * /alumno/dashboard              → DashboardAlumno (hoja de personaje, level up, vitrina de logros, ranking)
 * /alumno/misiones               → TableroMisiones (tablero completo de misiones activas)
 * /alumno/bazar                  → BazarRecompensas (tienda de cosméticos, mascotas y escudos de racha con AP)
 * /alumno/grimorio               → GrimorioSaber (compendio coleccionable de cartas curriculares)
 *
 * Rutas Directivo:
 * /directivo/docentes            → GestionDocentes (gestión de cuentas y aprobación de menores)
 */
const RUTA_POR_ROL = {
  Docente: '/docente/dashboard',
  Alumno: '/alumno/dashboard',
  Directivo: '/directivo/dashboard',
};

function ProtectedRoute({ allowedRoles, children }) {
  const usuario = useSessionStore((s) => s.usuario);
  if (!usuario) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    return <Navigate to={RUTA_POR_ROL[usuario.rol] || '/'} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Portal y Landing Pública Comercial */}
        <Route path="/" element={<LandingPage />} />

        {/* Autenticación Real — fuera del AppShell */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Rutas principales envueltas en AppShell (sidebar + topbar + audio + level up) */}
        <Route element={<AppShell />}>
          {/* Entorno Docente */}
          <Route path="/docente/dashboard" element={<ProtectedRoute allowedRoles={['Docente']}><DashboardDocente /></ProtectedRoute>} />
          <Route path="/docente/misiones/pendientes" element={<ProtectedRoute allowedRoles={['Docente']}><InboxBorradores /></ProtectedRoute>} />
          <Route path="/docente/misiones/:id/validar" element={<ProtectedRoute allowedRoles={['Docente']}><ValidadorMision /></ProtectedRoute>} />
          <Route path="/docente/metricas" element={<ProtectedRoute allowedRoles={['Docente']}><MetricasAula /></ProtectedRoute>} />
          <Route path="/docente/camino" element={<ProtectedRoute allowedRoles={['Docente']}><SecuenciaCurricularDocente /></ProtectedRoute>} />

          {/* Entorno Alumno */}
          <Route path="/alumno/dashboard" element={<ProtectedRoute allowedRoles={['Alumno']}><DashboardAlumno /></ProtectedRoute>} />
          <Route path="/alumno/misiones" element={<ProtectedRoute allowedRoles={['Alumno']}><TableroMisiones /></ProtectedRoute>} />
          <Route path="/alumno/ranking" element={<ProtectedRoute allowedRoles={['Alumno']}><SalonAventureros /></ProtectedRoute>} />
          <Route path="/alumno/bazar" element={<ProtectedRoute allowedRoles={['Alumno']}><BazarRecompensas /></ProtectedRoute>} />
          <Route path="/alumno/grimorio" element={<ProtectedRoute allowedRoles={['Alumno']}><GrimorioSaber /></ProtectedRoute>} />

          {/* Entorno Directivo / Administrador */}
          <Route path="/directivo/dashboard" element={<ProtectedRoute allowedRoles={['Directivo']}><DashboardDirectivo /></ProtectedRoute>} />
          <Route path="/directivo/docentes" element={<ProtectedRoute allowedRoles={['Directivo']}><GestionDocentes /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;