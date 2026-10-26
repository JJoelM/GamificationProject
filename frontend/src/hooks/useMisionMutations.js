import { useMutation, useQueryClient } from '@tanstack/react-query';
import { misionesApi, alumnosApi } from '../services/api';
import useSessionStore from '../store/useSessionStore';
import { playSuccess, playChime } from '../utils/audio';

/**
 * useGenerarMisionIa — Mutación para pedir a la IA que cree un borrador de misión
 * POST /api/misiones/generar-con-ia
 */
export function useGenerarMisionIa() {
  const queryClient = useQueryClient();
  const aulaId = useSessionStore((s) => s.aulaActivaId);

  return useMutation({
    mutationFn: async ({ temaCurricular, textoFuente, tipoPlantilla }) => {
      try {
        return await misionesApi.generarConIa({
          aulaId,
          temaCurricular,
          textoFuente,
          tipoPlantilla,
        });
      } catch (err) {
        if (!err.isApiError) {
          // Mock fallback
          return { misionId: 'mock-ia-' + Date.now() };
        }
        throw err;
      }
    },
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['misiones', 'borradores'] });
    },
  });
}

/**
 * useEditarMision — Mutación para editar la narrativa, XP y preguntas de un borrador
 * PUT /api/misiones/{id}/editar
 */
export function useEditarMision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ misionId, narrativa, payloadJson, recompensaXp }) => {
      try {
        return await misionesApi.editar(misionId, {
          narrativa,
          payloadJson,
          recompensaXp,
        });
      } catch (err) {
        if (!err.isApiError) {
          return null;
        }
        throw err;
      }
    },
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['misiones', 'borradores'] });
    },
  });
}

/**
 * useValidarMision — Mutación HITL para aprobar un borrador y publicarlo
 * POST /api/misiones/{id}/validar
 */
export function useValidarMision() {
  const queryClient = useQueryClient();
  const aulaId = useSessionStore((s) => s.aulaActivaId);

  return useMutation({
    mutationFn: async (misionId) => {
      try {
        return await misionesApi.validar(misionId);
      } catch (err) {
        if (!err.isApiError) {
          return null;
        }
        throw err;
      }
    },
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['misiones', 'borradores'] });
      queryClient.invalidateQueries({ queryKey: ['misiones', 'activas', aulaId] });
    },
  });
}

/**
 * useRechazarMision — Mutación HITL para descartar un borrador de IA con motivo
 * POST /api/misiones/{id}/rechazar
 */
export function useRechazarMision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ misionId, motivo }) => {
      try {
        return await misionesApi.rechazar(misionId, { motivo });
      } catch (err) {
        if (!err.isApiError) {
          return null;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misiones', 'borradores'] });
    },
  });
}

/**
 * useResolverMision — Mutación para enviar respuestas y recibir feedback pedagógico inmediato
 * POST /api/alumnos/misiones/{misionId}/resolver
 */
