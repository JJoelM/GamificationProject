using System.Security.Claims;
using Core.Application.Misiones.Comandos;
using Core.Application.Misiones.Consultas;
using MediatR;

namespace WebApi.Endpoints.Misiones;

public sealed record DefinirMisionesSugeridasRequest(List<Guid> MisionesSugeridas);

public static class MisionesEndpoints
{
    public static void MapMisionesEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/misiones").WithTags("Misiones");

        grupo.MapPost("/", async (GenerarMisionRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            var comando = new GenerarMisionCommand(
                usuario.ObtenerUsuarioId(),
                request.AulaId,
                request.TemaCurricular,
                request.TextoFuente,
                request.Narrativa,
                request.TipoPlantilla,
                request.PayloadJson,
                request.NivelConfianzaIA,
                request.RecompensaXpSugerida);

            var misionId = await mediator.Send(comando);
            return Results.Created($"/api/misiones/{misionId}", new { misionId });
        })
        .WithName("GenerarMision")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapPost("/generar-con-ia", async (SolicitarGeneracionRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            var comando = new SolicitarGeneracionDeMisionCommand(
                usuario.ObtenerUsuarioId(),
                request.AulaId,
                request.TemaCurricular,
                request.TextoFuente,
                request.TipoPlantilla);

            var misionId = await mediator.Send(comando);
            return Results.Created($"/api/misiones/{misionId}", new { misionId });
        })
        .WithName("SolicitarGeneracionConIA")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapPut("/{id:guid}/editar", async (Guid id, EditarMisionRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            await mediator.Send(new EditarMisionCommand(
                id,
                usuario.ObtenerUsuarioId(),
                request.Narrativa,
                request.PayloadJson,
                request.RecompensaXp));

            return Results.NoContent();
        })
        .WithName("EditarMision")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapPost("/{id:guid}/validar", async (Guid id, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            await mediator.Send(new ValidarMisionCommand(id, usuario.ObtenerUsuarioId()));
            return Results.NoContent();
        })
        .WithName("ValidarMision")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapPost("/{id:guid}/rechazar", async (Guid id, RechazarMisionRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            await mediator.Send(new RechazarMisionCommand(id, usuario.ObtenerUsuarioId(), request.Motivo));
            return Results.NoContent();
        })
        .WithName("RechazarMision")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapPost("/{id:guid}/ocultar", async (Guid id, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            await mediator.Send(new OcultarMisionCommand(id, usuario.ObtenerUsuarioId()));
            return Results.NoContent();
        })
        .WithName("OcultarMision")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapPost("/{id:guid}/republicar", async (Guid id, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            await mediator.Send(new RepublicarMisionCommand(id, usuario.ObtenerUsuarioId()));
            return Results.NoContent();
        })
        .WithName("RepublicarMision")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapPut("/{id:guid}/sugeridas", async (
            Guid id, DefinirMisionesSugeridasRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            await mediator.Send(new DefinirMisionesSugeridasCommand(
                id, usuario.ObtenerUsuarioId(), request.MisionesSugeridas ?? new List<Guid>()));
            return Results.NoContent();
        })
        .WithName("DefinirMisionesSugeridas")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        // Sin route param docenteId: siempre "mis propios" borradores, con filtro opcional por aula
        grupo.MapGet("/borradores", async (
            [Microsoft.AspNetCore.Mvc.FromQuery] Guid? aulaId,
            ClaimsPrincipal usuario,
            IMediator mediator) =>
        {
            var borradores = await mediator.Send(new ObtenerBorradoresPendientesQuery(usuario.ObtenerUsuarioId(), aulaId));
            return Results.Ok(borradores);
        })
        .WithName("ObtenerBorradoresPendientes")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        // Vista del docente: todas las misiones no rechazadas del Aula + sus conexiones.
        grupo.MapGet("/aulas/{aulaId:guid}/camino", async (Guid aulaId, ClaimsPrincipal usuario, IMediator mediator) =>
            Results.Ok(await mediator.Send(new ObtenerCaminoParaDocenteQuery(aulaId, usuario.ObtenerUsuarioId()))))
        .WithName("ObtenerCaminoDocente")
        .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapGet("/activas/{aulaId:guid}", async (Guid aulaId, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            var misiones = await mediator.Send(new ObtenerMisionesActivasQuery(aulaId, usuario.ObtenerUsuarioId()));
            return Results.Ok(misiones);
        })
        .WithName("ObtenerMisionesActivas")
        .RequireAuthorization(p => p.RequireRole("Alumno"));
    }
}
