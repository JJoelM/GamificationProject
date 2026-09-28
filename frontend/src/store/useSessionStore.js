import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MOCK_IDS } from '../config/env';

/**
 * useSessionStore — Estado global de sesión, tema, audio, progresión RPG y Bazar
 *
 * ESPECIFICACIÓN DE PERSISTENCIA Y MULTI-USUARIO:
 * · Sin guardar tokens en storage — el navegador maneja la cookie HttpOnly.
 * · El progreso de juego (XP, AP, logros, avatar, bazar) se almacena particionado
 *   por usuario en `progresosPorUsuario[usuarioId]`.
 * · Al cerrar sesión, la pantalla se limpia para el siguiente usuario, pero los
 *   datos del alumno NO se pierden. Al volver a iniciar sesión, se restaura su XP y AP.
 * · Si el backend está disponible, se hidrata además desde `GET /api/alumnos/personaje/{aulaId}`.
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

/** Estado base inicial de progresión RPG para un nuevo usuario */
const PROGRESION_BASE = {
  xpTotal: 0,
  apTotal: 0,
  rachaDias: 0,
  escudosRacha: 0,
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

  // Historial de misiones resueltas: { [misionId]: { completada, intentos, mejorPuntaje, ultimaFecha } }
  misionesResueltas: {},
};

function extraerProgresoDeState(state) {
  return {
    xpTotal: state.xpTotal ?? 0,
    apTotal: state.apTotal ?? 0,
    rachaDias: state.rachaDias ?? 0,
    escudosRacha: state.escudosRacha ?? 0,
    mejoraSemanal: state.mejoraSemanal ?? 0,
    tituloEquipado: state.tituloEquipado ?? 'Iniciado del Saber',
    logrosDesbloqueados: state.logrosDesbloqueados ?? [],
    avatarEquipado: state.avatarEquipado ?? 'erudito_arcano',
    auraColor: state.auraColor ?? '#2563EB',
    marcoEstilo: state.marcoEstilo ?? 'scroll',
    mascotaEquipada: state.mascotaEquipada ?? 'buho_erudito',
    articulosComprados: state.articulosComprados ?? [],
    misionesResueltas: state.misionesResueltas ?? {},
  };
}

