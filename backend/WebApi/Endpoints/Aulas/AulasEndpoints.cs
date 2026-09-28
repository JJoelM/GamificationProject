using System.Security.Claims;
using Core.Application.Common;
using Core.Domain.Entidades;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Endpoints.Aulas;

public sealed record CrearAulaRequest(string Nombre);
public sealed record UnirseAulaRequest(string CodigoInvitacion);

public static class AulasEndpoints
{
    public static void MapAulasEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/aulas").WithTags("Aulas").RequireAuthorization();

        // GET /api/aulas/mis-aulas — Devuelve las aulas a las que pertenece el usuario autenticado
        grupo.MapGet("/mis-aulas", async (ClaimsPrincipal usuario, IApplicationDbContext db) =>
        {
            var usuarioId = usuario.ObtenerUsuarioId();
            var rol = usuario.FindFirstValue(ClaimTypes.Role);

            if (rol == "Docente")
            {
                var aulasDocente = await db.Aulas
                    .Where(a => a.DocenteId == usuarioId)
                    .Select(a => new
                    {
                        aulaId = a.Id,
                        nombre = a.Nombre,
                        codigoInvitacion = a.CodigoInvitacion,
                        esDocente = true,
                    })
                    .ToListAsync();

                return Results.Ok(aulasDocente);
            }

            if (rol == "Alumno")
            {
                var aulasAlumno = await (
                    from i in db.Inscripciones
                    join a in db.Aulas on i.AulaId equals a.Id
                    where i.AlumnoId == usuarioId
                    select new
                    {
                        aulaId = a.Id,
                        nombre = a.Nombre,
                        codigoInvitacion = a.CodigoInvitacion,
                        esDocente = false,
                    }
                ).ToListAsync();

                return Results.Ok(aulasAlumno);
            }

            // Para directivos/admin, listar todas las aulas
            var todas = await db.Aulas
                .Select(a => new
                {
                    aulaId = a.Id,
                    nombre = a.Nombre,
                    codigoInvitacion = a.CodigoInvitacion,
                    esDocente = false,
                })
                .ToListAsync();

            return Results.Ok(todas);
        })
        .WithName("ObtenerMisAulas");

        // POST /api/aulas — El docente crea una nueva aula
        grupo.MapPost("/", async (CrearAulaRequest request, ClaimsPrincipal usuario, IApplicationDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.Nombre))
                return Results.BadRequest(new { detail = "El nombre del aula es obligatorio." });

            var docenteId = usuario.ObtenerUsuarioId();
            var aula = new Aula(request.Nombre.Trim(), docenteId);

            db.Add(aula);
            await db.SaveChangesAsync();

            return Results.Created($"/api/aulas/{aula.Id}", new
            {
                aulaId = aula.Id,
                nombre = aula.Nombre,
                codigoInvitacion = aula.CodigoInvitacion,
                esDocente = true,
            });
        })
        .WithName("CrearAula")
        .RequireAuthorization(p => p.RequireRole("Docente", "Administrador"));

        // POST /api/aulas/unirse — El alumno se inscribe en un aula usando su código
        grupo.MapPost("/unirse", async (UnirseAulaRequest request, ClaimsPrincipal usuario, IApplicationDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.CodigoInvitacion))
                return Results.BadRequest(new { detail = "El código de invitación es obligatorio." });

            var alumnoId = usuario.ObtenerUsuarioId();
            var codigoNormalizado = request.CodigoInvitacion.Trim().ToUpperInvariant();

            var aula = await db.Aulas.FirstOrDefaultAsync(a => a.CodigoInvitacion == codigoNormalizado);
            if (aula is null)
                return Results.NotFound(new { detail = "No se encontró ningún aula con el código proporcionado." });

            var yaInscripto = await db.Inscripciones.AnyAsync(i => i.AulaId == aula.Id && i.AlumnoId == alumnoId);
            if (!yaInscripto)
            {
                db.Add(new Inscripcion(aula.Id, alumnoId));
                await db.SaveChangesAsync();
            }

            return Results.Ok(new
            {
                aulaId = aula.Id,
                nombre = aula.Nombre,
                codigoInvitacion = aula.CodigoInvitacion,
                esDocente = false,
                mensaje = yaInscripto ? "Ya estabas inscripto en esta aula." : "Inscripción exitosa.",
            });
        })
        .WithName("UnirseAula")
        .RequireAuthorization(p => p.RequireRole("Alumno"));
    }
}
