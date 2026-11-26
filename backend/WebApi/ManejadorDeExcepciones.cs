using Core.Application.Common;
using Core.Domain.SeedWork;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApi;

public class ManejadorDeExcepciones : IExceptionHandler
{
    private readonly ILogger<ManejadorDeExcepciones> _logger;
    private readonly IHostEnvironment? _environment;

    public ManejadorDeExcepciones(
        ILogger<ManejadorDeExcepciones> logger,
        IHostEnvironment? environment = null)
    {
        _logger = logger;
        _environment = environment;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var esDesarrollo = _environment?.IsDevelopment() == true;

        var (status, titulo, detalle) = exception switch
        {
            AgregadoNoEncontradoException =>
                (StatusCodes.Status404NotFound, "No encontrado", exception.Message),

            UnauthorizedAccessException =>
                (StatusCodes.Status401Unauthorized, "No autorizado", exception.Message),

            // Excepción propia del dominio: transición inválida, AP insuficientes,
            // duplicado en compra, etc. Separada de InvalidOperationException
            // genérica para no enmascarar errores técnicos como errores de negocio.
            TransicionDeEstadoInvalidaException =>
                (StatusCodes.Status409Conflict, "Transición de estado inválida", exception.Message),

            ArgumentException =>
                (StatusCodes.Status400BadRequest, "Solicitud inválida", exception.Message),

            // Ej.: resolver una LineaTemporal por /resolver (o al revés) -- error
            // del cliente al elegir endpoint, no un fallo del servidor.
            NotSupportedException =>
                (StatusCodes.Status400BadRequest, "Operación no soportada", exception.Message),

            GeneracionFallidaException =>
                (StatusCodes.Status502BadGateway, "Error en generación con IA", exception.Message),

            DbUpdateException =>
                (StatusCodes.Status409Conflict, "Conflicto al guardar el progreso",
                 "No se pudo registrar el progreso debido a una colisión concurrente de datos. Por favor reintenta."),

            // Errores inesperados (HTTP 500): se loguea completo en servidor y se oculta
            // el detalle técnico al cliente fuera de Development (fail-closed, RFC 9457).
            _ => (StatusCodes.Status500InternalServerError, "Error interno",
                  esDesarrollo
                      ? $"Ocurrió un error inesperado ({exception.GetType().Name}: {exception.Message}). Si persiste, contactá al equipo."
                      : "Ocurrió un error interno inesperado. Si persiste, contactá al equipo."),
        };

        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Error no controlado en {Path}", httpContext.Request.Path);

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(
            new ProblemDetails
            {
                Status = status,
                Title = titulo,
                Detail = detalle,
            },
            options: null,
            contentType: "application/problem+json",
            cancellationToken: cancellationToken);

        return true;
    }
}
