using Core.Application.Common;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Personajes.Consultas;

public sealed record ObtenerRankingAulaQuery(Guid AulaId, Guid AlumnoId) : IRequest<RankingAulaDto>;

public sealed record EntradaRanking(string NombreCompleto, int ExperienciaXP, int RachaDiasActivos,
    string? AvatarEquipado, bool EsYo);

public sealed record RankingAulaDto(List<EntradaRanking> Ranking, ProgresoPropio ProgresoPropio);

public sealed record ProgresoPropio(int XpEstasSemana, int XpSemanaAnterior, double PorcentajeMejora,
    int MisionesCompletadas, int RachaDiasActivos);

public sealed class ObtenerRankingAulaQueryHandler : IRequestHandler<ObtenerRankingAulaQuery, RankingAulaDto>
{
    private readonly IApplicationDbContext _db;

    public ObtenerRankingAulaQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<RankingAulaDto> Handle(ObtenerRankingAulaQuery request, CancellationToken cancellationToken)
    {
        var estaInscripto = await _db.Inscripciones
            .AnyAsync(i => i.AulaId == request.AulaId && i.AlumnoId == request.AlumnoId, cancellationToken);
        if (!estaInscripto)
            throw new UnauthorizedAccessException("No estás inscripto en esta Aula.");

        var resumenes = await _db.PersonajesResumen
            .Where(p => p.AulaId == request.AulaId)
            .OrderByDescending(p => p.ExperienciaXP)
            .Take(50)
            .ToListAsync(cancellationToken);

        var alumnoIds = resumenes.Select(p => p.AlumnoId).ToList();

        var nombres = await _db.Usuarios
            .Where(u => alumnoIds.Contains(u.Id))
            .Select(u => new { u.Id, u.NombreCompleto })
            .ToListAsync(cancellationToken);

        var mapaDeNombres = nombres.ToDictionary(n => n.Id, n => n.NombreCompleto);

        var ranking = resumenes.Select(p => new EntradaRanking(
            mapaDeNombres.GetValueOrDefault(p.AlumnoId, "Alumno"),
            p.ExperienciaXP,
            p.RachaDiasActivos,
            p.AvatarEquipado,
            p.AlumnoId == request.AlumnoId))
            .ToList();

        // Progreso propio: XP de esta semana vs. semana anterior
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var personajeId = IdentidadCompuesta.Combinar(request.AlumnoId, request.AulaId);

        var xpEstaSemana = await _db.ResolucionesRegistradas
            .Where(r => r.PersonajeId == personajeId && r.Fecha >= hoy.AddDays(-7))
            .SumAsync(r => (int?)r.PorcentajeCorrecto, cancellationToken) ?? 0;

        var xpSemanaAnterior = await _db.ResolucionesRegistradas
            .Where(r => r.PersonajeId == personajeId && r.Fecha >= hoy.AddDays(-14) && r.Fecha < hoy.AddDays(-7))
            .SumAsync(r => (int?)r.PorcentajeCorrecto, cancellationToken) ?? 0;

        var mejora = xpSemanaAnterior == 0 ? 100
            : ((double)(xpEstaSemana - xpSemanaAnterior) / xpSemanaAnterior) * 100;

        var miResumen = resumenes.FirstOrDefault(p => p.AlumnoId == request.AlumnoId);

        var progresoPropio = new ProgresoPropio(
            xpEstaSemana, xpSemanaAnterior, Math.Round(mejora, 1),
            miResumen?.MisionesCompletadas ?? 0, miResumen?.RachaDiasActivos ?? 0);

        return new RankingAulaDto(ranking, progresoPropio);
    }
}
