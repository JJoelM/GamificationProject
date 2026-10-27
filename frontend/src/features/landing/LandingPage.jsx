import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Shield, Sparkles, BookOpen,
  ArrowRight, GraduationCap, Building2, Flame, FileUp,
  CheckCircle2, Trophy, Users, HeartHandshake
} from 'lucide-react';
import ThemeToggle from '../../components/layout/ThemeToggle';
import SoundToggle from '../../components/layout/SoundToggle';
import useSessionStore from '../../store/useSessionStore';
import { playParchment } from '../../utils/audio';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
  }),
};

function LandingPage() {
  const navigate = useNavigate();
  const [rolActivo, setRolActivo] = useState('docentes');
  const { theme } = useSessionStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleIrAAuth = (tab = 'login') => {
    playParchment();
    navigate(`/auth?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B131C] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200 flex flex-col overflow-x-hidden selection:bg-[#38BDF8] selection:text-[#0F172A]">
      {/* ── 1. BARRA DE NAVEGACIÓN RESPONSIVE ── */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 dark:bg-[#132232]/95 backdrop-blur-md border-b-3 border-[#0F172A] dark:border-[#38BDF8] px-3 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FEF3C7] border-3 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] dark:shadow-[3px_3px_0px_#38BDF8] flex items-center justify-center p-1.5 group-hover:-translate-y-0.5 transition-transform">
              <img
                src="/images/landing/logo.png"
                alt="Logo Aventuras del Saber"
                width="32"
                height="32"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-base sm:text-xl tracking-tight text-[#0F172A] dark:text-white block leading-none">
                Aventuras <span className="text-[#1D4ED8] dark:text-[#38BDF8]">del Saber</span>
              </span>
              <span className="hidden sm:block text-[11px] font-display font-bold uppercase tracking-widest text-[#581C87] dark:text-[#E9D5FF]">
                Tu Aula Convertida en Juego de Rol
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-display font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
            <a href="#minijuegos" className="hover:text-[#1D4ED8] dark:hover:text-[#38BDF8] transition-colors">Minijuegos</a>
            <a href="#como-funciona" className="hover:text-[#1D4ED8] dark:hover:text-[#38BDF8] transition-colors">Cómo Funciona</a>
            <a href="#comunidad" className="hover:text-[#1D4ED8] dark:hover:text-[#38BDF8] transition-colors">Para Quién Es</a>
            <a href="#confianza" className="hover:text-[#1D4ED8] dark:hover:text-[#38BDF8] transition-colors">Confianza</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <SoundToggle />
            <ThemeToggle />

            <button
              type="button"
              onClick={() => handleIrAAuth('login')}
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-xl border-2 border-[#0F172A] dark:border-[#38BDF8] bg-white dark:bg-[#0B131C] text-xs font-display font-extrabold text-[#0F172A] dark:text-white shadow-[2px_2px_0px_#0F172A] dark:shadow-[2px_2px_0px_#38BDF8] hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              Iniciar Sesión
            </button>

            <button
              type="button"
              onClick={() => handleIrAAuth('registro-docente')}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border-2 border-[#0F172A] bg-[#FCD34D] hover:bg-[#F59E0B] text-xs font-display font-extrabold text-[#0F172A] shadow-[3px_3px_0px_#0F172A] dark:shadow-[3px_3px_0px_#38BDF8] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Sparkles size={14} className="text-[#581C87] shrink-0" />
              <span>Empezar Gratis</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO COMERCIAL CON MAZO DE CARTAS ANIMADO ── */}
      <section className="relative overflow-hidden py-10 sm:py-14 lg:py-16 px-4 sm:px-8 border-b-3 border-[#0F172A] dark:border-[#38BDF8]/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Columna Izquierda: Propuesta de Valor Comercial */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="lg:col-span-7 flex flex-col gap-5 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E8FF] dark:bg-[#2E1065] border-2 border-[#0F172A] dark:border-[#E9D5FF] shadow-[3px_3px_0px_#0F172A] dark:shadow-[3px_3px_0px_#A78BFA] self-center lg:self-start">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669] dark:bg-[#34D399] animate-pulse" />
              <span className="text-xs font-display font-extrabold uppercase tracking-wider text-[#581C87] dark:text-[#F3E8FF]">
                Armá clases inolvidables en menos de 2 minutos
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-[54px] text-[#0F172A] dark:text-white tracking-tight leading-[1.08]">
              Convertí tus apuntes en{' '}
              <span className="inline-block px-3 py-0.5 rounded-xl bg-[#FEF3C7] text-[#78350F] border-3 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] dark:shadow-[4px_4px_0px_#FCD34D] -rotate-1">
                Aventuras Épicas
              </span>{' '}
              que tus alumnos quieren jugar
            </h1>

            <p className="text-base sm:text-lg text-[#1E293B] dark:text-[#E2E8F0] font-medium leading-snug max-w-xl mx-auto lg:mx-0">
              Subí cualquier PDF y transformalo al instante en batallas de jefes, misterios históricos y cartas coleccionables. <b>Vos revisás y aprobás todo</b> antes de que llegue al aula.
            </p>

            {/* CTAs Principales */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => handleIrAAuth('registro-docente')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl border-3 border-[#0F172A] dark:border-white bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-display font-extrabold text-base shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#38BDF8] hover:-translate-y-1 transition-all cursor-pointer"
              >
                <Sparkles size={18} className="text-[#FCD34D] shrink-0" />
                <span>Soy Docente · Crear Aula Gratis</span>
                <ArrowRight size={17} className="shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleIrAAuth('registro-alumno')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border-3 border-[#0F172A] dark:border-[#38BDF8] bg-white dark:bg-[#132232] hover:bg-[#E0ECFF] dark:hover:bg-[#1C334A] text-[#0F172A] dark:text-white font-display font-extrabold text-base shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#38BDF8] hover:-translate-y-1 transition-all cursor-pointer"
              >
                <GraduationCap size={19} className="text-[#581C87] dark:text-[#38BDF8] shrink-0" />
                <span>Soy Alumno · Tengo Código</span>
              </button>
            </div>

            {/* Tríada Visual con Conectores Animados */}
            <div className="pt-2">
              <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2 p-3 rounded-2xl bg-white dark:bg-[#132232] border-3 border-[#0F172A] dark:border-[#38BDF8] shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#020617] w-full sm:w-auto">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#E0ECFF] dark:bg-[#0F172A] border-2 border-[#0F172A] dark:border-[#38BDF8]">
                  <FileUp size={20} className="text-[#1D4ED8] dark:text-[#38BDF8] shrink-0" />
                  <div className="text-left">
                    <b className="block font-display text-xs text-[#0F172A] dark:text-white leading-tight">1. Subí tu PDF</b>
                    <span className="text-[11px] text-[#1E293B] dark:text-[#CBD5E1] font-medium">Tus apuntes de clase</span>
                  </div>
                </div>

                <svg className="hidden sm:block w-8 h-5 shrink-0" viewBox="0 0 34 20">
                  <path d="M2 10h24" stroke="currentColor" strokeWidth="3" strokeDasharray="5 4" className="text-[#581C87] dark:text-[#38BDF8] animate-dash-flow" />
                  <path d="M22 4l8 6-8 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" className="text-[#581C87] dark:text-[#38BDF8]" />
                </svg>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F3E8FF] dark:bg-[#0F172A] border-2 border-[#0F172A] dark:border-[#A78BFA]">
                  <CheckCircle2 size={20} className="text-[#581C87] dark:text-[#C4B5FD] shrink-0" />
                  <div className="text-left">
                    <b className="block font-display text-xs text-[#0F172A] dark:text-white leading-tight">2. Vos elegís</b>
                    <span className="text-[11px] text-[#1E293B] dark:text-[#CBD5E1] font-medium">Editás con 1 clic</span>
                  </div>
                </div>

                <svg className="hidden sm:block w-8 h-5 shrink-0" viewBox="0 0 34 20">
                  <path d="M2 10h24" stroke="currentColor" strokeWidth="3" strokeDasharray="5 4" className="text-[#B45309] dark:text-[#FCD34D] animate-dash-flow" />
                  <path d="M22 4l8 6-8 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" className="text-[#B45309] dark:text-[#FCD34D]" />
                </svg>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FEF3C7] dark:bg-[#0F172A] border-2 border-[#0F172A] dark:border-[#FCD34D]">
                  <Trophy size={20} className="text-[#92400E] dark:text-[#FCD34D] shrink-0" />
                  <div className="text-left">
                    <b className="block font-display text-xs text-[#0F172A] dark:text-white leading-tight">3. ¡A jugar!</b>
                    <span className="text-[11px] text-[#1E293B] dark:text-[#CBD5E1] font-medium">Ganan nivel y premios</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Mazo de Cartas RPG Animado + Jefe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="lg:col-span-5 flex items-center justify-center overflow-hidden py-2"
          >
            <div className="relative w-[310px] sm:w-[420px] h-[340px] sm:h-[420px] select-none shrink-0">
              {/* Pedestal circular */}
              <div className="absolute inset-x-4 top-4 bottom-4 rounded-full bg-[#E0ECFF] dark:bg-[#132232] border-3 border-dashed border-[#0F172A]/35 dark:border-[#38BDF8]/50" />

              {/* Carta 1: Guerrero */}
              <motion.div
                whileHover={{ y: -14, rotate: -5, scale: 1.04 }}
                className="absolute left-1 sm:left-3 top-8 w-[116px] sm:w-[154px] h-[166px] sm:h-[218px] rounded-2xl bg-[#0F172A] p-1.5 border-3 border-[#0F172A] dark:border-[#38BDF8] shadow-[5px_5px_0px_#0F172A] -rotate-11 transition-shadow z-10 cursor-pointer"
              >
                <img
                  src="/images/landing/guerrero.png"
                  alt="Carta Clase Guerrero"
                  width="154"
                  height="218"
                  className="w-full h-full object-cover object-[50%_18%] rounded-xl border-2 border-[#FCD34D]"
                />
                <span className="absolute bottom-2 inset-x-2 bg-[#0F172A]/95 text-[#FCD34D] font-display font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider text-center py-0.5 sm:py-1 rounded border border-[#FCD34D]">
                  Guerrero
                </span>
              </motion.div>

              {/* Carta 2: Sanadora */}
              <motion.div
                whileHover={{ y: -14, scale: 1.05 }}
                className="absolute left-1/2 -translate-x-1/2 top-0 w-[122px] sm:w-[164px] h-[174px] sm:h-[230px] rounded-2xl bg-[#0F172A] p-1.5 border-3 border-[#0F172A] dark:border-[#FCD34D] shadow-[5px_5px_0px_#581C87] transition-shadow z-20 cursor-pointer"
              >
                <img
                  src="/images/landing/healer.png"
                  alt="Carta Clase Sanadora"
                  width="164"
                  height="230"
                  className="w-full h-full object-cover object-[50%_20%] rounded-xl border-2 border-[#FCD34D]"
                />
                <span className="absolute bottom-2 inset-x-2 bg-[#0F172A]/95 text-[#FCD34D] font-display font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider text-center py-0.5 sm:py-1 rounded border border-[#FCD34D]">
                  Sanadora
                </span>
              </motion.div>

              {/* Carta 3: Arcanista */}
              <motion.div
                whileHover={{ y: -14, rotate: 5, scale: 1.04 }}
                className="absolute right-1 sm:right-3 top-8 w-[116px] sm:w-[154px] h-[166px] sm:h-[218px] rounded-2xl bg-[#0F172A] p-1.5 border-3 border-[#0F172A] dark:border-[#38BDF8] shadow-[5px_5px_0px_#0F172A] rotate-11 transition-shadow z-10 cursor-pointer"
              >
                <img
                  src="/images/landing/mago_postal.png"
                  alt="Carta Clase Arcanista"
                  width="154"
                  height="218"
                  className="w-full h-full object-cover object-[50%_18%] rounded-xl border-2 border-[#FCD34D]"
                />
                <span className="absolute bottom-2 inset-x-2 bg-[#0F172A]/95 text-[#FCD34D] font-display font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider text-center py-0.5 sm:py-1 rounded border border-[#FCD34D]">
                  Arcanista
                </span>
              </motion.div>

              {/* Jefe Cutout al frente con flotación suave y tamaño proporcionado */}
              <img
                src="/images/landing/jefe-cutout.png"
                alt="Jefe en Combate"
                fetchPriority="high"
                width="200"
                height="185"
                className="absolute left-1/2 -translate-x-1/2 bottom-7 w-[150px] sm:w-[195px] h-auto object-contain drop-shadow-[0_10px_0_rgba(15,23,42,0.32)] z-30 pointer-events-none animate-float"
              />

              {/* Placa inferior */}
              <div className="absolute bottom-0 inset-x-3 sm:inset-x-6 z-40 bg-[#0F172A] text-white border-3 border-[#FCD34D] rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-[4px_4px_0px_#0F172A] flex items-center justify-between">
                <span className="font-display font-extrabold text-[10px] sm:text-xs uppercase tracking-wider text-[#FCD34D]">
                  ★ Héroes · Jefes · Grimorio
                </span>
                <span className="text-[10px] sm:text-[11px] font-display font-bold text-[#38BDF8]">
                  Sin Pay-to-Win
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. MINIJUEGOS CON TABLEROS ANIMADOS (Y ESCENA DE JEFE CORREGIDA) ── */}
      <section id="minijuegos" className="py-14 sm:py-18 px-4 sm:px-8 border-b-3 border-[#0F172A] dark:border-[#38BDF8]/50 bg-white dark:bg-[#132232] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col gap-9">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col items-start gap-2">
              <span className="text-xs font-display font-extrabold uppercase tracking-widest text-[#581C87] dark:text-[#38BDF8]">
                Diversión con Propósito Pedagógico
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#0F172A] dark:text-white">
                Tres Formas de Aprender Jugando
              </h2>
              <div className="w-24 h-1.5 rounded-full bg-[#38BDF8]" />
            </div>
            <p className="text-sm sm:text-base text-[#1E293B] dark:text-[#E2E8F0] font-medium max-w-md">
              Elegí el formato ideal según el tema del día: desde repaso veloz hasta combates por turnos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* Minijuego 1: Batalla de Jefe (Fondo separado + Jefe contenido y animado) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0}
              variants={fadeUpVariant}
              className="rounded-2xl border-3 border-[#0F172A] dark:border-[#FCD34D] bg-[#F8FAFC] dark:bg-[#0B131C] p-5 shadow-[6px_6px_0px_#D97706] flex flex-col justify-between gap-4 hover:-translate-y-1.5 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display font-extrabold uppercase tracking-wider text-[#B45309] dark:text-[#FCD34D]">
                    Combate por Turnos
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-display font-extrabold bg-[#FEF3C7] text-[#78350F] border-2 border-[#0F172A]">
                    Favorito del Aula
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-[#0F172A] dark:text-white mb-3">
                  Batalla de Jefe
                </h3>

                {/* Escenario de Batalla contenido sin desborde */}
                <div className="relative h-48 rounded-xl border-2 border-[#0F172A] dark:border-[#FCD34D] overflow-hidden bg-[#1E1B4B]">
                  <img
                    src="/images/bosses/fondo-sin-sombra-criatura.png"
                    alt="Arena de Batalla"
                    loading="lazy"
                    width="360"
                    height="192"
                    className="w-full h-full object-cover"
                  />

                  {/* Barras de HP superiores */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-3">
                    <div className="flex-1 bg-[#0F172A]/90 border-2 border-[#0F172A] rounded-lg p-1">
                      <div className="flex justify-between text-[9px] font-display font-extrabold text-white px-1 mb-0.5">
                        <span>HÉROE</span>
                        <span className="text-[#34D399]">100%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                        <div className="w-full h-full bg-[#10B981]" />
                      </div>
                    </div>

                    <div className="flex-1 bg-[#0F172A]/90 border-2 border-[#0F172A] rounded-lg p-1">
                      <div className="flex justify-between text-[9px] font-display font-extrabold text-white px-1 mb-0.5">
                        <span>JEFE</span>
                        <span className="text-[#FCA5A5]">-25 HP</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                        <div className="h-full bg-[#EF4444] animate-hp-drain" />
                      </div>
                    </div>
                  </div>

                  {/* Chispa de daño animada */}
                  <div className="absolute top-12 right-28 z-30 px-2 py-0.5 rounded-md bg-[#FEF3C7] border-2 border-[#0F172A] text-[10px] font-display font-extrabold text-[#991B1B] shadow-[2px_2px_0px_#0F172A] animate-spark-pop">
                    💥 -25 HP
                  </div>

                  {/* Personaje del alumno (Izquierda, dentro del cuadro) */}
                  <img
                    src="/images/landing/mago-cutout.png"
                    alt="Mago en combate"
                    loading="lazy"
                    width="96"
                    height="108"
                    className="absolute bottom-0 left-3 h-[106px] w-auto object-contain drop-shadow-[2px_3px_0_#0F172A] z-10 animate-hero-attack"
                  />

                  {/* Criatura Jefe (Derecha, contenida debajo de las barras de vida) */}
                  <img
                    src="/images/landing/jefe-cutout.png"
                    alt="Criatura Jefe"
                    loading="lazy"
                    width="116"
                    height="112"
                    className="absolute bottom-1.5 right-3 h-[112px] w-auto object-contain drop-shadow-[2px_4px_0_#0F172A] z-10 animate-boss-combat"
                  />
                </div>
              </div>

              <p className="text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                Los temas difíciles se convierten en un jefe final. Cada respuesta correcta le quita vida con efectos de combate.
              </p>
            </motion.div>

            {/* Minijuego 2: Línea Temporal (Tarjetas con animación de intercambio) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={1}
              variants={fadeUpVariant}
              className="rounded-2xl border-3 border-[#0F172A] dark:border-[#C4B5FD] bg-[#F8FAFC] dark:bg-[#0B131C] p-5 shadow-[6px_6px_0px_#581C87] dark:shadow-[6px_6px_0px_#7C3AED] flex flex-col justify-between gap-4 hover:-translate-y-1.5 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display font-extrabold uppercase tracking-wider text-[#581C87] dark:text-[#C4B5FD]">
                    Secuencia e Investigación
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-display font-extrabold bg-[#F3E8FF] text-[#4C1D95] border-2 border-[#0F172A]">
                    Arrastrar y Ordenar
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-[#0F172A] dark:text-white mb-3">
                  Línea Temporal
                </h3>

                <div className="h-48 rounded-xl border-2 border-[#0F172A] dark:border-[#C4B5FD] bg-[#F3E8FF] dark:bg-[#1E1B4B] p-3 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between bg-white dark:bg-[#0F172A] border-2 border-[#0F172A] dark:border-[#38BDF8] rounded-lg px-3 py-2 text-xs font-display font-bold text-[#0F172A] dark:text-white shadow-[2px_2px_0px_#0F172A] animate-tl-swap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FCD34D] text-[#0F172A] border border-[#0F172A] grid place-items-center text-[11px] font-extrabold">1</span>
                      <span>Causas del Conflicto</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#334155] dark:text-[#38BDF8]">⇅ Mover</span>
                  </div>

                  <div className="flex items-center justify-between bg-[#FEF3C7] border-2 border-[#0F172A] rounded-lg px-3 py-2 text-xs font-display font-extrabold text-[#78350F] shadow-[2px_2px_0px_#0F172A] animate-tl-swap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#D97706] text-white border border-[#0F172A] grid place-items-center text-[11px]">2</span>
                      <span>Hecho Detonante</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#0F172A] text-[#FCD34D] text-[10px]">¡Descubierto!</span>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-[#0F172A] border-2 border-[#0F172A] dark:border-[#38BDF8] rounded-lg px-3 py-2 text-xs font-display font-bold text-[#0F172A] dark:text-white shadow-[2px_2px_0px_#0F172A]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FCD34D] text-[#0F172A] border border-[#0F172A] grid place-items-center text-[11px] font-extrabold">3</span>
                      <span>Firma del Tratado</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#334155] dark:text-[#38BDF8]">⇅ Mover</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                Ideal para historia, ciencias o procesos: ordenan los pasos arrastrando tarjetas y descubren el evento clave.
              </p>
            </motion.div>

            {/* Minijuego 3: Trivia & Grimorio */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={2}
              variants={fadeUpVariant}
              className="rounded-2xl border-3 border-[#0F172A] dark:border-[#38BDF8] bg-[#F8FAFC] dark:bg-[#0B131C] p-5 shadow-[6px_6px_0px_#2563EB] flex flex-col justify-between gap-4 hover:-translate-y-1.5 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display font-extrabold uppercase tracking-wider text-[#1D4ED8] dark:text-[#38BDF8]">
                    Desafío Rápido
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-display font-extrabold bg-[#E0ECFF] text-[#1E3A8A] border-2 border-[#0F172A]">
                    Destraba Cartas
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-[#0F172A] dark:text-white mb-3">
                  Trivia & Grimorio
                </h3>

                <div className="h-48 rounded-xl border-2 border-[#0F172A] dark:border-[#38BDF8] bg-[#E0ECFF] dark:bg-[#132232] p-3 flex flex-col justify-between">
                  <div className="bg-white dark:bg-[#0F172A] border-2 border-[#0F172A] dark:border-[#38BDF8] rounded-lg px-3 py-1.5 font-display font-bold text-xs text-[#0F172A] dark:text-white">
                    ¿Qué órgano bombea sangre al cuerpo?
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 bg-white dark:bg-[#0F172A] border-2 border-[#0F172A] dark:border-[#475569] rounded-lg px-2.5 py-1 text-xs font-bold text-[#0F172A] dark:text-white">
                      <span className="w-5 h-5 rounded bg-[#E0ECFF] text-[#1E3A8A] border border-[#0F172A] grid place-items-center text-[11px] font-extrabold">A</span>
                      <span>Pulmones</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#D1FAE5] border-2 border-[#0F172A] rounded-lg px-2.5 py-1 text-xs font-extrabold text-[#065F46] shadow-[2px_2px_0px_#0F172A] animate-trivia-pick">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[#059669] text-white border border-[#0F172A] grid place-items-center text-[11px]">B</span>
                        <span>Corazón</span>
                      </div>
                      <span>✓ +50 XP</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-[#0F172A] border-2 border-[#0F172A] dark:border-[#475569] rounded-lg px-2.5 py-1 text-xs font-bold text-[#0F172A] dark:text-white">
                      <span className="w-5 h-5 rounded bg-[#E0ECFF] text-[#1E3A8A] border border-[#0F172A] grid place-items-center text-[11px] font-extrabold">C</span>
                      <span>Hígado</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                Preguntas ágiles con pistas didácticas y desbloqueo de cartas coleccionables para estudiar antes del examen.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. CÓMO FUNCIONA (4 PASOS ILUSTRADOS CON ALTO CONTRASTE EN AMBOS MODOS) ── */}
      <section id="como-funciona" className="py-14 sm:py-18 px-4 sm:px-8 border-b-3 border-[#0F172A] dark:border-[#38BDF8]/50 bg-[#F8FAFC] dark:bg-[#0B131C] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col gap-9">
          <div className="flex flex-col items-start gap-2">
            <span className="text-xs font-display font-extrabold uppercase tracking-widest text-[#1D4ED8] dark:text-[#38BDF8]">
              Ahorrá Horas de Planificación
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#0F172A] dark:text-white">
              De tus Apuntes al Juego en 4 Pasos
            </h2>
            <div className="w-24 h-1.5 rounded-full bg-[#38BDF8]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Paso 1 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0}
              variants={fadeUpVariant}
              className="rounded-2xl border-3 border-[#0F172A] dark:border-[#38BDF8] bg-white dark:bg-[#132232] p-5 shadow-[5px_5px_0px_#2563EB] flex flex-col justify-between gap-4 hover:-translate-y-1 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#FCD34D] border-2 border-[#0F172A] font-display font-extrabold text-sm text-[#0F172A] grid place-items-center shadow-[2px_2px_0px_#0F172A]">1</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E0ECFF] text-[#1E3A8A] border-2 border-[#0F172A] text-[11px] font-display font-extrabold">Privado y Veloz</span>
                </div>
                <div className="rounded-xl bg-[#F1F5F9] border-2 border-[#0F172A] p-2 mb-3">
                  <svg viewBox="0 0 220 76" className="w-full h-18">
                    <g transform="translate(22,4)">
                      <path d="M0 0h38l14 14v52H0z" fill="#fff" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
                      <text x="26" y="46" textAnchor="middle" fontWeight="800" fontSize="14" fill="#DC2626">PDF</text>
                    </g>
                    <path d="M88 36h44" stroke="#1D4ED8" strokeWidth="3" strokeDasharray="6 4" className="animate-dash-flow" />
                    <path d="M128 29l9 7-9 7" stroke="#1D4ED8" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <g transform="translate(148,14)">
                      <rect width="50" height="44" rx="6" fill="#E0ECFF" stroke="#0F172A" strokeWidth="3" />
                      <path d="M8 13h34M8 22h34M8 31h22" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>
                <h3 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mb-1">
                  Elegí tu PDF o Apunte
                </h3>
                <p className="text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                  Seleccionás qué páginas querés trabajar directamente desde tu computadora.
                </p>
              </div>
            </motion.div>

            {/* Paso 2 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={1}
              variants={fadeUpVariant}
              className="rounded-2xl border-3 border-[#0F172A] dark:border-[#FCD34D] bg-white dark:bg-[#132232] p-5 shadow-[5px_5px_0px_#D97706] flex flex-col justify-between gap-4 hover:-translate-y-1 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#FCD34D] border-2 border-[#0F172A] font-display font-extrabold text-sm text-[#0F172A] grid place-items-center shadow-[2px_2px_0px_#0F172A]">2</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#78350F] border-2 border-[#0F172A] text-[11px] font-display font-extrabold">En Segundos</span>
                </div>
                <div className="rounded-xl bg-[#F1F5F9] border-2 border-[#0F172A] p-2 mb-3">
                  <svg viewBox="0 0 220 76" className="w-full h-18">
                    <rect x="16" y="10" width="102" height="56" rx="10" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3" />
                    <text x="67" y="35" textAnchor="middle" fontWeight="800" fontSize="13.5" fill="#78350F">Asistente IA</text>
                    <text x="67" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F172A">Borrador listo</text>
                    <path d="M124 38h32" stroke="#B45309" strokeWidth="3" strokeDasharray="6 4" className="animate-dash-flow" />
                    <g transform="translate(164,16)">
                      <path d="M22 0l5 16 16 5-16 5-5 16-5-16L1 21l16-5z" fill="#FCD34D" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round" className="animate-star-spin" />
                    </g>
                  </svg>
                </div>
                <h3 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mb-1">
                  La IA Arma el Desafío
                </h3>
                <p className="text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                  Genera preguntas, historia del jefe y cartas de resumen basadas solo en tu texto.
                </p>
              </div>
            </motion.div>

            {/* Paso 3 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={2}
              variants={fadeUpVariant}
              className="rounded-2xl border-3 border-[#0F172A] dark:border-[#C4B5FD] bg-white dark:bg-[#132232] p-5 shadow-[5px_5px_0px_#581C87] dark:shadow-[5px_5px_0px_#7C3AED] flex flex-col justify-between gap-4 hover:-translate-y-1 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#FCD34D] border-2 border-[#0F172A] font-display font-extrabold text-sm text-[#0F172A] grid place-items-center shadow-[2px_2px_0px_#0F172A]">3</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F3E8FF] text-[#4C1D95] border-2 border-[#0F172A] text-[11px] font-display font-extrabold">Tu Sello Docente</span>
                </div>
                <div className="rounded-xl bg-[#F1F5F9] border-2 border-[#0F172A] p-2 mb-3">
                  <svg viewBox="0 0 220 76" className="w-full h-18">
                    <rect x="16" y="18" width="88" height="40" rx="8" fill="#D1FAE5" stroke="#0F172A" strokeWidth="3" />
                    <text x="60" y="43" textAnchor="middle" fontWeight="800" fontSize="13" fill="#065F46">✓ Aprobar</text>
                    <rect x="116" y="18" width="88" height="40" rx="8" fill="#E0ECFF" stroke="#0F172A" strokeWidth="3" />
                    <text x="160" y="43" textAnchor="middle" fontWeight="800" fontSize="13" fill="#1E3A8A">✎ Editar</text>
                  </svg>
                </div>
                <h3 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mb-1">
                  Revisás y Publicás
                </h3>
                <p className="text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                  Cambiá cualquier consigna, ajustá los puntos de recompensa y activá la misión con un clic.
                </p>
              </div>
            </motion.div>

            {/* Paso 4 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={3}
              variants={fadeUpVariant}
              className="rounded-2xl border-3 border-[#0F172A] dark:border-[#34D399] bg-white dark:bg-[#132232] p-5 shadow-[5px_5px_0px_#059669] flex flex-col justify-between gap-4 hover:-translate-y-1 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#FCD34D] border-2 border-[#0F172A] font-display font-extrabold text-sm text-[#0F172A] grid place-items-center shadow-[2px_2px_0px_#0F172A]">4</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] border-2 border-[#0F172A] text-[11px] font-display font-extrabold">Resultados en Vivo</span>
                </div>
                <div className="rounded-xl bg-[#F1F5F9] border-2 border-[#0F172A] p-2 mb-3">
                  <svg viewBox="0 0 220 76" className="w-full h-18">
                    <rect x="24" y="42" width="28" height="24" rx="4" fill="#E0ECFF" stroke="#0F172A" strokeWidth="2.5" />
                    <rect x="64" y="26" width="28" height="40" rx="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="2.5" />
                    <rect x="104" y="12" width="28" height="54" rx="4" fill="#059669" stroke="#0F172A" strokeWidth="2.5" />
                    <circle cx="172" cy="38" r="22" fill="#FCD34D" stroke="#0F172A" strokeWidth="3" />
                    <text x="172" y="43" textAnchor="middle" fontWeight="800" fontSize="13" fill="#0F172A">+XP</text>
                  </svg>
                </div>
                <h3 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mb-1">
                  Seguí el Progreso Real
                </h3>
                <p className="text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                  Tus alumnos ganan experiencia mientras vos ves qué temas entendieron mejor.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. ROLES / COMUNIDAD CON ESCENAS ILUSTRADAS Y ESQUEMAS VISUALES ── */}
      <section id="comunidad" className="py-14 sm:py-18 px-4 sm:px-8 border-b-3 border-[#0F172A] dark:border-[#38BDF8]/50 bg-white dark:bg-[#132232] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col gap-9">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="flex flex-col items-start gap-2">
              <span className="text-xs font-display font-extrabold uppercase tracking-widest text-[#581C87] dark:text-[#38BDF8]">
                Una Plataforma para Toda la Comunidad
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#0F172A] dark:text-white">
                Pensado para Docentes, Alumnos y Colegios
              </h2>
              <div className="w-24 h-1.5 rounded-full bg-[#38BDF8]" />
            </div>

            {/* Selector de Rol Táctil Responsive */}
            <div className="grid grid-cols-3 sm:inline-flex p-1.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0B131C] border-3 border-[#0F172A] dark:border-[#38BDF8] shadow-[4px_4px_0px_#0F172A] dark:shadow-[4px_4px_0px_#020617] gap-1.5 w-full sm:w-auto">
              {[
                { id: 'docentes', label: 'Docentes', Icon: BookOpen },
                { id: 'alumnos', label: 'Estudiantes', Icon: Swords },
                { id: 'instituciones', label: 'Colegios', Icon: Building2 },
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
                      'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-extrabold transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#0F172A] text-[#FCD34D] dark:bg-[#38BDF8] dark:text-[#0F172A] shadow-[2px_2px_0px_#581C87]'
                        : 'text-[#1E293B] dark:text-[#E2E8F0] hover:bg-[#E0ECFF] dark:hover:bg-[#1C334A]',
                    ].join(' ')}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* VISTA 1: DOCENTES */}
            {rolActivo === 'docentes' && (
              <motion.div
                key="docentes"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch"
              >
                {/* Escena Ilustrada del Docente */}
                <div className="lg:col-span-5 rounded-2xl border-3 border-[#0F172A] dark:border-[#38BDF8] bg-[#E0ECFF] dark:bg-[#172A45] p-5 shadow-[6px_6px_0px_#0F172A] dark:shadow-[6px_6px_0px_#38BDF8] flex flex-col justify-between gap-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-white text-[#0F172A] border-2 border-[#0F172A] font-display font-extrabold text-[11px] uppercase tracking-wider mb-2">
                      Para Docentes
                    </span>
                    <h3 className="font-display font-extrabold text-2xl text-[#0F172A] dark:text-white leading-tight">
                      Menos tiempo corrigiendo, más tiempo enseñando
                    </h3>
                  </div>

                  {/* Composición visual: Carta Sanadora + Panel de Control Docente */}
                  <div className="grid grid-cols-12 gap-3 items-center bg-white dark:bg-[#0B131C] rounded-2xl border-3 border-[#0F172A] dark:border-[#38BDF8] p-3.5 shadow-[4px_4px_0px_#0F172A]">
                    <div className="col-span-5">
                      <div className="relative rounded-xl bg-[#0F172A] p-1 border-2 border-[#0F172A] shadow-[3px_3px_0px_#581C87]">
                        <img
                          src="/images/landing/healer.png"
                          alt="Guía Docente"
                          loading="lazy"
                          width="140"
                          height="180"
                          className="w-full h-36 object-cover object-[50%_18%] rounded-lg border border-[#FCD34D]"
                        />
                        <span className="block text-center text-[9px] font-display font-extrabold uppercase text-[#FCD34D] pt-1">
                          Mentora del Aula
                        </span>
                      </div>
                    </div>

                    {/* Esquema Visual del Panel Docente */}
                    <div className="col-span-7 flex flex-col gap-2.5">
                      <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#132232] border-2 border-[#0F172A] dark:border-[#475569] p-2.5">
                        <span className="text-[10px] font-display font-extrabold uppercase text-[#581C87] dark:text-[#38BDF8] block">
                          Borrador sugerido
                        </span>
                        <b className="text-xs font-display text-[#0F172A] dark:text-white block truncate">
                          Misión: Célula Eucariota
                        </b>
                        <div className="flex gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded bg-[#D1FAE5] border border-[#0F172A] text-[10px] font-extrabold text-[#065F46]">
                            ✓ Publicar
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#0F172A] text-[10px] font-extrabold text-[#78350F]">
                            ✎ Editar
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#F8FAFC] dark:bg-[#132232] border-2 border-[#0F172A] dark:border-[#475569] p-2.5">
                        <div className="flex justify-between text-[10px] font-display font-extrabold text-[#0F172A] dark:text-white mb-1">
                          <span>Comprensión del Curso</span>
                          <span className="text-[#059669] dark:text-[#34D399]">88%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] dark:bg-[#0B131C] border border-[#0F172A] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '88%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-[#059669]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleIrAAuth('registro-docente')}
                    className="w-full py-3 rounded-xl border-2 border-[#0F172A] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-display font-extrabold text-sm shadow-[3px_3px_0px_#0F172A] cursor-pointer"
                  >
                    Crear mi Primera Aula Gratis →
                  </button>
                </div>

                {/* 3 Tarjetas con Esquemas Visuales de Alto Contraste */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#38BDF8] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#38BDF8] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="rounded-xl border-2 border-[#0F172A] bg-[#E0ECFF] p-3 flex items-center justify-center h-28">
                      <svg viewBox="0 0 160 80" className="w-full h-full">
                        <rect x="10" y="12" width="44" height="56" rx="6" fill="#fff" stroke="#0F172A" strokeWidth="3" />
                        <text x="32" y="45" textAnchor="middle" fontWeight="800" fontSize="13" fill="#DC2626">PDF</text>
                        <path d="M62 40h32" stroke="#0F172A" strokeWidth="3" strokeDasharray="5 4" className="animate-dash-flow" />
                        <rect x="102" y="14" width="48" height="52" rx="8" fill="#FCD34D" stroke="#0F172A" strokeWidth="3" />
                        <text x="126" y="38" textAnchor="middle" fontWeight="800" fontSize="11" fill="#0F172A">Misión</text>
                        <text x="126" y="52" textAnchor="middle" fontWeight="800" fontSize="10" fill="#78350F">+100 XP</text>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#1D4ED8] dark:text-[#38BDF8]">Ahorro de Tiempo</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Actividades en 1 Clic
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Olvidate de redactar decenas de preguntas a mano: subís el material y el borrador queda listo.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#38BDF8] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#38BDF8] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="rounded-xl border-2 border-[#0F172A] bg-[#F3E8FF] p-3 flex items-center justify-center h-28">
                      <svg viewBox="0 0 160 80" className="w-full h-full">
                        <rect x="14" y="14" width="132" height="24" rx="6" fill="#fff" stroke="#0F172A" strokeWidth="2.5" />
                        <text x="80" y="30" textAnchor="middle" fontWeight="800" fontSize="11" fill="#4C1D95">¿Validar consigna?</text>
                        <rect x="22" y="46" width="54" height="22" rx="6" fill="#D1FAE5" stroke="#0F172A" strokeWidth="2.5" />
                        <text x="49" y="61" textAnchor="middle" fontWeight="800" fontSize="10" fill="#065F46">✓ Sí</text>
                        <rect x="84" y="46" width="54" height="22" rx="6" fill="#FEF3C7" stroke="#0F172A" strokeWidth="2.5" />
                        <text x="111" y="61" textAnchor="middle" fontWeight="800" fontSize="10" fill="#78350F">✎ Editar</text>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#581C87] dark:text-[#C4B5FD]">Autoridad Docente</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Vos Tenés la Última Palabra
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Ninguna actividad se publica sola: podés modificar opciones, cambiar puntajes o descartarla.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#38BDF8] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#38BDF8] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="rounded-xl border-2 border-[#0F172A] bg-[#FEF3C7] p-3 flex items-center justify-center h-28">
                      <svg viewBox="0 0 160 80" className="w-full h-full">
                        <rect x="20" y="44" width="24" height="24" rx="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="2.5" />
                        <rect x="54" y="28" width="24" height="40" rx="4" fill="#059669" stroke="#0F172A" strokeWidth="2.5" />
                        <rect x="88" y="16" width="24" height="52" rx="4" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" />
                        <circle cx="134" cy="32" r="14" fill="#FEE2E2" stroke="#0F172A" strokeWidth="2.5" />
                        <text x="134" y="36" textAnchor="middle" fontWeight="800" fontSize="12" fill="#991B1B">!</text>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#B45309] dark:text-[#FCD34D]">Diagnóstico Real</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Detectá Dudas a Tiempo
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Mirá en tu tablero qué preguntas costaron más intentos para reforzarlas en la próxima clase.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VISTA 2: ESTUDIANTES */}
            {rolActivo === 'alumnos' && (
              <motion.div
                key="alumnos"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch"
              >
                {/* Escena Ilustrada del Estudiante */}
                <div className="lg:col-span-5 rounded-2xl border-3 border-[#0F172A] dark:border-[#FCD34D] bg-[#FEF3C7] dark:bg-[#261C0A] p-5 shadow-[6px_6px_0px_#0F172A] dark:shadow-[6px_6px_0px_#FCD34D] flex flex-col justify-between gap-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-white text-[#0F172A] border-2 border-[#0F172A] font-display font-extrabold text-[11px] uppercase tracking-wider mb-2">
                      Para Estudiantes
                    </span>
                    <h3 className="font-display font-extrabold text-2xl text-[#0F172A] dark:text-white leading-tight">
                      Elegí tu héroe, subí de nivel y coleccioná el Grimorio
                    </h3>
                  </div>

                  {/* Mini Vitrina de Héroes y Progresión */}
                  <div className="bg-white dark:bg-[#0B131C] rounded-2xl border-3 border-[#0F172A] dark:border-[#FCD34D] p-3.5 shadow-[4px_4px_0px_#0F172A] flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { img: '/images/landing/guerrero.png', name: 'Guerrero' },
                        { img: '/images/landing/healer.png', name: 'Sanadora' },
                        { img: '/images/landing/mago_postal.png', name: 'Arcanista' },
                      ].map((h) => (
                        <div key={h.name} className="rounded-xl bg-[#0F172A] p-1 border-2 border-[#0F172A] shadow-[2px_2px_0px_#D97706] hover:-translate-y-1 transition-transform">
                          <img
                            src={h.img}
                            alt={h.name}
                            loading="lazy"
                            width="100"
                            height="120"
                            className="w-full h-24 object-cover object-[50%_18%] rounded-lg border border-[#FCD34D]"
                          />
                          <span className="block text-center text-[9px] font-display font-extrabold uppercase text-[#FCD34D] pt-1">
                            {h.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#132232] border-2 border-[#0F172A] dark:border-[#475569] text-xs font-display font-extrabold">
                      <span className="text-[#B45309] dark:text-[#FCD34D] flex items-center gap-1">
                        <Flame size={15} /> Racha: 14 días
                      </span>
                      <span className="text-[#581C87] dark:text-[#38BDF8]">Nivel 12 · Erudito</span>
                      <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] border border-[#0F172A]">
                        +450 AP
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleIrAAuth('registro-alumno')}
                    className="w-full py-3 rounded-xl border-2 border-[#0F172A] bg-[#0F172A] dark:bg-[#FCD34D] hover:bg-[#1E293B] dark:hover:bg-[#F59E0B] text-[#FCD34D] dark:text-[#0F172A] font-display font-extrabold text-sm shadow-[3px_3px_0px_#D97706] dark:shadow-[3px_3px_0px_#020617] cursor-pointer"
                  >
                    Unirme a mi Aula con Código →
                  </button>
                </div>

                {/* 3 Tarjetas con Esquemas Visuales para Estudiantes */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#FCD34D] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#FCD34D] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="relative rounded-xl border-2 border-[#0F172A] bg-[#1E1B4B] p-2 flex items-center justify-center h-28 overflow-hidden">
                      <img
                        src="/images/bosses/fondo-sin-sombra-criatura.png"
                        alt=""
                        loading="lazy"
                        width="180"
                        height="112"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                      <img
                        src="/images/landing/jefe-cutout.png"
                        alt="Jefe"
                        loading="lazy"
                        width="92"
                        height="86"
                        className="relative z-10 h-22 w-auto object-contain drop-shadow-[2px_3px_0_#0F172A] animate-float"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#B45309] dark:text-[#FCD34D]">Acción en Clase</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Estudiar es una Misión
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Derrotá criaturas y resolvé enigmas históricos para ganar experiencia y subir de rango.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#FCD34D] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#FCD34D] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="rounded-xl border-2 border-[#0F172A] bg-[#E0ECFF] p-3 flex items-center justify-center h-28">
                      <svg viewBox="0 0 160 80" className="w-full h-full">
                        <path d="M46 10l26 10v18c0 16-11 26-26 32-15-6-26-16-26-32V20z" fill="#FCD34D" stroke="#0F172A" strokeWidth="3" />
                        <text x="46" y="45" textAnchor="middle" fontWeight="800" fontSize="11" fill="#0F172A">Escudo</text>
                        <rect x="84" y="20" width="62" height="40" rx="8" fill="#fff" stroke="#0F172A" strokeWidth="3" />
                        <text x="115" y="38" textAnchor="middle" fontWeight="800" fontSize="11" fill="#1D4ED8">💡 Pista</text>
                        <text x="115" y="52" textAnchor="middle" fontWeight="800" fontSize="9.5" fill="#0F172A">Bazar AP</text>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#1D4ED8] dark:text-[#38BDF8]">Cero Frustración</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Bazar de Pistas y Escudos
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Usá tus puntos de aventura para pedir pistas si te trabás o proteger tus días de racha.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#FCD34D] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#FCD34D] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="rounded-xl border-2 border-[#0F172A] bg-[#F3E8FF] p-3 flex items-center justify-center h-28">
                      <svg viewBox="0 0 160 80" className="w-full h-full">
                        <rect x="26" y="10" width="44" height="60" rx="6" fill="#581C87" stroke="#0F172A" strokeWidth="3" transform="rotate(-6 48 40)" />
                        <rect x="44" y="10" width="44" height="60" rx="6" fill="#FCD34D" stroke="#0F172A" strokeWidth="3" />
                        <rect x="64" y="10" width="44" height="60" rx="6" fill="#fff" stroke="#0F172A" strokeWidth="3" transform="rotate(6 86 40)" />
                        <text x="86" y="44" textAnchor="middle" fontWeight="800" fontSize="10" fill="#0F172A">Ficha #12</text>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#581C87] dark:text-[#C4B5FD]">Coleccionable</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Grimorio de Estudio
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Cada misión ganada destraba cartas con síntesis de los temas para repasar cuando quieras.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VISTA 3: COLEGIOS E INSTITUCIONES */}
            {rolActivo === 'instituciones' && (
              <motion.div
                key="instituciones"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch"
              >
                {/* Escena Ilustrada Institucional */}
                <div className="lg:col-span-5 rounded-2xl border-3 border-[#0F172A] dark:border-[#C4B5FD] bg-[#F3E8FF] dark:bg-[#221538] p-5 shadow-[6px_6px_0px_#0F172A] dark:shadow-[6px_6px_0px_#A78BFA] flex flex-col justify-between gap-5">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-white text-[#0F172A] border-2 border-[#0F172A] font-display font-extrabold text-[11px] uppercase tracking-wider mb-2">
                      Para Colegios y Directivos
                    </span>
                    <h3 className="font-display font-extrabold text-2xl text-[#0F172A] dark:text-white leading-tight">
                      Seguridad escolar, protección de menores y métricas por curso
                    </h3>
                  </div>

                  <div className="grid grid-cols-12 gap-3 items-center bg-white dark:bg-[#0B131C] rounded-2xl border-3 border-[#0F172A] dark:border-[#C4B5FD] p-3.5 shadow-[4px_4px_0px_#0F172A]">
                    <div className="col-span-5">
                      <div className="relative rounded-xl bg-[#0F172A] p-1 border-2 border-[#0F172A] shadow-[3px_3px_0px_#2563EB]">
                        <img
                          src="/images/landing/mago_postal.png"
                          alt="Custodio Institucional"
                          loading="lazy"
                          width="140"
                          height="180"
                          className="w-full h-36 object-cover object-[50%_18%] rounded-lg border border-[#FCD34D]"
                        />
                        <span className="block text-center text-[9px] font-display font-extrabold uppercase text-[#FCD34D] pt-1">
                          Panel Directivo
                        </span>
                      </div>
                    </div>

                    <div className="col-span-7 flex flex-col gap-2">
                      {[
                        { label: 'Participación 3° Año', pct: '94%', w: '94%', c: 'bg-[#059669]' },
                        { label: 'Misiones Superadas', pct: '86%', w: '86%', c: 'bg-[#2563EB]' },
                      ].map((m) => (
                        <div key={m.label} className="rounded-lg bg-[#F8FAFC] dark:bg-[#132232] border-2 border-[#0F172A] dark:border-[#475569] p-2">
                          <div className="flex justify-between text-[10px] font-display font-extrabold text-[#0F172A] dark:text-white mb-1">
                            <span>{m.label}</span>
                            <span>{m.pct}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#E2E8F0] dark:bg-[#0B131C] border border-[#0F172A] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: m.w }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`h-full ${m.c}`}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="rounded-lg bg-[#D1FAE5] border-2 border-[#0F172A] px-2.5 py-1.5 text-[10px] font-display font-extrabold text-[#065F46]">
                        ✓ Cuentas de menores protegidas
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleIrAAuth('login')}
                    className="w-full py-3 rounded-xl border-2 border-[#0F172A] bg-[#581C87] dark:bg-[#C4B5FD] hover:bg-[#6B21A8] text-white dark:text-[#0F172A] font-display font-extrabold text-sm shadow-[3px_3px_0px_#0F172A] cursor-pointer"
                  >
                    Acceder al Panel Institucional →
                  </button>
                </div>

                {/* 3 Tarjetas con Esquemas Visuales para Colegios */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#C4B5FD] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#A78BFA] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="rounded-xl border-2 border-[#0F172A] bg-[#FEF3C7] p-3 flex items-center justify-center h-28">
                      <svg viewBox="0 0 160 80" className="w-full h-full">
                        <circle cx="42" cy="34" r="14" fill="#FCD34D" stroke="#0F172A" strokeWidth="3" />
                        <text x="42" y="66" textAnchor="middle" fontWeight="800" fontSize="10" fill="#0F172A">Alumno</text>
                        <path d="M64 34h30" stroke="#0F172A" strokeWidth="3" strokeDasharray="5 4" className="animate-dash-flow" />
                        <circle cx="116" cy="34" r="14" fill="#D1FAE5" stroke="#0F172A" strokeWidth="3" />
                        <path d="M110 34l4 4 8-8" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <text x="116" y="66" textAnchor="middle" fontWeight="800" fontSize="10" fill="#0F172A">Tutor / Dir.</text>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#B45309] dark:text-[#FCD34D]">Cuidado Escolar</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Protección de Menores
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Los menores de 16 años requieren correo de adulto responsable y habilitación del colegio.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#C4B5FD] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#A78BFA] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="rounded-xl border-2 border-[#0F172A] bg-[#F3E8FF] p-3 flex items-center justify-center h-28">
                      <svg viewBox="0 0 160 80" className="w-full h-full">
                        <rect x="14" y="20" width="38" height="40" rx="6" fill="#fff" stroke="#0F172A" strokeWidth="2.5" />
                        <rect x="61" y="20" width="38" height="40" rx="6" fill="#E0ECFF" stroke="#0F172A" strokeWidth="2.5" />
                        <rect x="108" y="20" width="38" height="40" rx="6" fill="#D1FAE5" stroke="#0F172A" strokeWidth="2.5" />
                        <path d="M52 40h9M99 40h9" stroke="#0F172A" strokeWidth="3" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#581C87] dark:text-[#C4B5FD]">Transparencia</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Historial Inalterable
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Cada misión publicada y cada intento de resolución queda guardado con fecha y responsable.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border-3 border-[#0F172A] dark:border-[#C4B5FD] bg-[#F8FAFC] dark:bg-[#0B131C] p-4 shadow-[5px_5px_0px_#0F172A] dark:shadow-[5px_5px_0px_#A78BFA] flex flex-col justify-between gap-3 hover:-translate-y-1 transition-transform">
                    <div className="rounded-xl border-2 border-[#0F172A] bg-[#E0ECFF] p-3 flex items-center justify-center h-28">
                      <svg viewBox="0 0 160 80" className="w-full h-full">
                        <rect x="24" y="14" width="112" height="52" rx="10" fill="#fff" stroke="#0F172A" strokeWidth="3" />
                        <circle cx="52" cy="40" r="12" fill="#D1FAE5" stroke="#0F172A" strokeWidth="2.5" />
                        <path d="M47 40l4 4 7-8" stroke="#059669" strokeWidth="2.5" fill="none" />
                        <text x="98" y="38" textAnchor="middle" fontWeight="800" fontSize="11" fill="#0F172A">Sin Trampas</text>
                        <text x="98" y="52" textAnchor="middle" fontWeight="800" fontSize="9.5" fill="#1E3A8A">100% Seguro</text>
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-extrabold uppercase text-[#1D4ED8] dark:text-[#38BDF8]">Evaluación Justa</span>
                      <h4 className="font-display font-extrabold text-lg text-[#0F172A] dark:text-white mt-0.5 mb-1">
                        Notas a Prueba de Trampas
                      </h4>
                      <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E2E8F0] font-medium">
                        Las respuestas correctas nunca viajan ocultas al navegador: todo se corrige de forma segura.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── 6. BLOQUE DE CONFIANZA Y LLAMADO A LA ACCIÓN CON PERSONAJE ── */}
      <section id="confianza" className="py-14 sm:py-16 px-4 sm:px-8 bg-[#1E1B4B] text-white border-b-3 border-[#0F172A]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4 text-center lg:text-left">
            <span className="inline-block self-center lg:self-start px-3 py-1 rounded-full bg-[#581C87] border-2 border-[#FCD34D] font-display font-extrabold text-xs uppercase tracking-wider text-[#FCD34D]">
              Tecnología al Servicio del Docente
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white leading-tight">
              La IA sugiere. El docente educa.
            </h2>
            <p className="text-sm sm:text-base text-[#F1F5F9] font-medium max-w-2xl mx-auto lg:mx-0">
              A diferencia de los generadores automáticos sin filtro, en <b>Aventuras del Saber</b> vos mantenés el control pedagógico de cada pregunta, cada pista y cada recompensa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { Icon: Shield, title: 'Sin Respuestas Filtradas', sub: 'Corrección justa y transparente' },
                { Icon: Users, title: 'Aulas por Código', sub: 'Ingreso inmediato de alumnos' },
                { Icon: HeartHandshake, title: 'Entorno Cuidado', sub: 'Sin anuncios ni compras ocultas' },
              ].map((item) => {
                const Icon = item.Icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl bg-[#0F172A] border-2 border-[#38BDF8] p-3.5 shadow-[3px_3px_0px_#000000] text-left flex items-start gap-2.5"
                  >
                    <Icon size={18} className="text-[#FCD34D] shrink-0 mt-0.5" />
                    <div>
                      <b className="block font-display text-xs sm:text-sm text-white">{item.title}</b>
                      <span className="text-[11px] text-[#E2E8F0]">{item.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invitación final con Mago Cutout flotando */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#0F172A] border-3 border-[#FCD34D] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0px_#000000]">
            <img
              src="/images/landing/mago-cutout.png"
              alt="Arcanista invitando al aula"
              loading="lazy"
              width="136"
              height="156"
              className="w-28 sm:w-36 h-auto object-contain drop-shadow-[3px_4px_0_rgba(252,211,77,0.3)] shrink-0 animate-float"
            />
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <p className="font-display font-extrabold text-lg text-[#FCD34D] leading-snug">
                ¿Listo para transformar tu próxima clase?
              </p>
              <button
                type="button"
                onClick={() => handleIrAAuth('registro-docente')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-[#0F172A] bg-[#FCD34D] hover:bg-[#F59E0B] text-[#0F172A] font-display font-extrabold text-sm shadow-[3px_3px_0px_#581C87] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Crear Cuenta Docente</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleIrAAuth('login')}
                className="text-xs font-display font-bold text-[#38BDF8] hover:underline cursor-pointer"
              >
                Ya tengo cuenta → Ingresar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER ── */}
      <footer className="bg-white dark:bg-[#0B131C] py-8 px-4 sm:px-8 text-xs text-[#1E293B] dark:text-[#E2E8F0] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-[#0F172A] dark:border-[#38BDF8] bg-[#FEF3C7] p-1 shrink-0">
              <img
                src="/images/landing/logo.png"
                alt="Logo"
                loading="lazy"
                width="24"
                height="24"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm text-[#0F172A] dark:text-white">
                Aventuras del Saber
              </span>
              <p className="text-[11px] text-[#334155] dark:text-[#CBD5E1]">
                Plataforma de Gamificación Educativa · FaCENA – UNNE
              </p>
            </div>
          </div>

          <div className="text-[11px] font-display font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Joel Jesús Marcori · Licenciatura en Sistemas de Información
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
