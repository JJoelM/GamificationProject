using Core.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Misiones.Consultas;

public sealed record ObtenerMisionesImportablesQuery(Guid DocenteId, Guid AulaDestinoId) : IRequest<List<MisionImportableDto>>;

public sealed record MisionImportableDto(
    Guid MisionId,
    Guid AulaOrigenId,
    string AulaOrigenNombre,
    string TemaCurricular,
    string Narrativa,
    string TipoPlantilla,
    int RecompensaXpSugerida,
    string EstadoValidacion,
    bool YaImportada,
    List<Guid> MisionesSugeridasIds);

public sealed class ObtenerMisionesImportablesQueryHandler
    : IRequestHandler<ObtenerMisionesImportablesQuery, List<MisionImportableDto>>
{
    private readonly IApplicationDbContext _db;

    public ObtenerMisionesImportablesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<MisionImportableDto>> Handle(
        ObtenerMisionesImportablesQuery request, CancellationToken cancellationToken)
    {
        // 1. Obtener todas las aulas propias del docente distintas al aula destino
        var aulasDocente = await _db.Aulas
            .Where(a => a.DocenteId == request.DocenteId && a.Id != request.AulaDestinoId)
            .ToDictionaryAsync(a => a.Id, a => a.Nombre, cancellationToken);

        if (aulasDocente.Count == 0)
            return new List<MisionImportableDto>();

        var aulasIds = aulasDocente.Keys.ToList();

        // 2. Obtener misiones validadas u ocultas en esas aulas
        var candidatas = await _db.BorradoresIA
            .Where(b => b.DocenteId == request.DocenteId
                     && aulasIds.Contains(b.AulaId)
                     && (b.EstadoValidacion == "Validado" || b.EstadoValidacion == "Oculto"))
            .ToListAsync(cancellationToken);

        if (candidatas.Count == 0)
            return new List<MisionImportableDto>();

        // 3. Identificar cuáles ya fueron importadas previamente en el aula destino
        var yaImportadasSet = await _db.BorradoresIA
            .Where(b => b.AulaId == request.AulaDestinoId && b.MisionOrigenId != null)
            .Select(b => b.MisionOrigenId!.Value)
            .ToHashSetAsync(cancellationToken);

        // 4. Obtener aristas del DAG en las aulas de origen para mostrar dependencias
        var candidatasIds = candidatas.Select(c => c.MisionId).ToList();
        var conexiones = await _db.ConexionesMision
            .Where(c => candidatasIds.Contains(c.MisionOrigenId))
            .ToListAsync(cancellationToken);

        var conexionesPorOrigen = conexiones
            .GroupBy(c => c.MisionOrigenId)
            .ToDictionary(g => g.Key, g => g.Select(c => c.MisionDestinoId).ToList());

        return candidatas
            .OrderBy(c => c.AulaId)
            .ThenBy(c => c.TemaCurricular)
            .Select(c => new MisionImportableDto(
                c.MisionId,
                c.AulaId,
                aulasDocente.TryGetValue(c.AulaId, out var nombreAula) ? nombreAula : "Otra Aula",
                c.TemaCurricular,
                c.Narrativa,
                c.TipoPlantilla,
                c.RecompensaXpSugerida,
                c.EstadoValidacion,
                yaImportadasSet.Contains(c.MisionId),
                conexionesPorOrigen.TryGetValue(c.MisionId, out var sugeridas) ? sugeridas : new List<Guid>()))
            .ToList();
    }
}
