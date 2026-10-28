using Core.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Misiones.Consultas;

public sealed record ObtenerBorradoresPendientesQuery(Guid DocenteId, Guid? AulaId = null) : IRequest<List<BorradorPendienteDto>>;

public sealed record BorradorPendienteDto(
    Guid MisionId,
    Guid AulaId,
    string TemaCurricular,
    string Narrativa,
    string TipoPlantilla,
    string PayloadJson,
    int NivelConfianzaIA,
    int RecompensaXpSugerida,
    string EstadoValidacion);

public sealed class ObtenerBorradoresPendientesQueryHandler
    : IRequestHandler<ObtenerBorradoresPendientesQuery, List<BorradorPendienteDto>>
{
    private readonly IApplicationDbContext _db;

    public ObtenerBorradoresPendientesQueryHandler(IApplicationDbContext db) => _db = db;

    public Task<List<BorradorPendienteDto>> Handle(
        ObtenerBorradoresPendientesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.BorradoresIA
            .Where(b => b.DocenteId == request.DocenteId && b.EstadoValidacion != "Rechazado");

        if (request.AulaId.HasValue && request.AulaId.Value != Guid.Empty)
        {
            query = query.Where(b => b.AulaId == request.AulaId.Value);
        }

        return query.Select(b => new BorradorPendienteDto(
                b.MisionId, b.AulaId, b.TemaCurricular, b.Narrativa,
                b.TipoPlantilla, b.PayloadJson, b.NivelConfianzaIA, b.RecompensaXpSugerida,
                b.EstadoValidacion))
            .ToListAsync(cancellationToken);
    }
}
