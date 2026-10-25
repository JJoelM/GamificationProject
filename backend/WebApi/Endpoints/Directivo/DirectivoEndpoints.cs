using Core.Application.Directivo.Consultas;
using MediatR;

namespace WebApi.Endpoints.Directivo;

public static class DirectivoEndpoints
{
    public static void MapDirectivoEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/directivo").WithTags("Directivo")
            .RequireAuthorization(p => p.RequireRole("Directivo", "Administrador"));

        grupo.MapGet("/metricas", async (IMediator mediator) =>
            Results.Ok(await mediator.Send(new ObtenerMetricasGlobalesQuery())))
            .WithName("ObtenerMetricasGlobales");
    }
}
