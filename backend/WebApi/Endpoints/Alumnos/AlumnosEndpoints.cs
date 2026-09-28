using System.Security.Claims;
using Core.Application.Personajes.Comandos;
using Core.Domain.Agregados.Misiones;
using MediatR;

namespace WebApi.Endpoints.Alumnos;

public static class AlumnosEndpoints
{
    public static void MapAlumnosEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/alumnos").WithTags("Alumnos");

        grupo.MapPost("/misiones/{misionId:guid}/resolver", async (
            Guid misionId, ResolverMisionRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            var respuestas = request.Respuestas
                .Select(r => new RespuestaAlumno(r.IndicePregunta, r.OpcionElegida))
                .ToList();

            var comando = new ResolverMisionCommand(
                misionId, usuario.ObtenerUsuarioId(), respuestas, DateOnly.FromDateTime(DateTime.UtcNow));

            var resultado = await mediator.Send(comando);
            return Results.Ok(resultado);
        })
        .WithName("ResolverMision")
        .RequireAuthorization(p => p.RequireRole("Alumno"));

        grupo.MapGet("/personaje/{aulaId:guid}", async (
            Guid aulaId, ClaimsPrincipal usuario, Core.Domain.Agregados.Personajes.IRepositorioPersonajes repositorio) =>
        {
            var alumnoId = usuario.ObtenerUsuarioId();
            var personajeId = Core.Domain.SeedWork.IdentidadCompuesta.Combinar(alumnoId, aulaId);
            var personaje = await repositorio.ObtenerPorIdAsync(personajeId);

            if (personaje is null)
            {
                return Results.Ok(new
                {
                    experienciaXP = 0,
                    puntosAccionAP = 0,
                    rachaDiasActivos = 0,
                    aulaId,
                    alumnoId,
                });
            }

            return Results.Ok(new
            {
                experienciaXP = personaje.ExperienciaXP,
                puntosAccionAP = personaje.PuntosAccionAP,
                rachaDiasActivos = personaje.RachaDiasActivos,
                aulaId,
                alumnoId,
            });
        })
        .WithName("ObtenerPersonaje")
        .RequireAuthorization(p => p.RequireRole("Alumno"));
    }
}
