using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Common.Behaviors;

public interface IAutorizacionDocenteAula
{
    Guid AulaId { get; }
    Guid DocenteId { get; }
}

public interface IAutorizacionAlumnoAula
{
    Guid AulaId { get; }
    Guid AlumnoId { get; }
}

/// <summary>
/// Aspecto transversal de autorización por Aula (Anti-IDOR).
/// Falla rápido antes de invocar al Command/Query Handler.
/// </summary>
public sealed class AutorizacionAulaBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IApplicationDbContext _db;

    public AutorizacionAulaBehavior(IApplicationDbContext db) => _db = db;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is IAutorizacionDocenteAula docenteReq)
        {
            var esDueno = await _db.Aulas
                .AnyAsync(a => a.Id == docenteReq.AulaId && a.DocenteId == docenteReq.DocenteId, cancellationToken);
            if (!esDueno)
                throw new UnauthorizedAccessException("No tenés permiso para operar sobre esta Aula.");
        }

        if (request is IAutorizacionAlumnoAula alumnoReq)
        {
            var estaInscripto = await _db.Inscripciones
                .AnyAsync(i => i.AulaId == alumnoReq.AulaId && i.AlumnoId == alumnoReq.AlumnoId, cancellationToken);
            if (!estaInscripto)
                throw new UnauthorizedAccessException("No estás inscripto en esta Aula.");
        }

        return await next();
    }
}
