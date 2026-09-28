import { useQuery } from '@tanstack/react-query';
import { misionesApi } from '../services/api';
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
    nivelConfianzaIA: 0.94,
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

const MOCK_MISIONES_ACTIVAS = [
  {
    misionId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    aulaId: '33333333-3333-3333-3333-333333333333',
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
    misionId: 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    aulaId: '33333333-3333-3333-3333-333333333333',
    narrativa:
      'Explora los fundamentos de la energía solar y cómo los paneles fotovoltaicos transforman la radiación en electricidad utilizable en nuestros hogares.',
    tipoPlantilla: 'OpcionMultiple',
    recompensaXp: 120,
    payloadJson: JSON.stringify({
      preguntas: [
        {
          enunciado: '¿Qué tipo de radiación aprovechan las celdas solares?',
          opciones: [
            'Radiación solar electromagnética',
            'Calor geotérmico',
            'Ondas de radio',
            'Viento atmosférico',
          ],
          respuestaCorrecta: 'Radiación solar electromagnética',
          explicacion: 'El efecto fotovoltaico convierte la luz solar directamente en electricidad.',
        },
      ],
    }),
  },
];

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * useBorradoresDocente — Query de misiones en borrador pendientes de revisión (HITL)
 * GET /api/misiones/borradores (extrae docenteId del JWT en cookie)
 */
export function useBorradoresDocente() {
  const usuario = useSessionStore((s) => s.usuario);

  return useQuery({
    queryKey: ['misiones', 'borradores'],
    queryFn: USE_MOCK
      ? () => Promise.resolve(MOCK_BORRADORES)
      : () => misionesApi.getBorradores(),
    enabled: Boolean(usuario && usuario.rol === 'Docente'),
    // React Query maneja reintentos y el estado isError automáticamente —
    // no catch manual aquí para que los errores de API se propaguen correctamente.
  });
}

/**
 * useMisionesActivas — Query de todas las misiones activas en el aula para el alumno
 * GET /api/misiones/activas/{aulaId}
 */
export function useMisionesActivas() {
  const aulaId = useSessionStore((s) => s.aulaActivaId);
  const usuario = useSessionStore((s) => s.usuario);

  return useQuery({
    queryKey: ['misiones', 'activas', aulaId],
    queryFn: USE_MOCK
      ? () => Promise.resolve(MOCK_MISIONES_ACTIVAS)
      : () => misionesApi.getActivas(aulaId),
    enabled: Boolean(aulaId && usuario?.rol === 'Alumno'),
  });
}
