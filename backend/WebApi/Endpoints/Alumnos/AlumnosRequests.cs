using Core.Domain.Agregados.Personajes.Eventos;

namespace WebApi.Endpoints.Alumnos;

public sealed record RespuestaRequest(int IndicePregunta, string OpcionElegida);

// AlumnoId ya no viaja en el body: sale del claim usuarioId del JWT.
// Sirve para OpcionMultiple y BatallaDeJefe -- misma forma de respuesta.
public sealed record ResolverMisionRequest(List<RespuestaRequest> Respuestas);

// Forma distinta a proposito: un orden, no una lista de respuestas por indice.
public sealed record ResolverOrdenTemporalRequest(List<string> OrdenPropuesto, string EventoCulpableElegido);

public sealed record ComprarArticuloRequest(string ArticuloId, int CostoAp, TipoArticulo Tipo, string Valor, Guid? AulaId = null);

public sealed record PersonalizarPersonajeRequest(string? AvatarId, string? Marco, string? Mascota);
