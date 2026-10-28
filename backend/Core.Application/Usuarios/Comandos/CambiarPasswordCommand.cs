using Core.Application.Common;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Comandos;

public sealed record CambiarPasswordCommand(Guid UsuarioId, string PasswordActual, string PasswordNueva) : IRequest;

public sealed class CambiarPasswordCommandHandler : IRequestHandler<CambiarPasswordCommand>
{
    private readonly IApplicationDbContext _db;
    private readonly PasswordHasher<Usuario> _hasher = new();

    public CambiarPasswordCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(CambiarPasswordCommand request, CancellationToken cancellationToken)
    {
        ValidadorPassword.Validar(request.PasswordNueva);

        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Usuario), request.UsuarioId);

        if (usuario.PasswordHash is null ||
            _hasher.VerifyHashedPassword(usuario, usuario.PasswordHash, request.PasswordActual) == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("La contraseña actual no es correcta.");
        }

        usuario.EstablecerContrasena(_hasher.HashPassword(usuario, request.PasswordNueva));
        await _db.SaveChangesAsync(cancellationToken);
    }
}
