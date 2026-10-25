import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MOCK_IDS } from '../config/env';

/**
 * useSessionStore — Estado global de sesión, tema, audio y progresión RPG en memoria.
 *
 * CUMPLIMIENTO ESTRICTO DE AGENTS_SKILL_state-persistence-rules.MD:
 * · Lo ÚNICO que persiste en localStorage es la sesión de autenticación (usuarioId, nombre, rol),
 *   aula activa y preferencias cosméticas de UI (tema claro/oscuro y sonido).
 * · NUNCA se persiste progreso de juego en localStorage (XP, AP, racha, logros, misiones resueltas, inventario).
 * · El backend es la única fuente de verdad; los datos se hidratan vía React Query (usePersonaje / ranking).
 * · Al cerrar sesión, useSessionStore.persist.clearStorage() limpia el storage completo.
 */

// Rangos de nivel y títulos pedagógicos
export const NIVELES_RPG = [
  { nivel: 1, xpMin: 0, xpMax: 300, titulo: 'Iniciado del Saber', rango: 'Bronce' },
  { nivel: 2, xpMin: 300, xpMax: 700, titulo: 'Buscador de Respuestas', rango: 'Plata' },
  { nivel: 3, xpMin: 700, xpMax: 1200, titulo: 'Explorador Curioso', rango: 'Oro' },
  { nivel: 4, xpMin: 1200, xpMax: 2000, titulo: 'Erudito de las Runas', rango: 'Platino' },
  { nivel: 5, xpMin: 2000, xpMax: 3500, titulo: 'Maestro Alquimista', rango: 'Diamante' },
];

export function calcularNivel(xp) {
  const current = NIVELES_RPG.find((n) => xp >= n.xpMin && xp < n.xpMax);
  return current || NIVELES_RPG[NIVELES_RPG.length - 1];
}

/** Estado base inicial de progresión RPG en memoria */
const PROGRESION_BASE = {
  xpTotal: 0,
  apTotal: 0,
  rachaDias: 0,
  escudosRacha: 0,
  escudosRachaDisponibles: 0,
  mejoraSemanal: 0,
  tituloEquipado: 'Iniciado del Saber',
  logrosDesbloqueados: [],
  levelUpPendiente: null,

  // Personalización del Avatar
  avatarEquipado: 'erudito_arcano',
  auraColor: '#2563EB',
  marcoEstilo: 'scroll',
  mascotaEquipada: 'buho_erudito',

  // Inventario de artículos comprados en el Bazar
  articulosComprados: [],
  cosmeticosComprados: [],

  // Historial de misiones resueltas: { [misionId]: { completada, intentos, mejorPuntaje, ultimaFecha } }
  misionesResueltas: {},
};

