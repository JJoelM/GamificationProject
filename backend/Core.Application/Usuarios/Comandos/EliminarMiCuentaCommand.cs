using Core.Application.Common;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Comandos;

public sealed record EliminarMiCuentaCommand(Guid UsuarioId) : IRequest;

public sealed class EliminarMiCuentaCommandHandler : IRequestHandler<EliminarMiCuentaCommand>
{
    private readonly IApplicationDbContext _db;

    public EliminarMiCuentaCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task Handle(EliminarMiCuentaCommand request, CancellationToken cancellationToken)
    {
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Id == request.UsuarioId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Usuario), request.UsuarioId);

        // Un docente con Aulas activas no puede autoeliminarse: dejaría
        // alumnos inscriptos en un curso sin dueño.
        var tieneAulas = await _db.Aulas.AnyAsync(a => a.DocenteId == request.UsuarioId, cancellationToken);
        if (tieneAulas)
            throw new TransicionDeEstadoInvalidaException(
                "No podés eliminar tu cuenta mientras tengas Aulas con alumnos inscriptos. Contactá a un Directivo.");

        usuario.Anonimizar();
        await _db.SaveChangesAsync(cancellationToken);
    }
}
