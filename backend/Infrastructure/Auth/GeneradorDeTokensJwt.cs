using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Core.Application.Common;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Auth;

public class GeneradorDeTokensJwt : IGeneradorDeTokens
{
    private readonly IConfiguration _configuracion;

    public GeneradorDeTokensJwt(IConfiguration configuracion) => _configuracion = configuracion;

    public string GenerarToken(Guid usuarioId, string email, string rol)
    {
        var secreto = _configuracion["JwtSettings:Secret"]
            ?? throw new InvalidOperationException("Falta configurar JwtSettings:Secret.");
        var emisor = _configuracion["JwtSettings:Issuer"] ?? "GamificacionPFC";
        var audiencia = _configuracion["JwtSettings:Audience"] ?? "GamificacionPFC";
        var minutos = int.TryParse(_configuracion["JwtSettings:MinutosExpiracion"], out var m) ? m : 120;

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("usuarioId", usuarioId.ToString()),
            new Claim(ClaimTypes.Role, rol),
        };

        var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secreto));
        var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: emisor,
            audience: audiencia,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutos),
            signingCredentials: credenciales);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
