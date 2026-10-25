import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Swords, Shield, Skull, ChevronRight, CheckCircle2, AlertTriangle, Flame, Image } from 'lucide-react';
import { animate } from 'animejs';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import ResultadoResolucion from './ResultadoResolucion';
import { useResolverMision } from '../../../hooks/useMisionMutations';
import { playParchment, playChime, playSuccess } from '../../../utils/audio';

/**
 * BatallaDeJefe — Experiencia inmersiva e interactiva contra el Jefe Pedagógico.
 *
 * Características principales:
 * - Daño y contraataques reflejados de forma INSTANTÁNEA turno a turno.
 * - Integración de ilustraciones oficiales en formato vertical (/images/bosses/):
 *   · Modo Capas (Recomendado): fondo-con-sombra-criatura.png + criatura.png (la sombra queda fija al golpear/sacudir a la criatura).
 *   · Modo Directo: fondo-sin-sombra-criatura.png + criatura-con-sombra.png.
 * - 100% Anime.js para HP, números de daño flotantes, recoil/shake del sprite de la criatura y disolución de muerte.
 * - Respeta `prefers-reduced-motion: reduce`.
 */

// Opciones de arte para el profesor / configuración de la misión
const VARIANTES_ARTE = [
  {
    id: 'capas',
    nombre: 'Ilustración con Sombra en Fondo (Capas)',
    fondo: '/images/bosses/fondo-con-sombra-criatura.png',
    criatura: '/images/bosses/criatura.png',
  },
  {
    id: 'directo',
    nombre: 'Ilustración con Sombra en Criatura',
    fondo: '/images/bosses/fondo-sin-sombra-criatura.png',
    criatura: '/images/bosses/criatura-con-sombra.png',
  },
];

// Componente para la barra de HP animada con Anime.js
function BarraDeHP({ hpActual, hpMaximo }) {
  const fillRef = useRef(null);
  const porcentaje = Math.max(0, Math.min(100, Math.round((hpActual / hpMaximo) * 100)));

  useEffect(() => {
    if (!fillRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      fillRef.current.style.width = `${porcentaje}%`;
      return;
    }

    animate(fillRef.current, {
      width: `${porcentaje}%`,
      duration: 500,
      ease: 'outExpo',
    });
  }, [porcentaje]);

  // Color vibrante por umbral según Painterly RPG (alto contraste)
  const colorFondo =
    porcentaje > 50
      ? 'var(--brand-emerald, #10b981)'
      : porcentaje > 20
        ? 'var(--brand-gold, #f59e0b)'
        : 'var(--brand-crimson, #ef4444)';

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between text-xs font-display font-bold">
        <span className="text-white/80 flex items-center gap-1 drop-shadow">
          <Shield size={13} className="text-red-400" />
          Vitalidad del Jefe
        </span>
        <span className="text-white font-mono drop-shadow">
          {hpActual} / {hpMaximo} HP ({porcentaje}%)
        </span>
      </div>

      <div
        className="h-4 w-full rounded-full bg-black/60 overflow-hidden border-2 border-amber-400/60 p-0.5 shadow-inner"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Barra de vida del Jefe"
      >
        <div
          ref={fillRef}
          className="h-full rounded-full transition-colors duration-300"
          style={{
            backgroundColor: colorFondo,
            width: `${porcentaje}%`,
            boxShadow: `0 0 10px ${colorFondo}`,
          }}
        />
      </div>
    </div>
  );
}

