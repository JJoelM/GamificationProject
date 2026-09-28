import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AuthPage from './features/auth/AuthPage';
import DashboardDocente from './features/docente/DashboardDocente';
import InboxBorradores from './features/docente/InboxBorradores';
import ValidadorMision from './features/docente/ValidadorMision';
import MetricasAula from './features/docente/MetricasAula';
import DashboardAlumno from './features/alumno/DashboardAlumno';
import TableroMisiones from './features/alumno/TableroMisiones';
import BazarRecompensas from './features/alumno/BazarRecompensas';
import GrimorioSaber from './features/alumno/GrimorioSaber';
import GestionDocentes from './features/directivo/GestionDocentes';

/**
 * App — Configuración de rutas de React Router
 *
 * Rutas según spec.md + extensiones pedagógicas:
 * /                              → AuthPage (Login universal y autorregistros con cookie HttpOnly)
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
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Autenticación Real — fuera del AppShell */}
        <Route path="/" element={<AuthPage />} />

        {/* Rutas principales envueltas en AppShell (sidebar + topbar + audio + level up) */}
        <Route element={<AppShell />}>
          {/* Entorno Docente */}
          <Route path="/docente/dashboard" element={<DashboardDocente />} />
          <Route path="/docente/misiones/pendientes" element={<InboxBorradores />} />
          <Route path="/docente/misiones/:id/validar" element={<ValidadorMision />} />
          <Route path="/docente/metricas" element={<MetricasAula />} />

          {/* Entorno Alumno */}
          <Route path="/alumno/dashboard" element={<DashboardAlumno />} />
          <Route path="/alumno/misiones" element={<TableroMisiones />} />
          <Route path="/alumno/bazar" element={<BazarRecompensas />} />
          <Route path="/alumno/grimorio" element={<GrimorioSaber />} />

          {/* Entorno Directivo / Administrador */}
          <Route path="/directivo/docentes" element={<GestionDocentes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;