const useSessionStore = create(
  persist(
    (set, get) => ({
      // ── Sesión y Preferencias Persistidas ──
      usuario: null,
      aulaActivaId: MOCK_IDS.aulaId || '33333333-3333-3333-3333-333333333333',
      codigoInvitacionAula: null,
      theme: 'light',
      soundEnabled: true,

      // ── Progreso en memoria del usuario activo (no persistido) ──
      ...PROGRESION_BASE,

      // ── Acciones de autenticación y sesión ──
      setUsuario: (usuario) => {
        if (!usuario) {
          set({ usuario: null, ...PROGRESION_BASE });
          return;
        }
        set({
          usuario,
          ...PROGRESION_BASE,
          levelUpPendiente: null,
        });
      },

      clearUsuario: () => {
        set({ usuario: null, ...PROGRESION_BASE });
      },

      logout: () => {
        try {
          useSessionStore.persist.clearStorage();
        } catch {
          /* ignore */
        }
        set({
          usuario: null,
          codigoInvitacionAula: null,
          ...PROGRESION_BASE,
        });
      },

      /**
       * Hidrata el progreso del alumno desde la respuesta del backend
       * (GET /api/alumnos/personaje/{aulaId})
       */
      hidratarProgreso: (datosBackend) => {
        if (!datosBackend) return;

        set((s) => ({
          xpTotal: datosBackend.experienciaXP ?? s.xpTotal,
          apTotal: datosBackend.puntosAccionAP ?? s.apTotal,
          rachaDias: datosBackend.rachaDiasActivos ?? s.rachaDias,
          escudosRacha: datosBackend.escudosRachaDisponibles ?? s.escudosRacha,
          escudosRachaDisponibles: datosBackend.escudosRachaDisponibles ?? s.escudosRachaDisponibles,
          avatarEquipado: datosBackend.avatarEquipado || s.avatarEquipado,
          marcoEstilo: datosBackend.marcoEquipado || s.marcoEstilo,
          mascotaEquipada: datosBackend.mascotaEquipada || s.mascotaEquipada,
          tituloEquipado: datosBackend.tituloEquipado || s.tituloEquipado,
          cosmeticosComprados: datosBackend.cosmeticosComprados ?? s.cosmeticosComprados,
          articulosComprados: datosBackend.cosmeticosComprados ?? s.articulosComprados,
        }));
      },

      setAulaActiva: (aulaId) => set({ aulaActivaId: aulaId }),

      setCodigoInvitacion: (codigo) => set({ codigoInvitacionAula: codigo }),

      // Tema claro / oscuro
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ theme: next });
      },

      // Audio
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      // Personalización de avatar y cosméticos en memoria
      setAvatarEquipado: (avatarId) => set({ avatarEquipado: avatarId }),
      setAuraColor: (auraColor) => set({ auraColor }),
      setMarcoEstilo: (marcoEstilo) => set({ marcoEstilo }),
      setMascotaEquipada: (mascotaId) => set({ mascotaEquipada: mascotaId }),
      setTituloEquipado: (titulo) => set({ tituloEquipado: titulo }),

      // Bazar: comprar y equipar artículos con AP
      comprarArticulo: ({ id, costoAp, tipo, valor }) => {
        const state = get();
        if (state.apTotal < costoAp && !state.articulosComprados.includes(id)) {
          return { exito: false, motivo: 'AP insuficientes' };
        }

        const yaComprado = state.articulosComprados.includes(id);
        const nuevoAp = yaComprado ? state.apTotal : state.apTotal - costoAp;
        const nuevosArticulos = yaComprado ? state.articulosComprados : [...state.articulosComprados, id];

        const update = {
          apTotal: nuevoAp,
          articulosComprados: nuevosArticulos,
        };

        if (tipo === 'escudo') {
          update.escudosRacha = (state.escudosRacha || 0) + (valor || 1);
        } else if (tipo === 'marco') {
          update.marcoEstilo = valor;
        } else if (tipo === 'mascota') {
          update.mascotaEquipada = valor;
        } else if (tipo === 'titulo') {
          update.tituloEquipado = valor;
        } else if (tipo === 'aura') {
          update.auraColor = valor;
        }

        set(update);
        return { exito: true };
      },

      // Uso del escudo de constancia
      usarEscudoRacha: () => {
        const cant = get().escudosRacha || 0;
        if (cant > 0) {
          set({ escudosRacha: cant - 1 });
          return true;
        }
        return false;
      },

      // Sumar AP de habilidad
      sumarAp: (cantidad) => {
        set((s) => ({ apTotal: (s.apTotal || 0) + cantidad }));
      },

      // Registro de resolución en memoria
      registrarMisionResuelta: ({ misionId, porcentaje, xpGanado, apGanado = 0 }) => {
        const state = get();
        const actual = state.misionesResueltas || {};
        const anterior = actual[misionId] || { intentos: 0, mejorPuntaje: 0 };

        const nuevaData = {
          completada: true,
          intentos: anterior.intentos + 1,
          mejorPuntaje: Math.max(anterior.mejorPuntaje || 0, porcentaje),
          ultimoXpGanado: xpGanado,
          ultimaFecha: new Date().toISOString(),
        };

        set({
          apTotal: (state.apTotal || 0) + apGanado,
          misionesResueltas: {
            ...actual,
            [misionId]: nuevaData,
          },
        });
      },

      esMisionResuelta: (misionId) => {
        return Boolean(get().misionesResueltas?.[misionId]?.completada);
      },

      obtenerDatosMisionResuelta: (misionId) => {
        return get().misionesResueltas?.[misionId] || null;
      },

      // Sumar XP y verificar subida de nivel
      sumarXp: (cantidad) => {
        const prevXp = get().xpTotal;
        const nextXp = prevXp + cantidad;
        const nivelPrevio = calcularNivel(prevXp);
        const nivelNuevo = calcularNivel(nextXp);

        let update = { xpTotal: nextXp };

        if (nivelNuevo.nivel > nivelPrevio.nivel) {
          update = {
            ...update,
            levelUpPendiente: {
              nivelAnterior: nivelPrevio.nivel,
              nivelNuevo: nivelNuevo.nivel,
              tituloNuevo: nivelNuevo.titulo,
              rangoNuevo: nivelNuevo.rango,
            },
            tituloEquipado: nivelNuevo.titulo,
          };
        }

        set(update);
      },

      limpiarLevelUp: () => set({ levelUpPendiente: null }),

      resetearProgreso: () => {
        set({ ...PROGRESION_BASE });
      },

      desbloquearLogro: (logroId) => {
        const actual = get().logrosDesbloqueados || [];
        if (!actual.includes(logroId)) {
          set({ logrosDesbloqueados: [...actual, logroId] });
        }
      },
    }),
    {
      name: 'eduquest_session_storage',
      storage: createJSONStorage(() => localStorage),
      // SOLO persistir autenticación y preferencias de UI
      partialize: (state) => ({
        usuario: state.usuario,
        aulaActivaId: state.aulaActivaId,
        codigoInvitacionAula: state.codigoInvitacionAula,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark' && typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);

export default useSessionStore;
