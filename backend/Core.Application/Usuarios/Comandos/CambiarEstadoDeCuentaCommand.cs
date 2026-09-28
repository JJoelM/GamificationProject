using Core.Application.Common;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Comandos;

public sealed record CambiarEstadoDeCuentaCommand(Guid UsuarioId, EstadoCuenta NuevoEstado) : IRequest;

public sealed class CambiarEstadoDeCuentaCommandHandler : IRequestHandler<CambiarEstadoDeCuentaCommand>
{
    private readonly IApplicationDbContext _db;

    public CambiarEstadoDeCuentaCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(CambiarEstadoDeCuentaCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Usuario), request.UsuarioId);

        switch (request.NuevoEstado)
        {
            case EstadoCuenta.Activa:
                usuario.Activar();
                break;
            case EstadoCuenta.Suspendida:
                usuario.Suspender();
                break;
            default:
                throw new ArgumentException($"No se puede establecer el estado {request.NuevoEstado} directamente.");
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
