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

        var fichas = await _db.FichasGrimorio
            .Where(f => f.AulaId == request.AulaId)
            .ToListAsync(cancellationToken);

        var desbloqueadas = await _db.FichasGrimorioDesbloqueadas
            .Where(d => d.AlumnoId == request.AlumnoId)
            .Select(d => d.FichaId)
            .ToHashSetAsync(cancellationToken);

        var dtos = fichas.Select(f => new FichaGrimorioDto(
            f.FichaId, f.MisionId, f.TemaCurricular, f.Narrativa,
            JsonSerializer.Deserialize<List<string>>(f.ConceptosClave) ?? new(),
            desbloqueadas.Contains(f.FichaId)))
            .ToList();

        return new GrimorioDto(dtos, dtos.Count(d => d.Desbloqueada), fichas.Count);
    }
}
