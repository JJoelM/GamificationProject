import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Shield, Sparkles, BookOpen, Clock,
  ArrowRight, GraduationCap, Building2, Flame, FileUp,
  BrainCircuit, Zap, Compass, Lock, ShieldCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ThemeToggle from '../../components/layout/ThemeToggle';
import SoundToggle from '../../components/layout/SoundToggle';
import { playParchment } from '../../utils/audio';

/**
 * LandingPage — Portal principal de presentación, propuesta de valor y captación.
 * 
 * Estética Painterly RPG:
 * - Alto contraste, texturas sutiles, bordes táctiles estilizados.
 * - Enfoque multirrol: Docentes, Estudiantes y Directivos/Instituciones.
 * - Integración de arte conceptual oficial: personajes, criatura y logotipo.
 */
function LandingPage() {
  const navigate = useNavigate();
  const [rolActivo, setRolActivo] = useState('docentes'); // 'docentes' | 'alumnos' | 'instituciones'

  const handleIrAAuth = (tab = 'login') => {
    playParchment();
    navigate(`/auth?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors flex flex-col selection:bg-[var(--brand-primary)] selection:text-white">
      {/* ── 1. BARRA DE NAVEGACIÓN SUPERIOR ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-panel)]/90 border-b-2 border-[var(--border)] px-4 sm:px-8 py-3.5 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logotipo e Identidad */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] border-2 border-[var(--brand-primary)] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <img
                src="/images/landing/logo.png"
                alt="Logo Gamificación PFC"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-primary)] block leading-none">
                Aventuras <span className="text-[var(--brand-primary)]">del Saber</span>
              </span>
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[var(--text-muted)]">
                Plataforma de Gamificación Pedagógica
              </span>
            </div>
          </div>

          {/* Enlaces de Navegación Rápida (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-display font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            <a href="#para-quien" className="hover:text-[var(--brand-primary)] transition-colors">¿Para Quién?</a>
            <a href="#minijuegos" className="hover:text-[var(--brand-primary)] transition-colors">Minijuegos</a>
            <a href="#como-funciona" className="hover:text-[var(--brand-primary)] transition-colors">¿Cómo Funciona?</a>
            <a href="#seguridad-ia" className="hover:text-[var(--brand-primary)] transition-colors">IA Ética (HITL)</a>
          </nav>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SoundToggle />
            <ThemeToggle />
            
            <button
              type="button"
              onClick={() => handleIrAAuth('login')}
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border-2 border-[var(--border)] text-xs font-display font-bold text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-all cursor-pointer shadow-xs"
            >
              Iniciar Sesión
            </button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => handleIrAAuth('registro-docente')}
              className="cursor-pointer shadow-sm text-xs font-display font-bold"
            >
              <Sparkles size={13} className="text-[#FCD34D]" />
              <span>Comenzar Gratis</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION — PROPUESTA DE VALOR ÉPICA ── */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 border-b-2 border-[var(--border-muted)] bg-radial from-[color-mix(in_oklch,var(--brand-primary)_6%,var(--bg-base))] via-[var(--bg-base)] to-[var(--bg-base)]">
        {/* Decoraciones de fondo painterly */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[var(--brand-primary)]/10 via-[var(--brand-violet)]/10 to-[var(--brand-gold)]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Columna Izquierda: Mensaje y Conversión */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[color-mix(in_oklch,var(--brand-primary)_12%,var(--bg-panel))] border-2 border-[var(--brand-primary)]/50 self-center lg:self-start shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-emerald)] animate-pulse" />
              <span className="text-xs font-display font-bold tracking-wide text-[var(--brand-primary)]">
                Inteligencia Artificial Ética con Control Humano Total (HITL)
              </span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] tracking-tight leading-[1.08]">
              Transforma tu aula en un <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-violet)] to-[var(--brand-secondary)]">Reino de Aprendizaje</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Carga tus <strong>apuntes o PDFs</strong> y genera en segundos misiones pedagógicas interactivas: 
              combates contra criaturas conceptuales, líneas temporales forenses y quizzes inmersivos. 
              <strong> El docente siempre tiene la última palabra</strong> antes de activar cualquier contenido.
            </p>

            {/* CTAs Principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={() => handleIrAAuth('registro-docente')}
                className="w-full sm:w-auto text-sm sm:text-base font-display font-bold py-3.5 px-6 shadow-md cursor-pointer"
              >
                <Sparkles size={18} className="text-[#FCD34D]" />
                <span>Crear Cuenta de Docente</span>
                <ArrowRight size={16} />
              </Button>

              <button
                type="button"
                onClick={() => handleIrAAuth('registro-alumno')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[10px_14px_12px_12px] border-2 border-[var(--border)] bg-[var(--bg-panel)] hover:bg-[var(--bg-accent)] text-sm sm:text-base font-display font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-[2px_2px_0px_var(--border)]"
              >
                <GraduationCap size={18} className="text-[var(--brand-primary)]" />
                <span>Soy Alumno (Unirme a un Aula)</span>
              </button>
            </div>

            {/* Badges de Confianza y Arquitectura */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[var(--border-muted)] max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl text-[var(--brand-primary)]">100%</span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">Control Docente (HITL)</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl text-[var(--brand-emerald)]">0%</span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">Contenido Pay-to-Win</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl text-[var(--brand-violet)]">100%</span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">Auditable (Event Store)</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Escena Visual Painterly con Personajes Oficiales */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Marco táctil con sombra sólida y bisel */}
            <div className="relative w-full max-w-md rounded-[20px_28px_24px_24px] border-3 border-[var(--border)] bg-[var(--bg-panel)] p-5 shadow-[6px_6px_0px_var(--border)] overflow-hidden">
              {/* Etiqueta flotante */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-muted)] mb-4">
                <div className="flex items-center gap-2">
                  <Swords size={16} className="text-[var(--brand-crimson)]" />
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Enfrentamiento en Vivo: El Sofisma
                  </span>
                </div>
                <Badge variant="racha">Fase 2 de 4</Badge>
              </div>

              {/* Visualización del Jefe con fondo temático */}
              <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-[var(--border-muted)] bg-[var(--bg-base)] flex items-center justify-center">
                <img
                  src="/images/landing/criatura-hero.png"
                  alt="Criatura Jefe Pedagógico"
                  className="w-full h-full object-cover filter contrast-105 transform hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay de HP */}
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-[var(--bg-panel)]/95 border border-[var(--border)] backdrop-blur-xs flex flex-col gap-1 shadow-sm">
                  <div className="flex justify-between text-[11px] font-display font-bold">
                    <span className="text-[var(--brand-crimson)]">HP del Jefe: 50 / 100</span>
                    <span className="text-[var(--brand-emerald)]">Daño por acertar: 25 HP</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--brand-crimson)] to-[var(--brand-secondary)] w-1/2 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Tira de Personajes Jugables */}
              <div className="flex items-center justify-around pt-4 mt-2 border-t border-[var(--border-muted)]">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-xl border-2 border-[var(--brand-primary)] bg-[var(--bg-accent)] p-0.5 shadow-xs overflow-hidden">
                    <img src="/images/landing/guerrero.png" alt="Avatar Guerrero" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-display font-bold text-[var(--text-secondary)]">Guerrero</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-xl border-2 border-[var(--brand-violet)] bg-[var(--bg-accent)] p-0.5 shadow-xs overflow-hidden">
                    <img src="/images/landing/mago.png" alt="Avatar Mago" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-display font-bold text-[var(--text-secondary)]">Mago</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-xl border-2 border-[var(--brand-emerald)] bg-[var(--bg-accent)] p-0.5 shadow-xs overflow-hidden">
                    <img src="/images/landing/healer.png" alt="Avatar Sanadora" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-display font-bold text-[var(--text-secondary)]">Sanadora</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SECCIÓN: ¿A QUIÉNES LES ESTAMOS HABLANDO? (SEGMENTACIÓN POR ROL) ── */}
      <section id="para-quien" className="py-20 px-4 sm:px-8 border-b-2 border-[var(--border-muted)] bg-[var(--bg-panel)]">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-display font-bold uppercase tracking-widest text-[var(--brand-primary)]">
              Diseñado Para Cada Miembro de la Comunidad Educativa
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text-primary)]">
              ¿A Quién Está Dirigida la Plataforma?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              No es solo un juego ni una simple herramienta de preguntas. Es un ecosistema equilibrado que resuelve los desafíos reales de enseñar y aprender.
            </p>
          </div>

          {/* Selector de Rol Interactivo */}
          <div className="flex justify-center">
            <div className="flex p-1.5 rounded-2xl bg-[var(--bg-base)] border-2 border-[var(--border)] shadow-[var(--shadow-card)] gap-1">
              {[
                { id: 'docentes', label: 'Para Docentes', Icon: BookOpen, color: 'text-[var(--brand-primary)]' },
                { id: 'alumnos', label: 'Para Estudiantes', Icon: Swords, color: 'text-[var(--brand-secondary)]' },
                { id: 'instituciones', label: 'Directivos e Instituciones', Icon: Building2, color: 'text-[var(--brand-violet)]' },
              ].map((tab) => {
                const isSelected = rolActivo === tab.id;
                const Icon = tab.Icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playParchment();
                      setRolActivo(tab.id);
                    }}
                    className={[
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]',
                    ].join(' ')}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido Dinámico por Rol con Animación Framer Motion */}
          <AnimatePresence mode="wait">
            {rolActivo === 'docentes' && (
              <motion.div
                key="docentes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)] text-[var(--brand-primary)] flex items-center justify-center">
                    <FileUp size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Del PDF al Aula en Minutos
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Sube apuntes, libros o artículos curriculares en PDF. La extracción ocurre 100% en tu navegador (el archivo nunca sale de tu equipo) y Gemini redacta la narrativa lúdica correspondiente.
                  </p>
                </div>

                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-emerald)]/15 border border-[var(--brand-emerald)] text-[var(--brand-emerald)] flex items-center justify-center">
                    <BrainCircuit size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Control Editorial Absoluto (HITL)
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Ninguna pregunta se publica automáticamente. Dispones de un Inbox con editores dedicados para ajustar el daño, las opciones y la narrativa antes de que un alumno vea nada.
                  </p>
                </div>

                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-secondary)]/15 border border-[var(--brand-secondary)] text-[var(--brand-secondary)] flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Analítica y Mapa de Calor
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Identifica en tiempo real qué conceptos pedagógicos generaron más dificultad o confusión en el grupo, permitiéndote reforzar temas clave en la siguiente clase.
                  </p>
                </div>
              </motion.div>
            )}

            {rolActivo === 'alumnos' && (
              <motion.div
                key="alumnos"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-crimson)]/15 border border-[var(--brand-crimson)] text-[var(--brand-crimson)] flex items-center justify-center">
                    <Swords size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Aprender Jugando de Verdad
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Elige tu héroe (Guerrero, Mago, Arquera o Sanadora) y enfréntate a jefes conceptuales o investiga paradojas históricas con mecánicas tácticas y efectos visuales reactivos.
                  </p>
                </div>

                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-gold)]/15 border border-[var(--brand-gold)] text-[var(--brand-gold)] flex items-center justify-center">
                    <Flame size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Racha Protegida y Cero Frustración
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Si te trabas en una misión, puedes solicitar pistas didácticas adquiridas en el Bazar con tus puntos de aventura (AP), o usar escudos para cuidar tus días de racha consecutivos.
                  </p>
                </div>

                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-violet)]/15 border border-[var(--brand-violet)] text-[var(--brand-violet)] flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Grimorio del Saber Coleccionable
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Cada victoria desbloquea fichas arcanas con síntesis curriculares y datos destacados. Un compendio de conocimiento que sirve como guía de estudio permanente.
                  </p>
                </div>
              </motion.div>
            )}

            {rolActivo === 'instituciones' && (
              <motion.div
                key="instituciones"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-violet)]/15 border border-[var(--brand-violet)] text-[var(--brand-violet)] flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Auditoría Inmutable (Event Sourcing)
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Cada generación con IA, cada aprobación docente y cada intento estudiantil queda sellado en un registro de eventos inmutable (Event Store), garantizando trazabilidad académica total.
                  </p>
                </div>

                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)] text-[var(--brand-primary)] flex items-center justify-center">
                    <Lock size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Seguridad y Protección de Menores
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Flujo de consentimiento parental para estudiantes menores de 18 años, cookies seguras HttpOnly con SameSite=Strict y sanitización de respuestas en el servidor para evitar trampas por inspección.
                  </p>
                </div>

                <div className="p-6 rounded-[16px_20px_18px_18px] border-2 border-[var(--border)] bg-[var(--bg-base)] shadow-[3px_3px_0px_var(--border)] flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-emerald)]/15 border border-[var(--brand-emerald)] text-[var(--brand-emerald)] flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    Métricas Institucionales y Eficiencia
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Panel directivo con indicadores globales de actividad, retención y desempeño por aula, reduciendo el desgaste docente y elevando los estándares de aprendizaje.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 4. SHOWCASE DE LOS 3 FORMATOS DE MINIJUEGO ── */}
      <section id="minijuegos" className="py-20 px-4 sm:px-8 border-b-2 border-[var(--border-muted)] bg-[var(--bg-base)]">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-display font-bold uppercase tracking-widest text-[var(--brand-primary)]">
              Mecánicas Lúdicas Especializadas
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text-primary)]">
              Tres Formatos Diseñados para Aprender
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Diferentes contenidos requieren diferentes estímulos cognitivos. Elige el minijuego ideal para tu material curricular.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formato 1: Batalla de Jefe */}
            <div className="p-6 rounded-[18px_24px_20px_20px] border-2 border-[var(--brand-crimson)]/50 bg-[var(--bg-panel)] shadow-[4px_4px_0px_var(--brand-crimson)] flex flex-col justify-between gap-6 group hover:-translate-y-1 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-red-500/10 text-[var(--brand-crimson)] border border-red-500/30">
                    <Swords size={22} />
                  </span>
                  <Badge variant="racha">Combate Épico</Badge>
                </div>
                <h3 className="font-display font-extrabold text-xl text-[var(--text-primary)]">
                  Batalla de Jefe Táctica
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  El alumno combate por turnos contra una criatura que encarna los conceptos más difíciles. Cada fase acertada inflige daño al jefe (100 HP totales) con animaciones reactivas y penalizaciones visuales.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] flex items-center justify-between text-xs font-display">
                <span className="font-semibold text-[var(--text-muted)]">Regla pedagógica:</span>
                <span className="font-bold text-[var(--brand-emerald)]">≥ 70% daño = Victoria</span>
              </div>
            </div>

            {/* Formato 2: Línea Temporal Forense */}
            <div className="p-6 rounded-[18px_24px_20px_20px] border-2 border-[var(--brand-violet)]/50 bg-[var(--bg-panel)] shadow-[4px_4px_0px_var(--brand-violet)] flex flex-col justify-between gap-6 group hover:-translate-y-1 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-purple-500/10 text-[var(--brand-violet)] border border-purple-500/30">
                    <Clock size={22} />
                  </span>
                  <Badge variant="violet">Secuencia Forense</Badge>
                </div>
                <h3 className="font-display font-extrabold text-xl text-[var(--text-primary)]">
                  Línea Temporal Forense
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Ideal para historia, procesos científicos o algoritmos. El alumno reconstruye una cronología desordenada arrastrando tarjetas e identifica la causa raíz que provocó la anomalía temporal.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] flex items-center justify-between text-xs font-display">
                <span className="font-semibold text-[var(--text-muted)]">Interacción:</span>
                <span className="font-bold text-[var(--brand-violet)]">Drag & Drop + Layout Diff</span>
              </div>
            </div>

            {/* Formato 3: Opción Múltiple Estratégica */}
            <div className="p-6 rounded-[18px_24px_20px_20px] border-2 border-[var(--brand-primary)]/50 bg-[var(--bg-panel)] shadow-[4px_4px_0px_var(--brand-primary)] flex flex-col justify-between gap-6 group hover:-translate-y-1 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-blue-500/10 text-[var(--brand-primary)] border border-blue-500/30">
                    <Compass size={22} />
                  </span>
                  <Badge variant="info">Quiz Clásico</Badge>
                </div>
                <h3 className="font-display font-extrabold text-xl text-[var(--text-primary)]">
                  Quiz & Fichas del Saber
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Preguntas conceptuales directas con 4 opciones balanceadas. Integra uso de pistas didácticas para descartar opciones incorrectas y explicaciones pedagógicas tras cada resolución.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] flex items-center justify-between text-xs font-display">
                <span className="font-semibold text-[var(--text-muted)]">Recompensa:</span>
                <span className="font-bold text-[var(--brand-gold)]">Fichas de Grimorio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FLUJO: DEL PDF AL AULA EN 3 PASOS ── */}
      <section id="como-funciona" className="py-20 px-4 sm:px-8 border-b-2 border-[var(--border-muted)] bg-[var(--bg-panel)]">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-display font-bold uppercase tracking-widest text-[var(--brand-primary)]">
              Simplicidad y Eficiencia Docente
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--text-primary)]">
              Cómo Funciona en 3 Pasos
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Diseñado para integrarse en la rutina docente sin curvas de aprendizaje complejas ni sobrecargas técnicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Paso 1 */}
            <div className="flex flex-col gap-4 relative">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] text-white font-display font-extrabold text-lg flex items-center justify-center shadow-xs">
                  1
                </span>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                  Carga tus Apuntes o PDF
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Selecciona cualquier documento PDF o copia el contenido que deseas enseñar. Elige qué páginas extraer de forma interactiva directamente en tu navegador.
              </p>
              <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] text-[11px] text-[var(--text-muted)] font-display">
                🛡️ Privacidad: El archivo binario jamás se transmite por la red.
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col gap-4 relative">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--brand-violet)] text-white font-display font-extrabold text-lg flex items-center justify-center shadow-xs">
                  2
                </span>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                  La IA Diseña el Desafío
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Gemini procesa el texto delimitado, estructura la narrativa de aventura y genera preguntas contextuales respetando estrictamente el material provisto.
              </p>
              <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] text-[11px] text-[var(--text-muted)] font-display">
                ✨ Hasta 20.000 caracteres de contexto pedagógico.
              </div>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col gap-4 relative">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[var(--brand-emerald)] text-white font-display font-extrabold text-lg flex items-center justify-center shadow-xs">
                  3
                </span>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                  Calibra y Publica (HITL)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Revisa el borrador en tu Inbox. Edita preguntas, calibra los puntos de experiencia (XP) o prueba la vista previa de alumno antes de activar la misión con 1 clic.
              </p>
              <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-muted)] text-[11px] text-[var(--text-muted)] font-display">
                🎯 Publicación instantánea en el mapa curricular del aula.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. SECCIÓN: SEGURIDAD, AUDITORÍA Y ÉTICA (HITL) ── */}
      <section id="seguridad-ia" className="py-20 px-4 sm:px-8 border-b-2 border-[var(--border-muted)] bg-[var(--bg-base)]">
        <div className="max-w-5xl mx-auto rounded-[24px_32px_28px_28px] border-3 border-[var(--border)] bg-[var(--bg-panel)] p-8 sm:p-12 shadow-[6px_6px_0px_var(--border)] flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
            <ShieldCheck size={48} className="text-[var(--brand-primary)]" />
          </div>

          <div className="flex flex-col gap-3 text-center md:text-left">
            <Badge variant="correcto" className="self-center md:self-start">Garantía Pedagógica</Badge>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-primary)]">
              Por Qué Decimos "Inteligencia Artificial Ética"
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              En muchas plataformas, la IA genera y publica contenido sin mediación, exponiendo al alumnado a errores o sesgos. En <strong>Aventuras del Saber</strong>, la arquitectura tecnológica (CQRS + Event Sourcing) exige que cada línea de texto sea validada por un docente humano antes de ingresar al aula activa.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-xs font-display font-bold text-[var(--brand-primary)]">
              <span>✓ Cero alucinaciones en el aula</span>
              <span>✓ Trazabilidad pedagógica total</span>
              <span>✓ Privacidad de datos protegida</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CTA FINAL DE CONVERSIÓN ── */}
      <section className="py-20 px-4 sm:px-8 bg-gradient-to-b from-[var(--bg-panel)] to-[var(--bg-base)] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[color-mix(in_oklch,var(--brand-secondary)_15%,var(--bg-panel))] border-2 border-[var(--brand-secondary)] flex items-center justify-center shadow-md">
            <Sparkles size={32} className="text-[var(--brand-secondary)]" />
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
            ¿Listo para Transformar tu Aula en una Leyenda?
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Crea tu aula en menos de 2 minutos, comparte tu código con tus estudiantes y comienza a vivir una experiencia educativa inolvidable.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={() => handleIrAAuth('registro-docente')}
              className="w-full sm:flex-1 py-4 text-base font-display font-bold shadow-lg cursor-pointer"
            >
              <span>Empezar como Docente</span>
              <ArrowRight size={16} />
            </Button>

            <button
              type="button"
              onClick={() => handleIrAAuth('login')}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-[10px_14px_12px_12px] border-2 border-[var(--border)] bg-[var(--bg-panel)] hover:bg-[var(--bg-accent)] text-sm font-display font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs"
            >
              Ya tengo cuenta (Ingresar)
            </button>
          </div>
        </div>
      </section>

      {/* ── 8. FOOTER INSTITUCIONAL Y LEGAL ── */}
      <footer className="border-t-2 border-[var(--border)] bg-[var(--bg-panel)] py-10 px-4 sm:px-8 text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-1">
              <img src="/images/landing/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-[var(--text-primary)]">
                Aventuras del Saber
              </span>
              <p className="text-[11px] text-[var(--text-muted)]">
                Proyecto Final de Carrera (PFC) • Licenciatura en Sistemas de Información • FaCENA, UNNE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 font-display font-semibold text-xs text-[var(--text-muted)]">
            <a href="#para-quien" className="hover:text-[var(--brand-primary)]">Roles</a>
            <a href="#minijuegos" className="hover:text-[var(--brand-primary)]">Minijuegos</a>
            <a href="#seguridad-ia" className="hover:text-[var(--brand-primary)]">Ética HITL</a>
            <button
              type="button"
              onClick={() => handleIrAAuth('login')}
              className="hover:text-[var(--brand-primary)] cursor-pointer"
            >
              Acceso a la Plataforma
            </button>
          </div>

          <div className="text-[11px] text-[var(--text-muted)] text-center md:text-right">
            © 2026 Gamificación Educativa PFC. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
