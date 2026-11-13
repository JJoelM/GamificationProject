using Core.Application.Common;
using Core.Domain.Entidades;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Comandos;

public sealed record RegistrarDocenteCommand(string Email, string NombreCompleto, string Password, bool AceptaUsoInvestigacion) : IRequest<Guid>;

public sealed class RegistrarDocenteCommandHandler : IRequestHandler<RegistrarDocenteCommand, Guid>
{
    private readonly IApplicationDbContext _db;
    private readonly PasswordHasher<Usuario> _hasher = new();

    public RegistrarDocenteCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<Guid> Handle(RegistrarDocenteCommand request, CancellationToken cancellationToken)
    {
        ValidadorPassword.Validar(request.Password);

        var emailNormalizado = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        if (await _db.Usuarios.AnyAsync(u => u.Email.ToLower() == emailNormalizado, cancellationToken))
            throw new ArgumentException("Ya existe una cuenta registrada con ese email.");

        var rolDocente = await _db.Roles.FirstOrDefaultAsync(r => r.Nombre == "Docente", cancellationToken)
            ?? throw new InvalidOperationException("El rol 'Docente' no está sembrado en la base.");

        var usuario = new Usuario(emailNormalizado, request.NombreCompleto.Trim(), rolDocente.Id);
        usuario.EstablecerContrasena(_hasher.HashPassword(usuario, request.Password));
        usuario.ActualizarConsentimientoInvestigacion(request.AceptaUsoInvestigacion);

        _db.Add(usuario);
        await _db.SaveChangesAsync(cancellationToken);

        return usuario.Id;
    }
}
