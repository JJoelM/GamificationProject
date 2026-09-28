using Core.Application.Common;
using Core.Domain.Entidades;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Comandos;

public sealed record LoginCommand(string Email, string Password) : IRequest<ResultadoLogin>;

public sealed record ResultadoLogin(Guid UsuarioId, string NombreCompleto, string Rol, string Token);

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, ResultadoLogin>
{
    private readonly IApplicationDbContext _db;
    private readonly IGeneradorDeTokens _generadorDeTokens;
    private readonly PasswordHasher<Usuario> _hasher = new();

    public LoginCommandHandler(IApplicationDbContext db, IGeneradorDeTokens generadorDeTokens)
    {
        _db = db;
        _generadorDeTokens = generadorDeTokens;
    }

    public async Task<ResultadoLogin> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _db.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        // Mismo mensaje tanto si el email no existe como si la contraseña
        // está mal: no le decimos a quien pregunta cuál de las dos acertó.
        if (usuario is null || usuario.PasswordHash is null
            || _hasher.VerifyHashedPassword(usuario, usuario.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Email o contraseña incorrectos.");
        }

        if (usuario.EstadoCuenta != EstadoCuenta.Activa)
            throw new InvalidOperationException($"La cuenta no está activa (estado: {usuario.EstadoCuenta}).");

        var token = _generadorDeTokens.GenerarToken(usuario.Id, usuario.Email, usuario.Rol.Nombre);

        return new ResultadoLogin(usuario.Id, usuario.NombreCompleto, usuario.Rol.Nombre, token);
    }
}
