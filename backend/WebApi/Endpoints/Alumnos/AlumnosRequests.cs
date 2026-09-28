namespace WebApi.Endpoints.Alumnos;

public sealed record RespuestaRequest(int IndicePregunta, string OpcionElegida);

// AlumnoId ya no viaja en el body: sale del claim usuarioId del JWT.
public sealed record ResolverMisionRequest(List<RespuestaRequest> Respuestas);
