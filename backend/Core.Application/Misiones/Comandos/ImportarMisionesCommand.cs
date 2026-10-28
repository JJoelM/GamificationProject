using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Misiones.Comandos;

public sealed record ImportarMisionesCommand(
    Guid DocenteId,
    Guid AulaDestinoId,
    List<Guid> MisionesIds) : IRequest<ResultadoImportacionDto>;

public sealed record ResultadoImportacionDto(
    int TotalImportadas,
    List<Guid> MisionesNuevasIds,
    int ConexionesRemapeadas);

public sealed class ImportarMisionesCommandHandler
    : IRequestHandler<ImportarMisionesCommand, ResultadoImportacionDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IRepositorioMisiones _repositorioMisiones;

    public ImportarMisionesCommandHandler(
        IApplicationDbContext db,
        IRepositorioMisiones repositorioMisiones)
    {
        _db = db;
        _repositorioMisiones = repositorioMisiones;
    }

    public async Task<ResultadoImportacionDto> Handle(
        ImportarMisionesCommand request, CancellationToken cancellationToken)
    {
        if (request.MisionesIds == null || request.MisionesIds.Count == 0)
            throw new ArgumentException("Debes seleccionar al menos una misión para importar.");

        // 1. Validar que el aula destino exista y pertenezca al docente autenticado
        var aulaDestino = await _db.Aulas
            .FirstOrDefaultAsync(a => a.Id == request.AulaDestinoId && a.DocenteId == request.DocenteId, cancellationToken)
            ?? throw new UnauthorizedAccessException("El aula destino no existe o no tienes permisos de docente sobre ella.");

        // 2. Obtener las misiones originales del docente en otras aulas (deben ser Validadas u Ocultas)
        var idsUnicos = request.MisionesIds.Distinct().ToList();
        var misionesOrigen = await _db.BorradoresIA
            .Where(b => b.DocenteId == request.DocenteId
                     && b.AulaId != request.AulaDestinoId
                     && idsUnicos.Contains(b.MisionId)
                     && (b.EstadoValidacion == "Validado" || b.EstadoValidacion == "Oculto"))
            .ToListAsync(cancellationToken);

        if (misionesOrigen.Count == 0)
            throw new ArgumentException("No se encontraron misiones válidas de tu autoría para importar hacia esta aula.");

        // 3. Crear el mapeo idOrigen -> nuevoId para remapear las conexiones del DAG
        var idMapping = misionesOrigen.ToDictionary(m => m.MisionId, _ => Guid.NewGuid());

        // 4. Obtener las aristas salientes de las misiones de origen
        var connsOrigen = await _db.ConexionesMision
            .Where(c => idMapping.Keys.Contains(c.MisionOrigenId))
            .ToListAsync(cancellationToken);

        var conexionesRemapeadas = 0;

        // 5. Instanciar y guardar cada copia como nueva misión independiente en estado Generada (Pendiente)
        foreach (var orig in misionesOrigen)
        {
            var nuevoId = idMapping[orig.MisionId];

            var nuevaMision = Mision.Generar(
                docenteId: request.DocenteId,
                aulaId: request.AulaDestinoId,
                temaCurricular: orig.TemaCurricular,
                textoFuente: "", // Copia de borrador
                narrativa: orig.Narrativa,
                tipoPlantilla: orig.TipoPlantilla,
                payloadJson: orig.PayloadJson,
                nivelConfianzaIA: orig.NivelConfianzaIA,
                recompensaXpSugerida: orig.RecompensaXpSugerida,
                misionId: nuevoId,
                misionOrigenId: orig.MisionId);

            // Remapear las flechas: solo hacia aquellas misiones que también se importaron en esta tanda
            var destinosRemapeados = connsOrigen
                .Where(c => c.MisionOrigenId == orig.MisionId && idMapping.ContainsKey(c.MisionDestinoId))
                .Select(c => idMapping[c.MisionDestinoId])
                .Distinct()
                .ToList();

            if (destinosRemapeados.Count > 0)
            {
                conexionesRemapeadas += destinosRemapeados.Count;
                nuevaMision.DefinirMisionesSugeridas(request.DocenteId, destinosRemapeados);
            }

            await _repositorioMisiones.GuardarAsync(nuevaMision, cancellationToken);
        }

        return new ResultadoImportacionDto(
            TotalImportadas: misionesOrigen.Count,
            MisionesNuevasIds: idMapping.Values.ToList(),
            ConexionesRemapeadas: conexionesRemapeadas);
    }
}
