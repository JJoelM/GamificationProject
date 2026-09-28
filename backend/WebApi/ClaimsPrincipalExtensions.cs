using System.Security.Claims;

namespace WebApi;

public static class ClaimsPrincipalExtensions
{
    public static Guid ObtenerUsuarioId(this ClaimsPrincipal usuario)
    {
        var valor = usuario.FindFirstValue("usuarioId")
            ?? throw new InvalidOperationException("El token no contiene el claim usuarioId.");
        return Guid.Parse(valor);
    }
}
