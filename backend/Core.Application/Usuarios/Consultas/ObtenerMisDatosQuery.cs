using Core.Application.Common;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Consultas;

public sealed record ObtenerMisDatosQuery(Guid UsuarioId) : IRequest<MisDatosDto>;

public sealed record MisDatosDto(
    Guid UsuarioId, string Email, string NombreCompleto, string Rol, string EstadoCuenta,
    DateOnly? FechaNacimiento, bool AceptaUsoInvestigacion, DateTime? FechaConsentimientoInvestigacion);

public sealed class ObtenerMisDatosQueryHandler : IRequestHandler<ObtenerMisDatosQuery, MisDatosDto>
{
    private readonly IApplicationDbContext _db;

    public ObtenerMisDatosQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<MisDatosDto> Handle(ObtenerMisDatosQuery request, CancellationToken cancellationToken)
    {
        var usuario = await _db.Usuarios.Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Usuario), request.UsuarioId);

        return new MisDatosDto(
            usuario.Id, usuario.Email, usuario.NombreCompleto, usuario.Rol.Nombre, usuario.EstadoCuenta.ToString(),
            usuario.FechaNacimiento, usuario.AceptaUsoInvestigacion, usuario.FechaConsentimientoInvestigacion);
    }
}
