using Core.Application.Common;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Comandos;

public sealed record CambiarEstadoDeCuentaCommand(Guid UsuarioId, EstadoCuenta NuevoEstado, string RolDelSolicitante) : IRequest;

public sealed class CambiarEstadoDeCuentaCommandHandler : IRequestHandler<CambiarEstadoDeCuentaCommand>
{
    private readonly IApplicationDbContext _db;

    public CambiarEstadoDeCuentaCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(CambiarEstadoDeCuentaCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _db.Usuarios.Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Usuario), request.UsuarioId);

        if (usuario.Rol.Nombre == "Administrador" && request.RolDelSolicitante != "Administrador")
            throw new UnauthorizedAccessException("Un Directivo no puede modificar una cuenta de Administrador.");

        switch (request.NuevoEstado)
        {
            case EstadoCuenta.Activa:
                usuario.Activar();
                break;
            case EstadoCuenta.Suspendida:
                usuario.Suspender();
                break;
            default:
                throw new ArgumentException($"No se puede establecer el estado {request.NuevoEstado} a través de este comando.");
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
