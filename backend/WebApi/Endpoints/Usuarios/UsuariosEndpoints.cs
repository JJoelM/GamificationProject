using Core.Application.Usuarios.Comandos;
using Core.Application.Usuarios.Consultas;
using Core.Domain.Entidades;
using MediatR;

namespace WebApi.Endpoints.Usuarios;

public sealed record RegistrarDocenteRequest(string Email, string NombreCompleto, string Password);

public sealed record RegistrarAlumnoRequest(
    string CodigoInvitacion, string Email, string NombreCompleto, string Password,
    DateOnly FechaNacimiento, string? EmailTutor);

public sealed record LoginRequest(string Email, string Password);

public sealed record CambiarEstadoRequest(EstadoCuenta NuevoEstado);

public static class UsuariosEndpoints
{
    public static void MapUsuariosEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/usuarios").WithTags("Usuarios");

        grupo.MapPost("/registro/docente", async (RegistrarDocenteRequest request, IMediator mediator) =>
        {
            var usuarioId = await mediator.Send(
                new RegistrarDocenteCommand(request.Email, request.NombreCompleto, request.Password));
            return Results.Created($"/api/usuarios/{usuarioId}", new { usuarioId });
        })
        .WithName("RegistrarDocente");

        grupo.MapPost("/registro/alumno", async (RegistrarAlumnoRequest request, IMediator mediator) =>
        {
            var resultado = await mediator.Send(new RegistrarAlumnoConInvitacionCommand(
                request.CodigoInvitacion, request.Email, request.NombreCompleto, request.Password,
                request.FechaNacimiento, request.EmailTutor));
            return Results.Created($"/api/usuarios/{resultado.AlumnoId}", resultado);
        })
        .WithName("RegistrarAlumno");

        grupo.MapPost("/login", async (LoginRequest request, HttpContext http, IMediator mediator) =>
        {
            var resultado = await mediator.Send(new LoginCommand(request.Email, request.Password));

            http.Response.Cookies.Append("access_token", resultado.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(120),
            });

            return Results.Ok(new { resultado.UsuarioId, resultado.NombreCompleto, resultado.Rol });
        })
        .WithName("Login");

        grupo.MapPost("/logout", (HttpContext http) =>
        {
            http.Response.Cookies.Delete("access_token");
            return Results.NoContent();
        })
        .WithName("Logout");

        grupo.MapGet("/docentes", async (IMediator mediator) =>
        {
            var docentes = await mediator.Send(new ObtenerDocentesQuery());
            return Results.Ok(docentes);
        })
        .WithName("ObtenerDocentes")
        .RequireAuthorization(p => p.RequireRole("Directivo", "Administrador"));

        grupo.MapPost("/{usuarioId:guid}/estado", async (
            Guid usuarioId, CambiarEstadoRequest request, IMediator mediator) =>
        {
            await mediator.Send(new CambiarEstadoDeCuentaCommand(usuarioId, request.NuevoEstado));
            return Results.NoContent();
        })
        .WithName("CambiarEstadoDeCuenta")
        .RequireAuthorization(p => p.RequireRole("Directivo", "Administrador"));
    }
}
