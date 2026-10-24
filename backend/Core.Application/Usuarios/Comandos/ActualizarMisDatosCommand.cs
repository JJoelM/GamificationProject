using Core.Application.Common;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Comandos;

public sealed record ActualizarMisDatosCommand(Guid UsuarioId, string NombreCompleto, bool AceptaUsoInvestigacion) : IRequest;

public sealed class ActualizarMisDatosCommandHandler : IRequestHandler<ActualizarMisDatosCommand>
{
    private readonly IApplicationDbContext _db;

    public ActualizarMisDatosCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(ActualizarMisDatosCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Usuario), request.UsuarioId);

        usuario.ActualizarNombre(request.NombreCompleto);
        usuario.ActualizarConsentimientoInvestigacion(request.AceptaUsoInvestigacion);

        await _db.SaveChangesAsync(cancellationToken);
    }
}
