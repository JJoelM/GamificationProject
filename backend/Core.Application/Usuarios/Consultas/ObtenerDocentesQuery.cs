using Core.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Consultas;

public sealed record ObtenerDocentesQuery : IRequest<List<DocenteResumenDto>>;

public sealed record DocenteResumenDto(Guid UsuarioId, string Email, string NombreCompleto, string EstadoCuenta);

public sealed class ObtenerDocentesQueryHandler : IRequestHandler<ObtenerDocentesQuery, List<DocenteResumenDto>>
{
    private readonly IApplicationDbContext _db;

    public ObtenerDocentesQueryHandler(IApplicationDbContext db) => _db = db;

    public Task<List<DocenteResumenDto>> Handle(ObtenerDocentesQuery request, CancellationToken cancellationToken)
    {
        return _db.Usuarios
            .Where(u => u.Rol.Nombre == "Docente")
            .Select(u => new DocenteResumenDto(u.Id, u.Email, u.NombreCompleto, u.EstadoCuenta.ToString()))
            .ToListAsync(cancellationToken);
    }
}
