import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * XpParticleBurst — Efecto visual de partículas doradas y runas flotantes de celebración
 *
 * Genera chispas doradas que emergen del centro y flotan hacia arriba
 * con rotación y desvanecimiento progresivo.
 */

const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * 360;
  const distance = 80 + Math.random() * 100;
  const rad = (angle * Math.PI) / 180;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance - 30,
    size: 4 + Math.random() * 8,
    symbol: ['✦', '★', '◆', '✧', '▲'][i % 5],
    color: ['#FCD34D', '#F59E0B', '#D97706', '#34D399', '#38BDF8'][i % 5],
    duration: 0.8 + Math.random() * 0.6,
    delay: Math.random() * 0.15,
  };
});

function XpParticleBurst({ onComplete }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-20"
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          initial={{
            opacity: 1,
            scale: 0.2,
            x: 0,
            y: 0,
          }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0.2, 1.4, 0.6],
            x: p.x,
            y: p.y,
            rotate: [0, p.x > 0 ? 180 : -180],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            color: p.color,
            fontSize: `${p.size + 10}px`,
            textShadow: `0 0 12px ${p.color}`,
          }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  );
}

export default XpParticleBurst;
