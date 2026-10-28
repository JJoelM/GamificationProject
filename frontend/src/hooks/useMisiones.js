import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { misionesApi, docentesApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';

// ── Mock data (solo activos si VITE_USE_MOCK=true en .env.development) ──────
const MOCK_BORRADORES = [
  {
    misionId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    aulaId: '33333333-3333-3333-3333-333333333333',
    temaCurricular: 'Revolución de Mayo y el Cabildo Abierto',
    narrativa:
      'El virrey Cisneros ha convocado al pueblo ante los rumores de España. Los patriotas se reúnen en la plaza para exigir un cabildo abierto que decida el futuro de la nación.',
    tipoPlantilla: 'OpcionMultiple',
    nivelConfianzaIA: 94,
    recompensaXpSugerida: 150,
    payloadJson: JSON.stringify({
      preguntas: [
        {
          enunciado: '¿En qué año se llevó a cabo el Cabildo Abierto de Mayo?',
          opciones: ['1810', '1816', '1820', '1806'],
          respuestaCorrecta: '1810',
          explicacion: 'El 25 de mayo de 1810 se formó el primer gobierno patrio en Buenos Aires.',
        },
        {
          enunciado: '¿Quién presidió la Primera Junta de Gobierno?',
          opciones: ['Cornelio Saavedra', 'Mariano Moreno', 'Manuel Belgrano', 'Juan José Paso'],
          respuestaCorrecta: 'Cornelio Saavedra',
          explicacion: 'Cornelio Saavedra fue electo presidente de la Junta Provisional Gubernativa.',
        },
      ],
    }),
  },
];

export const MOCK_MISIONES_ACTIVAS = [
  {
    misionId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    aulaId: '33333333-3333-3333-3333-333333333333',
    temaCurricular: 'Historia: Revolución de Mayo',
    narrativa:
      'El virrey Cisneros ha convocado al pueblo ante los rumores de España. Los patriotas se reúnen en la plaza para exigir un cabildo abierto que decida el futuro de la nación.',
    tipoPlantilla: 'OpcionMultiple',
    recompensaXp: 150,
    payloadJson: JSON.stringify({
      preguntas: [
        {
          enunciado: '¿En qué año se llevó a cabo el Cabildo Abierto de Mayo?',
          opciones: ['1810', '1816', '1820', '1806'],
          respuestaCorrecta: '1810',
          explicacion: 'El 25 de mayo de 1810 se formó el primer gobierno patrio en Buenos Aires.',
        },
        {
          enunciado: '¿Quién presidió la Primera Junta de Gobierno?',
          opciones: ['Cornelio Saavedra', 'Mariano Moreno', 'Manuel Belgrano', 'Juan José Paso'],
          respuestaCorrecta: 'Cornelio Saavedra',
          explicacion: 'Cornelio Saavedra fue electo presidente de la Junta Provisional Gubernativa.',
        },
      ],
    }),
  },
  {
    misionId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    aulaId: '33333333-3333-3333-3333-333333333333',
    temaCurricular: 'Algoritmos: Batalla de Jefe',
    narrativa:
      'El Bug Ancestral ha despertado en las profundidades del código fuente. Desata ciclos infinitos y corrompe la memoria. ¡Enfréntalo con tus mejores tácticas de optimización!',
    tipoPlantilla: 'BatallaDeJefe',
    recompensaXp: 220,
    payloadJson: JSON.stringify({
      nombreJefe: 'El Bug Ancestral',
      hpMaximo: 100,
      varianteArte: 'capas',
      fases: [
        {
          enunciado: 'El jefe invoca una búsqueda lineal sobre 1.000.000 de elementos desordenados. ¿Cuál es la complejidad temporal en el peor caso?',
          opciones: ['O(N)', 'O(log N)', 'O(1)', 'O(N^2)'],
          danioAlJefe: 35,
          penalizacionFallo: 'temblor',
          respuestaCorrecta: 'O(N)',
          explicacion: 'En el peor caso de búsqueda lineal sin ordenar se debe examinar cada elemento hasta el final: O(N).',
        },
        {
          enunciado: 'El jefe intenta mutar un estado compartido entre múltiples hilos sin sincronización. ¿Qué problema crítico ocurre?',
          opciones: ['Condición de carrera (Race Condition)', 'Stack Overflow', 'Segmentation Fault', 'Buffer Underrun'],
          danioAlJefe: 35,
          penalizacionFallo: 'destello',
          respuestaCorrecta: 'Condición de carrera (Race Condition)',
          explicacion: 'Múltiples accesos concurrentes de escritura no sincronizados causan condiciones de carrera.',
        },
        {
          enunciado: 'Para el golpe de gracia: ¿Qué estructura de datos permite inserción y búsqueda en tiempo promedio O(1)?',
          opciones: ['Tabla Hash (Hash Map)', 'Árbol Binario de Búsqueda', 'Lista Enlazada', 'Grafo no ponderado'],
          danioAlJefe: 30,
          penalizacionFallo: 'enfriamiento',
          respuestaCorrecta: 'Tabla Hash (Hash Map)',
          explicacion: 'Las tablas hash calculan el índice mediante función hash promediando tiempo constante O(1).',
        },
      ],
    }),
  },
  {
    misionId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    aulaId: '33333333-3333-3333-3333-333333333333',
    temaCurricular: 'Sistemas: Línea Temporal',
    narrativa:
      'Una inconsistencia temporal provocó que un cliente retirara más dinero del que poseía en su cuenta. Reconstruye el orden cronológico de los eventos y acusa a la causa raíz.',
    tipoPlantilla: 'LineaTemporal',
    recompensaXp: 180,
    payloadJson: JSON.stringify({
      estadoErroneoDescripcion: 'El saldo del usuario quedó en -$5.000 y el sistema permitió el retiro sin validación previa.',
      eventosDesordenados: [
        { id: 'ev-auth', descripcion: 'El usuario inicia sesión exitosamente en el cajero automático' },
        { id: 'ev-deposito', descripcion: 'Se acredita un depósito previo de $2.000 en su caja de ahorro' },
        { id: 'ev-retiro', descripcion: 'El cajero entrega $7.000 en efectivo sin verificar el saldo disponible' },
        { id: 'ev-sync', descripcion: 'El servidor central sincroniza el saldo negativo y genera una alerta' },
      ],
      ordenCorrecto: ['ev-auth', 'ev-deposito', 'ev-retiro', 'ev-sync'],
      eventoCulpableId: 'ev-retiro',
      explicacionCorrecta: 'El retiro de efectivo se autorizó antes de la validación del saldo disponible en cuenta.',
    }),
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * useBorradoresDocente — Query de misiones en borrador pendientes de revisión (HITL)
 * GET /api/misiones/borradores (extrae docenteId del JWT en cookie)
 */
export function useBorradoresDocente(aulaIdOverride) {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const aulaId = aulaIdOverride || aulaActivaId;

  return useQuery({
    queryKey: ['misiones', 'borradores', aulaId],
    queryFn: USE_MOCK
      ? () => Promise.resolve(MOCK_BORRADORES)
      : () => misionesApi.getBorradores(aulaId),
    enabled: Boolean(usuario && usuario.rol === 'Docente'),
  });
}

/**
 * useMisionesActivas — Query de todas las misiones activas en el aula para el alumno
 * GET /api/misiones/activas/{aulaId}
 */
export function useMisionesActivas() {
  const aulaId = useSessionStore((s) => s.aulaActivaId);
  const usuario = useSessionStore((s) => s.usuario);
  const registrarMisionResuelta = useSessionStore((s) => s.registrarMisionResuelta);

  return useQuery({
    queryKey: ['misiones', 'activas', aulaId],
    queryFn: async () => {
      const data = USE_MOCK
        ? await Promise.resolve(MOCK_MISIONES_ACTIVAS)
        : await misionesApi.getActivas(aulaId);

      // Hidratar misiones resueltas en Zustand si vienen del backend tras un refresh
      if (Array.isArray(data)) {
        data.forEach((m) => {
          if (m.completada) {
            registrarMisionResuelta({
              misionId: m.misionId,
              porcentaje: m.mejorPorcentaje ?? 100,
              xpGanado: m.recompensaXp ?? 0,
              apGanado: 0,
            });
          }
        });
      }

      return data;
    },
    enabled: Boolean(aulaId && (!usuario || usuario.rol === 'Alumno')),
  });
}

/**
 * useMisionesImportables — Consulta misiones validadas u ocultas en otras aulas del docente
 * GET /api/docentes/aulas/{aulaDestinoId}/misiones-importables
 */
export function useMisionesImportables(aulaDestinoId) {
  const usuario = useSessionStore((s) => s.usuario);
  const aulaActivaId = useSessionStore((s) => s.aulaActivaId);
  const targetId = aulaDestinoId || aulaActivaId;

  return useQuery({
    queryKey: ['docentes', 'misiones-importables', targetId],
    queryFn: () => docentesApi.getMisionesImportables(targetId),
    enabled: Boolean(targetId && usuario?.rol === 'Docente'),
  });
}

/**
 * useImportarMisiones — Importa misiones de otras aulas hacia el aula activa
 * POST /api/docentes/aulas/{aulaDestinoId}/importar-misiones
 */
export function useImportarMisiones() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ aulaDestinoId, misionesIds }) =>
      docentesApi.importarMisiones(aulaDestinoId, { misionesIds }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['misiones', 'borradores', variables.aulaDestinoId] });
      queryClient.invalidateQueries({ queryKey: ['camino-docente', variables.aulaDestinoId] });
      queryClient.invalidateQueries({ queryKey: ['docentes', 'misiones-importables', variables.aulaDestinoId] });
    },
  });
}