const useSessionStore = create(
  persist(
    (set, get) => ({
      // ── Sesión y Preferencias ──
      usuario: null,
      aulaActivaId: MOCK_IDS.aulaId || '33333333-3333-3333-3333-333333333333',
      codigoInvitacionAula: null,
      theme: 'light',
      soundEnabled: true,

      // ── Progreso del usuario activo ──
      ...PROGRESION_BASE,

      // ── Diccionario de progresos por usuario (persiste entre sesiones sin leaking) ──
      progresosPorUsuario: {},

      // ── Acciones de autenticación y sesión ──
      setUsuario: (usuario) => {
        if (!usuario) {
          set({ usuario: null, ...PROGRESION_BASE });
          return;
        }

        const uId = usuario.usuarioId;
        const historial = get().progresosPorUsuario?.[uId];

        if (historial) {
          // Restaurar progreso guardado del alumno
          set({
            usuario,
            ...historial,
            levelUpPendiente: null,
          });
        } else {
          // Inicializar progreso nuevo y registrarlo
          const nuevoProgreso = { ...PROGRESION_BASE };
          set((s) => ({
            usuario,
            ...nuevoProgreso,
            progresosPorUsuario: {
              ...(s.progresosPorUsuario || {}),
              [uId]: nuevoProgreso,
            },
          }));
        }
      },

      clearUsuario: () => {
        // Guarda el estado del usuario saliente en el mapa antes de desloguear
        const usuarioActual = get().usuario;
        if (usuarioActual?.usuarioId) {
          const uId = usuarioActual.usuarioId;
          const dataActual = extraerProgresoDeState(get());
          set((s) => ({
            usuario: null,
            ...PROGRESION_BASE,
            progresosPorUsuario: {
              ...(s.progresosPorUsuario || {}),
              [uId]: dataActual,
            },
          }));
        } else {
          set({ usuario: null, ...PROGRESION_BASE });
        }
      },

      /**
       * Hidrata el progreso del alumno desde la respuesta del backend
       */
      hidratarProgreso: (datos) => {
        const uId = get().usuario?.usuarioId;
        const actual = get();

        const xp = Math.max(datos.experienciaXP ?? 0, actual.xpTotal ?? 0);
        const ap = Math.max(datos.puntosAccionAP ?? 0, actual.apTotal ?? 0);
        const racha = Math.max(datos.rachaDiasActivos ?? 0, actual.rachaDias ?? 0);

        const update = {
          xpTotal: xp,
          apTotal: ap,
          rachaDias: racha,
          escudosRacha: datos.escudosRachaDisponibles ?? actual.escudosRacha,
          avatarEquipado: datos.avatarEquipado ?? actual.avatarEquipado,
          auraColor: datos.auraColor ?? actual.auraColor,
          marcoEstilo: datos.marcoEstilo ?? actual.marcoEstilo,
          mascotaEquipada: datos.mascotaEquipada ?? actual.mascotaEquipada,
          tituloEquipado: datos.tituloEquipado ?? calcularNivel(xp).titulo,
          logrosDesbloqueados: datos.logrosDesbloqueados ?? actual.logrosDesbloqueados,
          articulosComprados: datos.articulosComprados ?? actual.articulosComprados,
        };

        set((s) => ({
          ...update,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  ...update,
                },
              }
            : s.progresosPorUsuario,
        }));
      },

      resetearProgreso: () => {
        const uId = get().usuario?.usuarioId;
        set((s) => ({
          ...PROGRESION_BASE,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: { ...PROGRESION_BASE },
              }
            : s.progresosPorUsuario,
        }));
      },

      // Aula
      setAulaActivaId: (aulaActivaId) => set({ aulaActivaId }),
      setCodigoInvitacion: (codigo) => set({ codigoInvitacionAula: codigo }),

      // Tema
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

      // Personalización de avatar y cosméticos
      setAvatarEquipado: (avatarId) => {
        const uId = get().usuario?.usuarioId;
        set((s) => ({
          avatarEquipado: avatarId,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  avatarEquipado: avatarId,
                },
              }
            : s.progresosPorUsuario,
        }));
      },

      setAuraColor: (auraColor) => {
        const uId = get().usuario?.usuarioId;
        set((s) => ({
          auraColor,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  auraColor,
                },
              }
            : s.progresosPorUsuario,
        }));
      },

      setMarcoEstilo: (marcoEstilo) => {
        const uId = get().usuario?.usuarioId;
        set((s) => ({
          marcoEstilo,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  marcoEstilo,
                },
              }
            : s.progresosPorUsuario,
        }));
      },

      setMascotaEquipada: (mascotaId) => {
        const uId = get().usuario?.usuarioId;
        set((s) => ({
          mascotaEquipada: mascotaId,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  mascotaEquipada: mascotaId,
                },
              }
            : s.progresosPorUsuario,
        }));
      },

      // Bazar: comprar y equipar artículos con AP
      comprarArticulo: ({ id, costoAp, tipo, valor }) => {
        const state = get();
        const uId = state.usuario?.usuarioId;
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

        set((s) => ({
          ...update,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  ...update,
                },
              }
            : s.progresosPorUsuario,
        }));

        return { exito: true };
      },

      // Uso del escudo de constancia
      usarEscudoRacha: () => {
        const state = get();
        const cant = state.escudosRacha || 0;
        const uId = state.usuario?.usuarioId;
        if (cant > 0) {
          const nuevo = cant - 1;
          set((s) => ({
            escudosRacha: nuevo,
            progresosPorUsuario: uId
              ? {
                  ...(s.progresosPorUsuario || {}),
                  [uId]: {
                    ...((s.progresosPorUsuario || {})[uId] || {}),
                    escudosRacha: nuevo,
                  },
                }
              : s.progresosPorUsuario,
          }));
          return true;
        }
        return false;
      },

      // Sumar AP de habilidad
      sumarAp: (cantidad) => {
        const state = get();
        const uId = state.usuario?.usuarioId;
        const nuevoAp = (state.apTotal || 0) + cantidad;
        set((s) => ({
          apTotal: nuevoAp,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  apTotal: nuevoAp,
                },
              }
            : s.progresosPorUsuario,
        }));
      },

      // Registro de resolución y control de repaso
      registrarMisionResuelta: ({ misionId, porcentaje, xpGanado, apGanado = 0 }) => {
        const state = get();
        const uId = state.usuario?.usuarioId;
        const actual = state.misionesResueltas || {};
        const anterior = actual[misionId] || { intentos: 0, mejorPuntaje: 0 };

        const nuevaData = {
          completada: true,
          intentos: anterior.intentos + 1,
          mejorPuntaje: Math.max(anterior.mejorPuntaje || 0, porcentaje),
          ultimoXpGanado: xpGanado,
          ultimaFecha: new Date().toISOString(),
        };

        const nuevoAp = (state.apTotal || 0) + apGanado;
        const nuevasResueltas = {
          ...actual,
          [misionId]: nuevaData,
        };

        set((s) => ({
          apTotal: nuevoAp,
          misionesResueltas: nuevasResueltas,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  apTotal: nuevoAp,
                  misionesResueltas: nuevasResueltas,
                },
              }
            : s.progresosPorUsuario,
        }));
      },

      esMisionResuelta: (misionId) => {
        const resueltas = get().misionesResueltas || {};
        return Boolean(resueltas[misionId]?.completada);
      },

      // Progresión XP y Level Up
      sumarXp: (cantidad) => {
        const state = get();
        const uId = state.usuario?.usuarioId;
        const anteriorXp = state.xpTotal || 0;
        const nuevaXp = anteriorXp + cantidad;
        const nivelAnterior = calcularNivel(anteriorXp).nivel;
        const nivelNuevo = calcularNivel(nuevaXp).nivel;

        const stateUpdate = { xpTotal: nuevaXp };

        if (nivelNuevo > nivelAnterior) {
          stateUpdate.levelUpPendiente = calcularNivel(nuevaXp);
          stateUpdate.tituloEquipado = calcularNivel(nuevaXp).titulo;
        }

        set((s) => ({
          ...stateUpdate,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  ...stateUpdate,
                },
              }
            : s.progresosPorUsuario,
        }));

        return { nivelSubido: nivelNuevo > nivelAnterior, nivelNuevo };
      },

      cerrarLevelUp: () => set({ levelUpPendiente: null }),

      setTituloEquipado: (titulo) => {
        const uId = get().usuario?.usuarioId;
        set((s) => ({
          tituloEquipado: titulo,
          progresosPorUsuario: uId
            ? {
                ...(s.progresosPorUsuario || {}),
                [uId]: {
                  ...((s.progresosPorUsuario || {})[uId] || {}),
                  tituloEquipado: titulo,
                },
              }
            : s.progresosPorUsuario,
        }));
      },

      desbloquearLogro: (logroId) => {
        const state = get();
        const uId = state.usuario?.usuarioId;
        const actual = state.logrosDesbloqueados || [];
        if (!actual.includes(logroId)) {
          const nuevosLogros = [...actual, logroId];
          set((s) => ({
            logrosDesbloqueados: nuevosLogros,
            progresosPorUsuario: uId
              ? {
                  ...(s.progresosPorUsuario || {}),
                  [uId]: {
                    ...((s.progresosPorUsuario || {})[uId] || {}),
                    logrosDesbloqueados: nuevosLogros,
                  },
                }
              : s.progresosPorUsuario,
          }));
        }
      },
    }),
    {
      name: 'eduquest_session_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuario: state.usuario,
        aulaActivaId: state.aulaActivaId,
        codigoInvitacionAula: state.codigoInvitacionAula,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        progresosPorUsuario: state.progresosPorUsuario,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark' && typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
        // Si hay un usuario activo restaurado de la sesión, asegurar que su progreso esté cargado
        if (state?.usuario?.usuarioId && state?.progresosPorUsuario) {
          const uId = state.usuario.usuarioId;
          const saved = state.progresosPorUsuario[uId];
          if (saved) {
            Object.assign(state, saved);
          }
        }
      },
    }
  )
);

export default useSessionStore;
