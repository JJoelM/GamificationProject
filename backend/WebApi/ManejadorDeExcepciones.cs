using Core.Application.Common;
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

            // Todo lo demás (InvalidOperationException de LINQ, errores de DI,
            // HttpRequestException al llamar al microservicio de IA, etc.) es un
            // error interno real -- se loguea completo del lado del servidor y
            // nunca se filtra el mensaje al cliente.
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
