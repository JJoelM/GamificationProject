using System.Security.Claims;
using Core.Application.Misiones.Consultas;
using MediatR;

namespace WebApi.Endpoints.Docentes;

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
    }
}
