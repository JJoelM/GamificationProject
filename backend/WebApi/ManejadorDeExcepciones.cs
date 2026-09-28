using Core.Domain.SeedWork;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace WebApi;

public class ManejadorDeExcepciones : IExceptionHandler
{
    private readonly ILogger<ManejadorDeExcepciones> _logger;

    public ManejadorDeExcepciones(ILogger<ManejadorDeExcepciones> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, titulo, detalle) = exception switch
        {
            AgregadoNoEncontradoException => (StatusCodes.Status404NotFound, "No encontrado", exception.Message),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "No autorizado", exception.Message),
            InvalidOperationException => (StatusCodes.Status409Conflict, "Transición de estado inválida", exception.Message),
            ArgumentException => (StatusCodes.Status400BadRequest, "Solicitud inválida", exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "Error interno",
                  "Ocurrió un error inesperado. Si persiste, contactá al equipo."),
        };

        if (status == StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Error no controlado en {Path}", httpContext.Request.Path);

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title = titulo,
            Detail = detalle,
        }, cancellationToken);

        return true;
    }
}