export function useResolverMision() {
  const queryClient = useQueryClient();
  const sumarXp = useSessionStore((s) => s.sumarXp);
  const sumarAp = useSessionStore((s) => s.sumarAp);
  const desbloquearLogro = useSessionStore((s) => s.desbloquearLogro);
  const registrarMisionResuelta = useSessionStore((s) => s.registrarMisionResuelta);
  const esMisionResuelta = useSessionStore((s) => s.esMisionResuelta);

  return useMutation({
    mutationFn: async ({ misionId, respuestas, preguntasOriginales = [] }) => {
      const eraRepasoPrevio = esMisionResuelta(misionId);

      try {
        const resultado = await alumnosApi.resolverMision(misionId, { respuestas });
        
        // Si el backend no calculó AP o devolvió 0 pero el alumno aprobó, aseguramos una recompensa lúdica mínima
        const apGanado = resultado.apGanado && resultado.apGanado > 0
          ? resultado.apGanado
          : ((resultado.porcentajeCorrecto || 0) >= 50 ? 25 : 0);

        if (resultado?.xpGanado) {
          sumarXp(resultado.xpGanado);
          desbloquearLogro('primer_paso');
          if (resultado.porcentajeCorrecto === 100) {
            desbloquearLogro('mente_critica');
          }
          if (resultado.esRepaso || eraRepasoPrevio) {
            desbloquearLogro('repaso_magistral');
          }
        }

        if (apGanado > 0) {
          sumarAp(apGanado);
        }

        registrarMisionResuelta({
          misionId,
          porcentaje: resultado.porcentajeCorrecto || 0,
          xpGanado: resultado.xpGanado || 0,
          apGanado,
        });

        return {
          ...resultado,
          apGanado,
        };
      } catch (err) {
        // Mock fallback offline o para misiones de prueba hardcodeadas (404/401)
        if (!err.isApiError || err.status === 404 || err.status === 401) {
          let aciertos = 0;
          const feedback = respuestas.map((r, idx) => {
            const pregunta = preguntasOriginales[idx];
            let respuestaCorrectaEsperada = pregunta?.respuestaCorrecta;
            if (!respuestaCorrectaEsperada) {
              if (misionId === 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f') {
                const respuestasJefe = [
                  'O(N)',
                  'Condición de carrera (Race Condition)',
                  'Tabla Hash (Hash Map)',
                ];
                respuestaCorrectaEsperada = respuestasJefe[idx] || pregunta?.opciones?.[0];
              } else {
                respuestaCorrectaEsperada = pregunta?.opciones?.[0] || 'Opción A';
              }
            }

            const esCorrecta = r.opcionElegida === respuestaCorrectaEsperada;
            if (esCorrecta) aciertos++;

            return {
              indicePregunta: idx,
              esCorrecta,
              respuestaCorrecta: respuestaCorrectaEsperada,
              explicacion:
                pregunta?.explicacion ||
                (esCorrecta
                  ? '¡Excelente deducción! El concepto fue aplicado correctamente.'
                  : 'Se requería analizar con precisión la causa y la complejidad del problema.'),
            };
          });

          const total = respuestas.length || 1;
          const porcentajeCorrecto = Math.round((aciertos / total) * 100);
          // Si es repaso, otorgamos recompensa adaptada de repaso
          const baseXP = eraRepasoPrevio ? 75 : 150;
          const xpGanado = Math.round((porcentajeCorrecto / 100) * baseXP);
          const apGanado = porcentajeCorrecto >= 50 ? (eraRepasoPrevio ? 15 : 30) : 0;

          sumarXp(xpGanado);
          if (apGanado > 0) {
            sumarAp(apGanado);
          }

          desbloquearLogro('primer_paso');
          if (porcentajeCorrecto === 100) {
            desbloquearLogro('mente_critica');
          }
          if (eraRepasoPrevio) {
            desbloquearLogro('repaso_magistral');
          }

          registrarMisionResuelta({
            misionId,
            porcentaje: porcentajeCorrecto,
            xpGanado,
            apGanado,
          });

          return {
            porcentajeCorrecto,
            xpGanado,
            apGanado,
            esRepaso: eraRepasoPrevio,
            feedback,
          };
        }
        throw err;
      }
    },
    onSuccess: () => {
      playChime();
      queryClient.invalidateQueries({ queryKey: ['personaje'] });
    },
  });
}

/**
 * useResolverMisionOrdenTemporal — Mutación para resolver misiones de Línea Temporal
 * POST /api/alumnos/misiones/{misionId}/resolver-orden-temporal
 */
