namespace Core.Application.Common;

public interface IGeneradorDeTokens
{
    string GenerarToken(Guid usuarioId, string email, string rol);
}
