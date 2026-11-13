using System.Text.Json;
using Core.Application.Common;
using Core.Application.Misiones.Proyecciones;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Grimorio;

public sealed record ObtenerGrimorioAulaQuery(Guid AulaId, Guid AlumnoId) : IRequest<GrimorioDto>;

public sealed record FichaGrimorioDto(
    Guid FichaId, Guid MisionId, string TemaCurricular, string Narrativa,
    List<string> ConceptosClave, bool Desbloqueada);

public sealed record GrimorioDto(List<FichaGrimorioDto> Fichas, int TotalDesbloqueadas, int Total);

public sealed class ObtenerGrimorioAulaQueryHandler : IRequestHandler<ObtenerGrimorioAulaQuery, GrimorioDto>
{
    private readonly IApplicationDbContext _db;

    public ObtenerGrimorioAulaQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<GrimorioDto> Handle(ObtenerGrimorioAulaQuery request, CancellationToken cancellationToken)
    {
        var estaInscripto = await _db.Inscripciones
            .AnyAsync(i => i.AulaId == request.AulaId && i.AlumnoId == request.AlumnoId, cancellationToken);
        if (!estaInscripto)
            throw new UnauthorizedAccessException("No estás inscripto en esta Aula.");

        var misionesVisiblesIds = await _db.MisionesActivas
            .Where(m => m.AulaId == request.AulaId && m.EstaVisible)
            .Select(m => m.MisionId)
            .ToListAsync(cancellationToken);

        var fichas = await _db.FichasGrimorio
            .Where(f => f.AulaId == request.AulaId && misionesVisiblesIds.Contains(f.MisionId))
            .ToListAsync(cancellationToken);

        var desbloqueadas = await _db.FichasGrimorioDesbloqueadas
            .Where(d => d.AlumnoId == request.AlumnoId)
            .Select(d => d.FichaId)
            .ToHashSetAsync(cancellationToken);

        var dtos = fichas.Select(f =>
        {
            var desbloqueada = desbloqueadas.Contains(f.FichaId);
            return new FichaGrimorioDto(
                f.FichaId,
                f.MisionId,
                f.TemaCurricular,
                desbloqueada ? f.Narrativa : "Completá esta misión para desbloquear su crónica en el Grimorio.",
                desbloqueada ? (JsonSerializer.Deserialize<List<string>>(f.ConceptosClave) ?? new()) : new List<string>(),
                desbloqueada);
        }).ToList();

        return new GrimorioDto(dtos, dtos.Count(d => d.Desbloqueada), fichas.Count);
    }
}
