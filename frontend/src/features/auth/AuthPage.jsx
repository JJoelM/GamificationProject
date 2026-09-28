import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, LogIn, UserPlus, GraduationCap, BookOpen, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import useSessionStore from '../../store/useSessionStore';
import { usuariosApi } from '../../services/api';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/layout/ThemeToggle';
import SoundToggle from '../../components/layout/SoundToggle';
import ErrorBanner from '../../components/ui/ErrorBanner';
import { playSuccess, playParchment } from '../../utils/audio';

/**
 * AuthPage — Autenticación Real con JWT en Cookie HttpOnly
 *
 * Flujos soportados según spec.md:
 * · Login universal (/api/usuarios/login)
 * · Autorregistro de Docente (/api/usuarios/registro/docente)
 * · Registro de Alumno con código de invitación de aula (/api/usuarios/registro/alumno)
 * · Detección de menor de edad con estado PendienteDeAprobacionParental
 * · Acceso rápido a credenciales de prueba del backend
 */
function AuthPage() {
  const navigate = useNavigate();
  const setUsuario = useSessionStore((s) => s.setUsuario);

  const [tab, setTab] = useState('login'); // 'login' | 'registro-docente' | 'registro-alumno'
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [parentalNotice, setParentalNotice] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [codigoInvitacion, setCodigoInvitacion] = useState('AR92K8X4');
  const [fechaNacimiento, setFechaNacimiento] = useState('2003-01-01');
  const [emailTutor, setEmailTutor] = useState('');

  // Calcular si es menor de 18 años
  const esMenorDeEdad = () => {
    if (!fechaNacimiento) return false;
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad < 18;
  };

  const redirectByRole = (rol) => {
    playSuccess();
    if (rol === 'Docente') {
      navigate('/docente/dashboard');
    } else if (rol === 'Directivo' || rol === 'Administrador') {
      navigate('/directivo/docentes');
    } else {
      navigate('/alumno/dashboard');
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const data = await usuariosApi.login({ email, password });
      setUsuario(data);
      redirectByRole(data.rol);
    } catch (err) {
      // Si el backend no está disponible en localhost:5230, permitimos login offline simulado para desarrollo fluido
      if (!err.isApiError) {
        console.warn('Backend desconectado. Usando sesión offline simulada.');
        const isDocente = email.includes('docente');
        const isAdmin = email.includes('admin') || email.includes('directivo');
        const rolSimulado = isDocente ? 'Docente' : isAdmin ? 'Directivo' : 'Alumno';
        const usuarioSimulado = {
          usuarioId: isDocente ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222',
          nombreCompleto: isDocente ? 'Profesor Arduino' : isAdmin ? 'Directivo Escolar' : 'Joel Marcori',
          rol: rolSimulado,
        };
        setUsuario(usuarioSimulado);
        redirectByRole(rolSimulado);
        return;
      }
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  const handleRegistroDocente = async (e) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      await usuariosApi.registrarDocente({ email, nombreCompleto, password });
      setSuccessMessage('¡Cuenta docente creada con éxito! Iniciando sesión...');
      // Auto-login
      const loginData = await usuariosApi.login({ email, password });
      setUsuario(loginData);
      setTimeout(() => redirectByRole(loginData.rol), 1000);
    } catch (err) {
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  const handleRegistroAlumno = async (e) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await usuariosApi.registrarAlumno({
        codigoInvitacion: codigoInvitacion.trim().toUpperCase(),
        email,
        nombreCompleto,
        password,
        fechaNacimiento,
        emailTutor: esMenorDeEdad() ? emailTutor : null,
      });

      if (res?.requiereAprobacionParental) {
        setParentalNotice(
          'Tu cuenta fue registrada exitosamente. Al ser menor de edad, el estado de tu cuenta es Pendiente de Aprobación Parental y se notificó a tu tutor. Podrás iniciar sesión tan pronto como un Directivo o Administrador la apruebe.'
        );
      } else {
        setSuccessMessage('¡Inscripción y cuenta creadas con éxito! Iniciando sesión...');
        const loginData = await usuariosApi.login({ email, password });
        setUsuario(loginData);
        setTimeout(() => redirectByRole(loginData.rol), 1000);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  const fillDemoCredentials = (role) => {
    playParchment();
    setError(null);
    setTab('login');
    if (role === 'Docente') {
      setEmail('docente@unne.edu.ar');
      setPassword('Cambiar123!');
    } else if (role === 'Alumno') {
      setEmail('joel@alumno.unne.edu.ar');
      setPassword('Cambiar123!');
    } else if (role === 'Directivo') {
      setEmail('admin@unne.edu.ar');
      setPassword('Cambiar123!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] px-4 py-12 relative overflow-hidden">
      {/* Controles de barra superior */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <SoundToggle />
        <ThemeToggle />
      </div>

      {/* ── Logo + Título ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-3 mb-8 text-center"
      >
        <div className="w-16 h-16 flex items-center justify-center rounded-[18px_24px_20px_22px] bg-[var(--brand-primary)] shadow-[4px_4px_0px_var(--border)] animate-float">
          <Swords size={32} strokeWidth={2} style={{ color: '#FCD34D' }} />
        </div>

        <div>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
            EduQuest
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">
            Plataforma de Gamificación Educativa
          </p>
        </div>
      </motion.div>

      {/* ── Tarjeta principal de autenticación ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-[20px_28px_22px_26px] bg-[var(--bg-panel)] border-2 border-[var(--border)] shadow-[var(--shadow-card-hover)] flex flex-col gap-6"
      >
        {/* Selector de pestañas */}
        <div className="flex p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-muted)]">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); setParentalNotice(null); }}
            className={[
              'flex-1 py-2 rounded-lg text-xs font-display font-bold transition-all cursor-pointer',
              tab === 'login'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)]',
            ].join(' ')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setTab('registro-docente'); setError(null); setParentalNotice(null); }}
            className={[
              'flex-1 py-2 rounded-lg text-xs font-display font-bold transition-all cursor-pointer',
              tab === 'registro-docente'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)]',
            ].join(' ')}
          >
            Soy Docente
          </button>
          <button
            type="button"
            onClick={() => { setTab('registro-alumno'); setError(null); setParentalNotice(null); }}
            className={[
              'flex-1 py-2 rounded-lg text-xs font-display font-bold transition-all cursor-pointer',
              tab === 'registro-alumno'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)]',
            ].join(' ')}
          >
            Soy Alumno
          </button>
        </div>

        {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-[color-mix(in_oklch,var(--brand-emerald)_15%,var(--bg-panel))] border-2 border-[var(--brand-emerald)] text-[var(--brand-emerald)] text-xs font-semibold flex items-center gap-2 animate-fade-up">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {parentalNotice && (
          <div className="p-4 rounded-xl bg-[var(--bg-accent)] border-2 border-[var(--brand-gold)] text-[var(--text-primary)] text-xs leading-relaxed flex flex-col gap-2 animate-fade-up">
            <div className="flex items-center gap-2 font-display font-bold text-[var(--brand-gold)]">
              <ShieldCheck size={18} />
              <span>Aprobación Parental Requerida</span>
            </div>
            <p>{parentalNotice}</p>
          </div>
        )}

        {/* ── Formulario 1: Login Universal ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@unne.edu.ar"
                className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Contraseña
              </label>
              <input
                type="password"
                required
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" loading={isPending} className="mt-2 w-full justify-center">
              <LogIn size={16} />
              Ingresar al Aula
            </Button>
          </form>
        )}

        {/* ── Formulario 2: Autorregistro Docente ── */}
        {tab === 'registro-docente' && (
          <form onSubmit={handleRegistroDocente} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                disabled={isPending}
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Prof. Juan Pérez"
                className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Correo Institucional
              </label>
              <input
                type="email"
                required
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="docente@unne.edu.ar"
                className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Contraseña Segura
              </label>
              <input
                type="password"
                required
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" loading={isPending} className="mt-2 w-full justify-center">
              <BookOpen size={16} />
              Registrar Cuenta Docente
            </Button>
          </form>
        )}

        {/* ── Formulario 3: Registro Alumno con Código de Aula ── */}
        {tab === 'registro-alumno' && (
          <form onSubmit={handleRegistroAlumno} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Código de Invitación del Aula
              </label>
              <input
                type="text"
                required
                disabled={isPending}
                maxLength={10}
                value={codigoInvitacion}
                onChange={(e) => setCodigoInvitacion(e.target.value.toUpperCase())}
                placeholder="Ej: AR92K8X4"
                className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--brand-primary)] bg-[var(--bg-base)] text-[var(--text-primary)] font-display font-bold tracking-widest text-sm focus:border-[var(--brand-gold)] outline-none uppercase"
              />
              <span className="text-[11px] text-[var(--text-muted)]">
                Código de 8 caracteres provisto por tu docente
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                disabled={isPending}
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Joel Marcori"
                className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alumno@unne.edu.ar"
                className="px-3.5 py-2.5 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:border-[var(--brand-primary)] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  required
                  disabled={isPending}
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs focus:border-[var(--brand-primary)] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  disabled={isPending}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-3 py-2 rounded-xl border-2 border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)] text-xs focus:border-[var(--brand-primary)] outline-none"
                />
              </div>
            </div>

            {/* Campo condicional para menores de edad */}
            {esMenorDeEdad() && (
              <div className="p-3 rounded-xl bg-[var(--bg-accent)] border border-[var(--brand-gold)] flex flex-col gap-1.5 animate-scale-in">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-[var(--brand-gold)]">
                  Correo del Tutor / Padre / Madre (Requerido para menores de 18)
                </label>
                <input
                  type="email"
                  required
                  disabled={isPending}
                  value={emailTutor}
                  onChange={(e) => setEmailTutor(e.target.value)}
                  placeholder="tutor@gmail.com"
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--brand-gold)]"
                />
                <span className="text-[10px] text-[var(--text-muted)]">
                  Se enviará una notificación para la aprobación de tu cuenta por directivos.
                </span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={isPending} className="mt-2 w-full justify-center">
              <GraduationCap size={16} />
              Unirme al Aula
            </Button>
          </form>
        )}

        {/* ── Accesos de prueba rápidos ── */}
        <div className="pt-4 border-t border-[var(--border-muted)] flex flex-col gap-2">
          <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[var(--text-muted)] text-center">
            Acceso Rápido de Prueba (Seed)
          </span>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => fillDemoCredentials('Docente')}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-base)] hover:border-[var(--brand-primary)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              Docente
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('Alumno')}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-base)] hover:border-[var(--brand-gold)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              Alumno
            </button>
            <button
              type="button"
              onClick={() => fillDemoCredentials('Directivo')}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-base)] hover:border-[var(--brand-primary)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              Directivo
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthPage;