function BatallaDeJefe({ mision, isOpen, onClose }) {
  const { mutate: resolver, isPending, data: resultadoData, error, reset } = useResolverMision();

  // Parseo defensivo y memoizado del payload
  const { nombreJefe, hpMaximo, fases, varianteArteInicial } = useMemo(() => {
    let nombre = 'El Bug Ancestral';
    let hp = 100;
    let items = [];
    let arte = 'capas';

    try {
      const parsed =
        typeof mision?.payloadJson === 'string'
          ? JSON.parse(mision.payloadJson)
          : mision?.payloadJson;

      if (parsed) {
        nombre = parsed.nombreJefe || nombre;
        hp = Number(parsed.hpMaximo) || 100;
        items = Array.isArray(parsed.fases) ? parsed.fases : [];
        if (parsed.varianteArte) arte = parsed.varianteArte;
      }
    } catch {
      /* payload malformado */
    }

    return { nombreJefe: nombre, hpMaximo: hp, fases: items, varianteArteInicial: arte };
  }, [mision?.payloadJson]);

  // Selección de variante de arte (configurada por profesor o toggle en batalla)
  const [varianteArteId, setVarianteArteId] = useState(varianteArteInicial);
  const varianteSeleccionada =
    VARIANTES_ARTE.find((v) => v.id === varianteArteId) || VARIANTES_ARTE[0];

  // Estado del combate turno a turno
  const [faseActualIdx, setFaseActualIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [pantalla, setPantalla] = useState('combate'); // 'combate' | 'final'
  const [hpBoss, setHpBoss] = useState(hpMaximo);
  const [enfriamientoActivo, setEnfriamientoActivo] = useState(false);
  const [turnoEjecutado, setTurnoEjecutado] = useState(false);
  const [mensajeTurno, setMensajeTurno] = useState(null);

  // Refs de animación imperativa de Anime.js
  const arenaRef = useRef(null);
  const criaturaRef = useRef(null);
  const damageContainerRef = useRef(null);
  const flashOverlayRef = useRef(null);

  const totalFases = fases.length;
  const faseActual = fases[faseActualIdx];
  const respuestaFaseActual = respuestas[faseActualIdx];

  // Respiración idle de la criatura (Anime.js)
  useEffect(() => {
    if (!criaturaRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const animBreathing = animate(criaturaRef.current, {
      translateY: [-4, 4],
      duration: 2400,
      direction: 'alternate',
      loop: true,
      ease: 'inOutSine',
    });

    return () => animBreathing.pause();
  }, [pantalla]);

  // Reset al cerrar o cambiar de misión
  const handleClose = () => {
    reset();
    setRespuestas({});
    setFaseActualIdx(0);
    setPantalla('combate');
    setHpBoss(hpMaximo);
    setEnfriamientoActivo(false);
    setTurnoEjecutado(false);
    setMensajeTurno(null);
    onClose();
  };

  // Animación de Daño Flotante instantáneo con Anime.js
  const mostrarDanioFlotante = useCallback((cantidad) => {
    if (!damageContainerRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const numero = document.createElement('div');
    numero.textContent = `-${cantidad} HP`;
    numero.className =
      'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl font-display font-black text-red-500 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] pointer-events-none z-30 select-none';
    damageContainerRef.current.appendChild(numero);

    if (prefersReducedMotion) {
      setTimeout(() => numero.remove(), 700);
      return;
    }

    animate(numero, {
      translateY: -80,
      scale: [0.8, 1.4, 1],
      opacity: [1, 1, 0],
      duration: 1000,
      ease: 'outCubic',
      onComplete: () => numero.remove(),
    });

    // Recoil y flash rojizo sobre la criatura con Anime.js
    if (criaturaRef.current) {
      animate(criaturaRef.current, {
        translateX: [-14, 14, -10, 10, -5, 5, 0],
        filter: ['brightness(1)', 'brightness(2.2) saturate(1.8)', 'brightness(1)'],
        duration: 450,
        ease: 'outQuad',
      });
    }
  }, []);

  // Animaciones de penalización con Anime.js
  const ejecutarPenalizacion = useCallback((tipoPenalizacion) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tipoNormalizado = ['temblor', 'destello', 'enfriamiento'].includes(tipoPenalizacion)
      ? tipoPenalizacion
      : 'destello';

    if (tipoNormalizado === 'temblor') {
      if (!prefersReducedMotion && arenaRef.current) {
        animate(arenaRef.current, {
          translateX: [-12, 12, -9, 9, -5, 5, 0],
          duration: 450,
          ease: 'inOutQuad',
        });
      }
    } else if (tipoNormalizado === 'destello') {
      if (flashOverlayRef.current) {
        if (prefersReducedMotion) {
          flashOverlayRef.current.style.opacity = '0.4';
          setTimeout(() => {
            if (flashOverlayRef.current) flashOverlayRef.current.style.opacity = '0';
          }, 300);
        } else {
          animate(flashOverlayRef.current, {
            opacity: [0, 0.5, 0],
            duration: 500,
            ease: 'outCubic',
          });
        }
      }
    } else if (tipoNormalizado === 'enfriamiento') {
      setEnfriamientoActivo(true);
      setTimeout(() => {
        setEnfriamientoActivo(false);
      }, 1500);
    }
  }, []);

  // Disolver la criatura y mostrar pantalla final
  const finalizarBatalla = (respuestasFinales) => {
    if (!mision?.misionId) return;
    playChime();

    const respuestasArray = fases.map((_, idx) => ({
      indicePregunta: idx,
      opcionElegida: respuestasFinales[idx] || '',
    }));

    resolver(
      {
        misionId: mision.misionId,
        respuestas: respuestasArray,
        preguntasOriginales: fases,
      },
      {
        onSuccess: () => {
          // Si el jefe fue derrotado (HP llegó a 0), animamos la disolución con Anime.js
          if (hpBoss <= 0 && criaturaRef.current) {
            animate(criaturaRef.current, {
              scale: [1, 0.75],
              opacity: [1, 0],
              filter: ['brightness(1)', 'brightness(3)', 'brightness(0)'],
              duration: 1000,
              ease: 'outExpo',
              onComplete: () => {
                setPantalla('final');
              },
            });
          } else {
            setPantalla('final');
          }
        },
      }
    );
  };

  // DISPARO DE ACCIÓN INSTANTÁNEO POR TURNO
  const handleEjecutarAccionTurno = (opcionElegida) => {
    if (enfriamientoActivo || turnoEjecutado) return;

    playParchment();
    const nuevasRespuestas = { ...respuestas, [faseActualIdx]: opcionElegida };
    setRespuestas(nuevasRespuestas);
    setTurnoEjecutado(true);

    const danio = Number(faseActual?.danioAlJefe) || 25;
    const penalizacion = faseActual?.penalizacionFallo || 'destello';

    // Verificamos si la respuesta es correcta para reflejar el daño de forma instantánea
    let esCorrecta = false;
    if (faseActual?.respuestaCorrecta) {
      esCorrecta = opcionElegida === faseActual.respuestaCorrecta;
    } else {
      // Si la misión vino del backend sanitizado o es mock:
      const respuestasMockJefe = [
        'O(N)',
        'Condición de carrera (Race Condition)',
        'Tabla Hash (Hash Map)',
      ];
      const esperada = respuestasMockJefe[faseActualIdx] || faseActual?.opciones?.[0];
      esCorrecta = opcionElegida === esperada;
    }

    if (esCorrecta) {
      playSuccess();
      mostrarDanioFlotante(danio);
      setHpBoss((prev) => Math.max(0, prev - danio));
      setMensajeTurno({
        tipo: 'exito',
        texto: `¡Ataque Certero! Infligiste ${danio} de daño a ${nombreJefe}.`,
      });
    } else {
      ejecutarPenalizacion(penalizacion);
      setMensajeTurno({
        tipo: 'fallo',
        texto: `¡Ataque fallido! ${nombreJefe} resistió el golpe y desató contraataque (${penalizacion}).`,
      });
    }
  };

  // Pasar a la siguiente fase o finalizar la batalla
  const handleAvanzarFase = () => {
    if (faseActualIdx < totalFases - 1) {
      setFaseActualIdx((i) => i + 1);
      setTurnoEjecutado(false);
      setMensajeTurno(null);
    } else {
      // Última fase completada: registrar resolución oficial en el backend
      finalizarBatalla(respuestas);
    }
  };

  const jefeDerrotado = hpBoss <= 0 || (resultadoData?.porcentajeCorrecto ?? 0) >= 60;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isPending ? undefined : handleClose}
      title={
        pantalla === 'final'
          ? jefeDerrotado
            ? '¡Victoria Épica!'
            : 'Resultado del Asalto'
          : `Batalla de Jefe: ${nombreJefe}`
      }
      size="lg"
    >
      <div ref={arenaRef} className="relative flex flex-col gap-4 select-none">
        {/* Flash overlay para penalizaciones de destello */}
        <div
          ref={flashOverlayRef}
          aria-hidden="true"
          className="absolute -inset-4 bg-red-600/35 rounded-2xl pointer-events-none opacity-0 z-40 transition-opacity"
        />

        {error && <ErrorBanner error={error} onDismiss={reset} />}

        {/* ── 1. Escenario de la Batalla (Arena Ilustrada con Capas) ── */}
        <div className="relative w-full rounded-[16px_22px_18px_20px] overflow-hidden border-2 border-amber-500/70 shadow-[0_8px_30px_rgba(0,0,0,0.6)] bg-black">
          {/* Contenedor con ratio vertical para la ilustración oficial (1000x1736) */}
          <div className="relative w-full h-[280px] sm:h-[340px] overflow-hidden flex items-center justify-center">
            {/* Imagen de fondo (con o sin sombra según la variante) */}
            <img
              src={varianteSeleccionada.fondo}
              alt="Fondo de la Arena de Batalla"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none brightness-90"
            />

            {/* Viñeta oscura superior e inferior para máxima legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none" />

            {/* Sprite de la criatura superpuesto con pixel alignment exacto */}
            <div
              ref={damageContainerRef}
              className="relative w-full h-full flex items-center justify-center z-10"
            >
              <img
                ref={criaturaRef}
                src={varianteSeleccionada.criatura}
                alt={nombreJefe}
                className="h-full w-auto max-w-full object-contain pointer-events-none select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Cabecera superior superpuesta sobre el arte */}
            <div className="absolute top-3 inset-x-4 z-20 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/50 shadow">
                  <Skull size={15} className="text-amber-400" />
                  <span className="text-xs font-display font-black text-amber-300 uppercase tracking-wider">
                    {nombreJefe}
                  </span>
                </div>

                {/* Selector de capas de arte para el profesor */}
                <button
                  type="button"
                  onClick={() =>
                    setVarianteArteId((prev) => (prev === 'capas' ? 'directo' : 'capas'))
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-[10px] font-display text-white/80 hover:text-white border border-white/20 transition-all cursor-pointer"
                  title="Alternar entre modo sombras en capas vs criatura con sombra"
                >
                  <Image size={11} />
                  <span>Arte: {varianteArteId === 'capas' ? 'Capas (Fondo Sombra)' : 'Directo'}</span>
                </button>
              </div>

              {/* Barra de HP integrada en la parte superior del escenario */}
              <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-lg">
                <BarraDeHP hpActual={hpBoss} hpMaximo={hpMaximo} />
              </div>
            </div>

            {/* Indicador de fase actual sobre la base de la arena */}
            <div className="absolute bottom-2.5 inset-x-4 z-20 flex items-center justify-between text-xs font-display">
              <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white/90 border border-white/20">
                Fase {faseActualIdx + 1} de {totalFases}
              </span>
              <span className="bg-red-950/80 backdrop-blur-md px-3 py-1 rounded-full text-red-300 border border-red-500/40 font-bold">
                Daño de fase: +{faseActual?.danioAlJefe || 25} HP
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. Interacción Turno a Turno (Daño Instantáneo) ── */}
        {pantalla === 'combate' && faseActual && (
          <div className="flex flex-col gap-3">
            {/* Mensaje de diálogo del Jefe (Prompt de la Fase) */}
            <div className="p-4 rounded-[12px_16px_14px_14px] bg-gradient-to-br from-[var(--bg-panel)] to-[var(--bg-accent)] border-2 border-[var(--border)] shadow-[3px_3px_0px_var(--border)]">
              <div className="flex items-center gap-2 mb-1.5 text-[var(--brand-crimson)]">
                <Flame size={15} />
                <span className="text-[10px] font-display font-black tracking-widest uppercase">
                  Ataque del Jefe — Turno {faseActualIdx + 1}
                </span>
              </div>
              <p className="font-display font-bold text-sm sm:text-base text-[var(--text-primary)] leading-snug">
                {faseActual.enunciado}
              </p>
            </div>

            {/* Feedback instantáneo del turno */}
            {mensajeTurno && (
              <div
                className={[
                  'p-3 rounded-xl border-2 text-xs font-display font-bold flex items-center gap-2 animate-fadeIn',
                  mensajeTurno.tipo === 'exito'
                    ? 'border-[var(--brand-emerald)] bg-[color-mix(in_oklch,var(--brand-emerald)_12%,var(--bg-panel))] text-[var(--brand-emerald)]'
                    : 'border-[var(--brand-crimson)] bg-[color-mix(in_oklch,var(--brand-crimson)_12%,var(--bg-panel))] text-[var(--brand-crimson)]',
                ].join(' ')}
              >
                {mensajeTurno.tipo === 'exito' ? (
                  <CheckCircle2 size={16} className="shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="shrink-0" />
                )}
                <span>{mensajeTurno.texto}</span>
              </div>
            )}

            {/* Opciones de Ataque / Tácticas (Acción Inmediata) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {faseActual.opciones?.map((opcion, oIdx) => {
                const fueElegida = respuestaFaseActual === opcion;

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={turnoEjecutado || enfriamientoActivo}
                    onClick={() => handleEjecutarAccionTurno(opcion)}
                    className={[
                      'group relative flex items-center gap-3 p-3.5 rounded-[10px_14px_10px_12px] border-2 text-left text-sm transition-all duration-150 outline-none',
                      turnoEjecutado
                        ? fueElegida
                          ? 'border-[var(--brand-crimson)] bg-[color-mix(in_oklch,var(--brand-crimson)_14%,var(--bg-panel))] font-bold shadow-md'
                          : 'border-[var(--border-muted)] bg-[var(--bg-base)] opacity-50 cursor-not-allowed'
                        : 'border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--brand-crimson)] hover:bg-[var(--bg-accent)] hover:-translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_var(--border)] active:scale-[0.98]',
                    ].join(' ')}
                  >
                    <span className="w-6 h-6 rounded-full bg-[var(--brand-crimson)] text-white text-xs font-display font-bold flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="flex-1 leading-snug font-medium text-[var(--text-primary)]">
                      {opcion}
                    </span>
                    {!turnoEjecutado && (
                      <Swords
                        size={14}
                        className="text-[var(--text-muted)] group-hover:text-[var(--brand-crimson)] shrink-0 transition-colors"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Botón para avanzar a la siguiente fase o finalizar */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-muted)]">
              <span className="text-xs text-[var(--text-muted)] font-display">
                {turnoEjecutado ? (
                  <span className="text-[var(--brand-emerald)] font-bold">
                    ✓ Acción ejecutada
                  </span>
                ) : (
                  'Elegí una táctica para atacar inmediatamente'
                )}
              </span>

              {turnoEjecutado && (
                <Button
                  variant="primary"
                  onClick={handleAvanzarFase}
                  loading={isPending}
                  className="bg-[var(--brand-crimson)] hover:bg-red-700 text-white font-bold"
                >
                  <span>
                    {faseActualIdx < totalFases - 1
                      ? 'Siguiente Fase'
                      : 'Finalizar Batalla'}
                  </span>
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── 3. Pantalla Final: Victoria o Resultado ── */}
        {pantalla === 'final' && (
          <div className="flex flex-col gap-4">
            <div
              className={[
                'p-6 rounded-[14px_18px_16px_16px] border-2 text-center flex flex-col items-center gap-3',
                jefeDerrotado
                  ? 'border-[var(--brand-emerald)] bg-[color-mix(in_oklch,var(--brand-emerald)_12%,var(--bg-panel))]'
                  : 'border-[var(--brand-crimson)] bg-[color-mix(in_oklch,var(--brand-crimson)_12%,var(--bg-panel))]',
              ].join(' ')}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-current text-2xl shadow-lg">
                {jefeDerrotado ? '🏆' : '⚔️'}
              </div>

              <div>
                <h3 className="font-display font-black text-2xl text-[var(--text-primary)]">
                  {jefeDerrotado ? `¡Derrotaste a ${nombreJefe}!` : `${nombreJefe} ha resistido`}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                  {jefeDerrotado
                    ? 'Tus tácticas precisas drenaron la vitalidad del jefe y restablecieron el orden en el aula.'
                    : 'El jefe resistió tu ofensiva. Revisa los conceptos pedagógicos de cada fase para mejorar tu estrategia.'}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
                <Badge variant="xp" className="text-sm px-3 py-1 font-bold">
                  +{resultadoData?.xpGanado || mision?.recompensaXp || 150} XP
                </Badge>
                {(resultadoData?.apGanado ?? 0) > 0 && (
                  <Badge variant="violet" className="text-sm px-3 py-1 font-bold">
                    +{resultadoData.apGanado} AP
                  </Badge>
                )}
                <Badge variant={jefeDerrotado ? 'correcto' : 'incorrecto'}>
                  {resultadoData?.porcentajeCorrecto ?? Math.round(((hpMaximo - hpBoss) / hpMaximo) * 100)}% Daño Infligido
                </Badge>
              </div>
            </div>

            {/* Desglose pedagógico */}
            {resultadoData && (
              <ResultadoResolucion
                resultado={resultadoData}
                preguntasOriginales={fases}
                onCerrar={handleClose}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default BatallaDeJefe;
