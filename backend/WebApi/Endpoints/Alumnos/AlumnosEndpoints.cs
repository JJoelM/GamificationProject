using System.Security.Claims;
using Core.Application.Grimorio;
using Core.Application.Misiones.Consultas;
using Core.Application.Personajes.Comandos;
using Core.Application.Personajes.Consultas;
using Core.Domain.Agregados.Misiones;
using Core.Domain.Agregados.Personajes;
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

        grupo.MapPost("/misiones/{misionId:guid}/pista", async (
            Guid misionId, UsarPistaRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            var cmd = new UsarPistaCommand(
                misionId, usuario.ObtenerUsuarioId(), request.IndicePregunta,
                request.OpcionesYaDescartadas ?? new List<string>());
            return Results.Ok(await mediator.Send(cmd));
        })
        .WithName("UsarPista");

        grupo.MapGet("/camino/{aulaId:guid}", async (Guid aulaId, ClaimsPrincipal usuario, IMediator mediator) =>
            Results.Ok(await mediator.Send(new ObtenerCaminoParaAlumnoQuery(aulaId, usuario.ObtenerUsuarioId()))))
            .WithName("ObtenerCaminoAlumno");

        grupo.MapGet("/personaje/{aulaId:guid}", async (
            Guid aulaId, ClaimsPrincipal usuario, IRepositorioPersonajes repositorio) =>
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
                    pistasDisponibles = 0,
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
                pistasDisponibles = personaje.PistasDisponibles,
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

        // El enum sale como texto: el frontend no tiene que conocer los numeros del Ledger.
        grupo.MapGet("/bazar/catalogo", () =>
            Results.Ok(CatalogoBazar.Todos.Select(a => new { a.Id, a.Nombre, Tipo = a.Tipo.ToString(), a.CostoAp })))
            .WithName("ObtenerCatalogoBazar");

        grupo.MapPost("/bazar/{aulaId:guid}/comprar", async (
            Guid aulaId, ComprarArticuloRequest request, ClaimsPrincipal usuario, IMediator mediator) =>
        {
            await mediator.Send(new ComprarArticuloBazarCommand(usuario.ObtenerUsuarioId(), aulaId, request.ArticuloId));
            return Results.NoContent();
        })
        .WithName("ComprarArticuloBazarPorAula");

        grupo.MapPost("/bazar/comprar", async (
            [FromBody] ComprarArticuloRequest request,
            ClaimsPrincipal usuario,
            IMediator mediator,
            [FromQuery] Guid? aulaId = null) =>
        {
            var targetAulaId = aulaId
                ?? throw new ArgumentException("Se requiere aulaId en la consulta de la solicitud.", nameof(aulaId));

            await mediator.Send(new ComprarArticuloBazarCommand(usuario.ObtenerUsuarioId(), targetAulaId, request.ArticuloId));
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
