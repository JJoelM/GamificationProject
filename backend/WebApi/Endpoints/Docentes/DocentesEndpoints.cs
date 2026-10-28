using System.Security.Claims;
using Core.Application.Docentes.Consultas;
using Core.Application.Misiones.Comandos;
using Core.Application.Misiones.Consultas;
using MediatR;

namespace WebApi.Endpoints.Docentes;

public sealed record ImportarMisionesRequest(List<Guid> MisionesIds);

public static class DocentesEndpoints
{
    public static void MapDocentesEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/docentes").WithTags("Docentes")
            .RequireAuthorization(p => p.RequireRole("Docente"));

        grupo.MapGet("/metricas/{aulaId:guid}", async (
            Guid aulaId, ClaimsPrincipal usuario, IMediator mediator) =>
            Results.Ok(await mediator.Send(new ObtenerMetricasAulaQuery(aulaId, usuario.ObtenerUsuarioId()))))
            .WithName("ObtenerMetricasAula");

        grupo.MapGet("/aulas/{aulaId:guid}/alumnos", async (
            Guid aulaId, ClaimsPrincipal usuario, IMediator mediator) =>
            Results.Ok(await mediator.Send(new ObtenerAlumnosAulaQuery(aulaId, usuario.ObtenerUsuarioId()))))
            .WithName("ObtenerAlumnosAula");

        grupo.MapGet("/aulas/{aulaDestinoId:guid}/misiones-importables", async (
            Guid aulaDestinoId, ClaimsPrincipal usuario, IMediator mediator) =>
            Results.Ok(await mediator.Send(new ObtenerMisionesImportablesQuery(usuario.ObtenerUsuarioId(), aulaDestinoId))))
            .WithName("ObtenerMisionesImportables");

        grupo.MapPost("/aulas/{aulaDestinoId:guid}/importar-misiones", async (
            Guid aulaDestinoId, ImportarMisionesRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            var resultado = await mediator.Send(new ImportarMisionesCommand(
                usuario.ObtenerUsuarioId(), aulaDestinoId, request.MisionesIds));
            return Results.Ok(resultado);
        })
        .WithName("ImportarMisiones");
    }
}
