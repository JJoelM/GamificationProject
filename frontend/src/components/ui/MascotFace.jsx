import { motion } from 'framer-motion';

/**
 * MascotFace — Carita expresiva combinando símbolos para humanizar estados de error
 *
 * Diseñado para ocupar un espacio central y prominente (al menos el 50% de la altura de la vista/contenedor),
 * preparado para ser reemplazado fácilmente en el futuro por la ilustración oficial de la mascota.
 *
 * Variantes de expresión:
 * · 'sad'        — (っ- ‸ - ς)  / ( ╥﹏╥ )  [Error genérico / 500]
 * · 'confused'   — ( • ᴖ • ｡)?              [404 no encontrado]
 * · 'worried'    — (；´д｀)                  [400 validación / datos inválidos]
 * · 'blocked'    — ( ｡ • ̀ ᴖ • ́ ｡)          [409 conflicto de estado / regla pedagógica]
 * · 'disconnected'— ( ˘︹˘ )                [Error de conexión de red]
 */

const EXPRESSIONS = {
  sad: {
    face: '(っ- ‸ - ς)',
    subtitle: 'Oh no...',
    aura: 'rgba(220, 38, 38, 0.08)',
  },
  confused: {
    face: '( • ᴖ • ｡)?',
    subtitle: '¿Dónde se habrá metido?',
    aura: 'rgba(217, 119, 6, 0.08)',
  },
  worried: {
    face: '(；´д｀)',
    subtitle: 'Algo no encaja...',
    aura: 'rgba(217, 119, 6, 0.08)',
  },
  blocked: {
    face: '( ｡ • ̀ ᴖ • ́ ｡)',
    subtitle: 'Acción no permitida',
    aura: 'rgba(43, 20, 84, 0.08)',
  },
  forbidden: {
    face: '(´• ω •`)ﾉ ⛔',
    subtitle: 'Acceso restringido al aula',
    aura: 'rgba(220, 38, 38, 0.08)',
  },
  disconnected: {
    face: '( ˘︹˘ )⚡',
    subtitle: 'Sin señal con el servidor',
    aura: 'rgba(56, 189, 248, 0.08)',
  },
};

function MascotFace({ expression = 'sad', customImage = null, compact = false, className = '' }) {
  const current = EXPRESSIONS[expression] ?? EXPRESSIONS.sad;

  return (
    <div
      data-mascot-slot="true"
      className={[
        'w-full flex flex-col items-center justify-center select-none text-center',
        // Si es compacto (formularios/tarjetas), ocupa un alto proporcional y no sobredimensionado
        compact ? 'py-2 min-h-0' : 'min-h-[45vh] md:min-h-[50vh] py-8',
        className,
      ].join(' ')}
    >
      {/* 
        =======================================================================
        ESPACIO RESERVADO PARA LA IMAGEN DE LA MASCOTA
        Cuando esté disponible el asset oficial, reemplazar el bloque inferior por:
        <img src={customImage || mascotAssetUrl} alt="Mascota" className="w-64 h-64 object-contain" />
        =======================================================================
      */}
      {customImage ? (
        <img
          src={customImage}
          alt="Mascota"
          className={[
            'object-contain animate-float',
            compact ? 'max-h-24' : 'max-h-64',
          ].join(' ')}
        />
      ) : (
        <motion.div
          initial={{ scale: 0.9, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="flex flex-col items-center justify-center"
        >
          {/* Contenedor central de la carita con aura suave */}
          <div
            className={[
              'relative border-2 border-[var(--border)]',
              'bg-gradient-to-b from-[var(--bg-panel)] to-[var(--bg-muted)]',
              'animate-float flex flex-col items-center justify-center',
              compact
                ? 'px-5 py-3 md:px-6 md:py-3.5 rounded-[20px_26px_22px_24px] shadow-[4px_4px_0px_var(--border)]'
                : 'px-8 py-7 md:px-12 md:py-10 rounded-[28px_36px_30px_34px] shadow-[5px_5px_0px_var(--border)]',
            ].join(' ')}
          >
            {/* Expresión facial ASCII/Kaomoji de gran escala */}
            <span
              className={[
                'font-display font-black tracking-wider text-[var(--text-primary)] block drop-shadow-sm',
                compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl md:text-6xl',
              ].join(' ')}
              aria-label={current.subtitle}
            >
              {current.face}
            </span>

            {/* Sombra sutil tipo suelo */}
            <span
              className={[
                'font-display font-bold uppercase tracking-widest text-[var(--text-muted)]',
                compact ? 'text-[10px] mt-1' : 'text-xs mt-3',
              ].join(' ')}
            >
              {current.subtitle}
            </span>
          </div>

          {/* Sombra de proyección en el suelo */}
          <div
            className={[
              'bg-[var(--border-muted)] rounded-full opacity-40 blur-xs',
              compact ? 'w-20 h-2 mt-2' : 'w-32 h-3 mt-3',
            ].join(' ')}
          />
        </motion.div>
      )}
    </div>
  );
}

export default MascotFace;
