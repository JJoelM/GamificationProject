using Core.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Misiones.Consultas;

public sealed record ObtenerMisionesActivasQuery(Guid AulaId, Guid AlumnoId) : IRequest<List<MisionDisponibleDto>>;

public sealed record MisionDisponibleDto(Guid MisionId, string Narrativa, string TipoPlantilla, string PayloadJson, int RecompensaXp);

public sealed class ObtenerMisionesActivasQueryHandler : IRequestHandler<ObtenerMisionesActivasQuery, List<MisionDisponibleDto>>
{
    private readonly IApplicationDbContext _db;

    public ObtenerMisionesActivasQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<MisionDisponibleDto>> Handle(ObtenerMisionesActivasQuery request, CancellationToken cancellationToken)
    {
        var estaInscripto = await _db.Inscripciones
            .AnyAsync(i => i.AulaId == request.AulaId && i.AlumnoId == request.AlumnoId, cancellationToken);

        if (!estaInscripto)
            throw new UnauthorizedAccessException("No estás inscripto en esta Aula.");

        return await _db.MisionesActivas
            .Where(m => m.AulaId == request.AulaId)
            .Select(m => new MisionDisponibleDto(m.MisionId, m.Narrativa, m.TipoPlantilla, m.PayloadJson, m.RecompensaXp))
            .ToListAsync(cancellationToken);
    }
}
