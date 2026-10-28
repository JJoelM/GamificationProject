using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Misiones.Consultas;

public sealed record ObtenerMisionesActivasQuery(Guid AulaId, Guid AlumnoId) : IRequest<List<MisionDisponibleDto>>;

public sealed record MisionDisponibleDto(
    Guid MisionId,
    string Narrativa,
    string TipoPlantilla,
    string PayloadJson,
    int RecompensaXp,
    bool Completada = false,
    int? MejorPorcentaje = null,
    int Intentos = 0);

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

        var misiones = await _db.MisionesActivas
            .Where(m => m.AulaId == request.AulaId && m.EstaVisible)
            .ToListAsync(cancellationToken);

        var resoluciones = await _db.ResolucionesRegistradas
            .Where(r => r.AlumnoId == request.AlumnoId && r.AulaId == request.AulaId)
            .GroupBy(r => r.MisionId)
            .Select(g => new
            {
                MisionId = g.Key,
                MejorPorcentaje = g.Max(r => r.PorcentajeCorrecto),
                Intentos = g.Count()
            })
            .ToDictionaryAsync(x => x.MisionId, cancellationToken);

        // Previene exploits/trampas: el alumno nunca recibe respuestasCorrectas, ordenes o culpables
        return misiones
            .Select(m =>
            {
                var tiene = resoluciones.TryGetValue(m.MisionId, out var r);
                return new MisionDisponibleDto(
                    m.MisionId,
                    m.Narrativa,
                    m.TipoPlantilla,
                    SanitizadorPayloadMision.SanitizarParaAlumno(m.TipoPlantilla, m.PayloadJson),
                    m.RecompensaXp,
                    Completada: tiene,
                    MejorPorcentaje: tiene ? r!.MejorPorcentaje : null,
                    Intentos: tiene ? r!.Intentos : 0);
            })
            .ToList();
    }
}
