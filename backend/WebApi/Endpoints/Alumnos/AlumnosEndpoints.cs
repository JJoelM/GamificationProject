using System.Security.Claims;
using Core.Application.Grimorio;
using Core.Application.Personajes.Comandos;
using Core.Application.Personajes.Consultas;
using Core.Domain.Agregados.Misiones;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Endpoints.Alumnos;

public static class AlumnosEndpoints
{
    public static void MapAlumnosEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/alumnos").WithTags("Alumnos")
            .RequireAuthorization(p => p.RequireRole("Alumno"));

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
        .WithName("ResolverMision");

        grupo.MapPost("/misiones/{misionId:guid}/resolver-orden-temporal", async (
            Guid misionId, ResolverOrdenTemporalRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            var comando = new ResolverMisionOrdenTemporalCommand(
                misionId, usuario.ObtenerUsuarioId(), request.OrdenPropuesto, request.EventoCulpableElegido,
                DateOnly.FromDateTime(DateTime.UtcNow));

            var resultado = await mediator.Send(comando);
            return Results.Ok(resultado);
        })
        .WithName("ResolverMisionOrdenTemporal");

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
                    escudosRachaDisponibles = 0,
                    avatarEquipado = (string?)null,
                    marcoEquipado = (string?)null,
                    mascotaEquipada = (string?)null,
                    tituloEquipado = (string?)null,
                    cosmeticosComprados = Array.Empty<string>(),
                    aulaId,
                    alumnoId,
                });
            }

            return Results.Ok(new
            {
                experienciaXP = personaje.ExperienciaXP,
                puntosAccionAP = personaje.PuntosAccionAP,
                rachaDiasActivos = personaje.RachaDiasActivos,
                escudosRachaDisponibles = personaje.EscudosRachaDisponibles,
                avatarEquipado = personaje.AvatarEquipado,
                marcoEquipado = personaje.MarcoEquipado,
                mascotaEquipada = personaje.MascotaEquipada,
                tituloEquipado = personaje.TituloEquipado,
                cosmeticosComprados = personaje.CosmeticosComprados,
                aulaId,
                alumnoId,
            });
        })
        .WithName("ObtenerPersonaje");

        grupo.MapGet("/ranking/{aulaId:guid}", async (Guid aulaId, ClaimsPrincipal usuario, IMediator mediator) =>
            Results.Ok(await mediator.Send(new ObtenerRankingAulaQuery(aulaId, usuario.ObtenerUsuarioId()))))
            .WithName("ObtenerRankingAula");

        grupo.MapGet("/grimorio/{aulaId:guid}", async (Guid aulaId, ClaimsPrincipal usuario, IMediator mediator) =>
            Results.Ok(await mediator.Send(new ObtenerGrimorioAulaQuery(aulaId, usuario.ObtenerUsuarioId()))))
            .WithName("ObtenerGrimorio");

        grupo.MapPost("/bazar/comprar", async (
            [FromBody] ComprarArticuloRequest request,
            ClaimsPrincipal usuario,
            IMediator mediator,
            [FromQuery] Guid? aulaId = null) =>
        {
            var targetAulaId = request.AulaId ?? aulaId
                ?? throw new ArgumentException("Se requiere aulaId en la consulta o en el cuerpo de la solicitud.", nameof(aulaId));

            await mediator.Send(new ComprarArticuloBazarCommand(
                usuario.ObtenerUsuarioId(), targetAulaId, request.ArticuloId, request.CostoAp, request.Tipo, request.Valor));

            return Results.NoContent();
        })
        .WithName("ComprarArticuloBazar");

        grupo.MapPut("/personaje/{aulaId:guid}/personalizacion", async (
            Guid aulaId, PersonalizarPersonajeRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            await mediator.Send(new PersonalizarPersonajeCommand(
                usuario.ObtenerUsuarioId(), aulaId, request.AvatarId, request.Marco, request.Mascota, request.Titulo));
            return Results.NoContent();
        })
        .WithName("PersonalizarPersonaje");
    }
}
