using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace WebApi;

/// <summary>
/// Middleware fail-closed que exige un encabezado X-Proxy-Secret válido en todas las rutas /api/*
/// cuando la aplicación se ejecuta fuera de Development (o cuando ProxySecret está configurado).
/// Deja libre /health para comprobaciones de estado de Render y despertar del contenedor.
/// </summary>
public sealed class ProxySecretMiddleware
{
    private readonly RequestDelegate _next;
    private readonly byte[]? _expectedSecretBytes;
    private readonly bool _enforceValidation;

    public ProxySecretMiddleware(RequestDelegate next, string? proxySecret, bool isDevelopment)
    {
        _next = next;
        ValidarConfiguracion(proxySecret, isDevelopment);

        var trimmed = proxySecret?.Trim();
        _enforceValidation = !string.IsNullOrEmpty(trimmed);
        _expectedSecretBytes = _enforceValidation ? Encoding.UTF8.GetBytes(trimmed!) : null;
    }

    public static void ValidarConfiguracion(string? proxySecret, bool isDevelopment)
    {
        if (!isDevelopment && string.IsNullOrWhiteSpace(proxySecret))
        {
            throw new InvalidOperationException(
                "Por seguridad (fail-closed), es obligatorio configurar la variable de entorno ProxySecret en entornos no-Development.");
        }
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        if (!_enforceValidation)
        {
            await _next(context);
            return;
        }

        if (!EsSecretoValido(context.Request.Headers, _expectedSecretBytes!))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/problem+json; charset=utf-8";
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = StatusCodes.Status403Forbidden,
                Title = "Acceso directo no autorizado",
                Detail = "Las solicitudes a /api/* deben enviarse a través del proxy autorizado.",
            });
            return;
        }

        await _next(context);
    }

    public static bool EsSecretoValido(IHeaderDictionary headers, byte[] expectedSecretBytes)
    {
        if (!headers.TryGetValue("X-Proxy-Secret", out var values) || values.Count != 1)
        {
            return false;
        }

        var received = values[0];
        if (string.IsNullOrEmpty(received))
        {
            return false;
        }

        var receivedBytes = Encoding.UTF8.GetBytes(received);
        return CryptographicOperations.FixedTimeEquals(expectedSecretBytes, receivedBytes);
    }
}