export function useResolverMisionOrdenTemporal() {
  const queryClient = useQueryClient();
  const sumarXp = useSessionStore((s) => s.sumarXp);
  const sumarAp = useSessionStore((s) => s.sumarAp);
  const desbloquearLogro = useSessionStore((s) => s.desbloquearLogro);
  const registrarMisionResuelta = useSessionStore((s) => s.registrarMisionResuelta);
  const esMisionResuelta = useSessionStore((s) => s.esMisionResuelta);

  return useMutation({
    mutationFn: async ({
      misionId,
      ordenPropuesto,
      eventoCulpableElegido,
      eventosOriginales = [],
      eventoCulpableOriginalId = '',
    }) => {
      const eraRepasoPrevio = esMisionResuelta(misionId);

      try {
        const resultado = await alumnosApi.resolverOrdenTemporal(misionId, {
          ordenPropuesto,
          eventoCulpableElegido,
        });

        const apGanado = resultado.apGanado && resultado.apGanado > 0
          ? resultado.apGanado
          : ((resultado.porcentajeCorrecto || 0) >= 50 ? 25 : 0);

        if (resultado?.xpGanado) {
          sumarXp(resultado.xpGanado);
          desbloquearLogro('primer_paso');
          if (resultado.porcentajeCorrecto === 100) {
            desbloquearLogro('mente_critica');
          }
          if (resultado.esRepaso || eraRepasoPrevio) {
            desbloquearLogro('repaso_magistral');
          }
        }

        if (apGanado > 0) {
          sumarAp(apGanado);
        }

        registrarMisionResuelta({
          misionId,
          porcentaje: resultado.porcentajeCorrecto || 0,
          xpGanado: resultado.xpGanado || 0,
          apGanado,
        });

        return {
          ...resultado,
          apGanado,
        };
      } catch (err) {
        // Mock fallback offline o para misiones de prueba hardcodeadas (404/401)
        if (!err.isApiError || err.status === 404 || err.status === 401) {
          const ordenCorrectoEsperado =
            misionId === 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a'
              ? ['ev-auth', 'ev-deposito', 'ev-retiro', 'ev-sync']
              : eventosOriginales.map((e) => e.id);

          const culpableEsperado =
            misionId === 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a'
              ? 'ev-retiro'
              : eventoCulpableOriginalId || ordenPropuesto[0];

          let aciertos = 0;
          ordenPropuesto.forEach((id, idx) => {
            if (id === ordenCorrectoEsperado[idx]) aciertos++;
          });
          const total = ordenPropuesto.length || 1;
          const porcentajeOrden = Math.round((aciertos / total) * 70);
          const culpableCorrecto = Boolean(eventoCulpableElegido === culpableEsperado);
          const bonusCulpable = culpableCorrecto ? 30 : 0;
          const porcentajeCorrecto = Math.min(100, porcentajeOrden + bonusCulpable);

          const baseXP = eraRepasoPrevio ? 75 : 150;
          const xpGanado = Math.round((porcentajeCorrecto / 100) * baseXP);
          const apGanado = porcentajeCorrecto >= 50 ? (eraRepasoPrevio ? 15 : 30) : 0;

          sumarXp(xpGanado);
          if (apGanado > 0) sumarAp(apGanado);

          desbloquearLogro('primer_paso');
          if (porcentajeCorrecto === 100) desbloquearLogro('mente_critica');
          if (eraRepasoPrevio) desbloquearLogro('repaso_magistral');

          registrarMisionResuelta({
            misionId,
            porcentaje: porcentajeCorrecto,
            xpGanado,
            apGanado,
          });

          return {
            porcentajeCorrecto,
            culpableIdentificadoCorrectamente: culpableCorrecto,
            explicacionCorrecta:
              'El cajero automático entregó efectivo antes de que el servidor validara si el saldo era suficiente para cubrir el retiro.',
            ordenCorrecto: ordenCorrectoEsperado,
            eventoCulpableId: culpableEsperado,
            xpGanado,
            apGanado,
            esRepaso: eraRepasoPrevio,
          };
        }
        throw err;
      }
    },
    onSuccess: () => {
      playChime();
      queryClient.invalidateQueries({ queryKey: ['personaje'] });
    },
  });
}
