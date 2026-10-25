using Core.Application.Common;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Misiones.Consultas;

public sealed record ObtenerMetricasAulaQuery(Guid AulaId, Guid DocenteId) : IRequest<MetricasAulaDto>;

public sealed record MetricasAulaDto(
    int TotalInscriptos,
    int AlumnosConAlMenosUnaMisionCompleta,
    double TasaCompletitud,
    int MisionesGeneradas,
    int MisionesValidadas,
    int MisionesRechazadas,
    double TasaAprobacionHitl,
    List<MetricaPorMision> MetricasPorMision,
    List<DistribucionAcierto> DistribucionAcierto,
    List<MisionMasResuelta> MisionesMasResueltas);

public sealed record MetricaPorMision(
    Guid MisionId,
    string TemaCurricular,
    int TotalResoluciones,
    double PromedioAcierto,
    string PreguntaMasFallida,
    string OpcionIncorrectaMasFrecuente);

public sealed record DistribucionAcierto(string Rango, int CantidadDeResoluciones);

public sealed record MisionMasResuelta(Guid MisionId, string TemaCurricular, int TotalResoluciones);

public sealed class ObtenerMetricasAulaQueryHandler : IRequestHandler<ObtenerMetricasAulaQuery, MetricasAulaDto>
{
    private readonly IApplicationDbContext _db;

    public ObtenerMetricasAulaQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<MetricasAulaDto> Handle(ObtenerMetricasAulaQuery request, CancellationToken cancellationToken)
    {
        // Verifica que el docente sea dueño del Aula
        var aula = await _db.Aulas.FirstOrDefaultAsync(a => a.Id == request.AulaId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException("Aula", request.AulaId);
        if (aula.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No tenés acceso a las métricas de esta Aula.");

        var totalInscriptos = await _db.Inscripciones
            .CountAsync(i => i.AulaId == request.AulaId, cancellationToken);

        var resumenes = await _db.PersonajesResumen
            .Where(p => p.AulaId == request.AulaId)
            .ToListAsync(cancellationToken);

        var alumnosConMisiones = resumenes.Count(p => p.MisionesCompletadas > 0);
        var tasa = totalInscriptos == 0 ? 0 : (double)alumnosConMisiones / totalInscriptos;

        var borradores = await _db.BorradoresIA
            .Where(b => b.AulaId == request.AulaId)
            .ToListAsync(cancellationToken);

        var generadas = borradores.Count;
        var validadas = borradores.Count(b => b.EstadoValidacion == "Validado");
        var rechazadas = borradores.Count(b => b.EstadoValidacion == "Rechazado");
        var tasaHitl = generadas == 0 ? 0 : (double)validadas / generadas;

        var resoluciones = await _db.ResolucionesRegistradas
            .Where(r => r.AulaId == request.AulaId && !r.EsRepaso)
            .ToListAsync(cancellationToken);

        var metricasPorMision = resoluciones
            .GroupBy(r => r.MisionId)
            .Select(g => new MetricaPorMision(
                g.Key,
                borradores.FirstOrDefault(b => b.MisionId == g.Key)?.TemaCurricular ?? "Sin tema",
                g.Count(),
                g.Average(r => r.PorcentajeCorrecto),
                "N/D",
                "N/D"))
            .ToList();

        var distribucion = new List<DistribucionAcierto>
        {
            new("0-49%", resoluciones.Count(r => r.PorcentajeCorrecto < 50)),
            new("50-74%", resoluciones.Count(r => r.PorcentajeCorrecto is >= 50 and < 75)),
            new("75-99%", resoluciones.Count(r => r.PorcentajeCorrecto is >= 75 and < 100)),
            new("100%", resoluciones.Count(r => r.PorcentajeCorrecto == 100)),
        };

        var misionesMasResueltas = resoluciones
            .GroupBy(r => r.MisionId)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .Select(g => new MisionMasResuelta(
                g.Key,
                borradores.FirstOrDefault(b => b.MisionId == g.Key)?.TemaCurricular ?? "Sin tema",
                g.Count()))
            .ToList();

        return new MetricasAulaDto(
            totalInscriptos, alumnosConMisiones, tasa,
            generadas, validadas, rechazadas, tasaHitl,
            metricasPorMision, distribucion, misionesMasResueltas);
    }
}
