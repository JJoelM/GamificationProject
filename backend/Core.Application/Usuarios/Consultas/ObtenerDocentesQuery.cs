using Core.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Consultas;

public sealed record ObtenerDocentesQuery : IRequest<List<DocenteResumenDto>>;

public sealed record DocenteResumenDto(
    Guid UsuarioId,
    string Email,
    string NombreCompleto,
    string EstadoCuenta,
    string Rol,
    string? EmailTutor,
    DateOnly? FechaNacimiento
);

public sealed class ObtenerDocentesQueryHandler : IRequestHandler<ObtenerDocentesQuery, List<DocenteResumenDto>>
{
    private readonly IApplicationDbContext _db;

    public ObtenerDocentesQueryHandler(IApplicationDbContext db) => _db = db;

    public Task<List<DocenteResumenDto>> Handle(ObtenerDocentesQuery request, CancellationToken cancellationToken)
    {
        return _db.Usuarios
            .Include(u => u.Rol)
            .Where(u => u.Rol.Nombre != "Administrador")
            .OrderBy(u => u.Rol.Nombre)
            .ThenBy(u => u.NombreCompleto)
            .Select(u => new DocenteResumenDto(
                u.Id,
                u.Email,
                u.NombreCompleto,
                u.EstadoCuenta.ToString(),
                u.Rol.Nombre,
                u.EmailTutor,
                u.FechaNacimiento))
            .ToListAsync(cancellationToken);
    }
}
