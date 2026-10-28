using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Misiones.Comandos;

public sealed record DefinirMisionesSugeridasCommand(
    Guid MisionId, Guid DocenteId, List<Guid> MisionesSugeridas) : IRequest;

public sealed class DefinirMisionesSugeridasCommandHandler : IRequestHandler<DefinirMisionesSugeridasCommand>
{
    private readonly IRepositorioMisiones _repositorio;
    private readonly IApplicationDbContext _db;

    public DefinirMisionesSugeridasCommandHandler(IRepositorioMisiones repositorio, IApplicationDbContext db)
    {
        _repositorio = repositorio;
        _db = db;
    }

    public async Task Handle(DefinirMisionesSugeridasCommand request, CancellationToken cancellationToken)
    {
        var mision = await _repositorio.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No podés modificar las sugerencias de una misión que no te pertenece.");

        var destinos = request.MisionesSugeridas.Distinct().ToList();

        if (destinos.Count > 0)
        {
            // Regla entre agregados: los destinos tienen que existir, ser de la misma Aula
            // y no estar rechazados. Por eso se valida aca y no dentro de Mision.
            var validos = await _db.BorradoresIA
                .Where(b => destinos.Contains(b.MisionId)
                            && b.AulaId == mision.AulaId
                            && b.EstadoValidacion != "Rechazado")
                .Select(b => b.MisionId)
                .ToListAsync(cancellationToken);

            if (destinos.Except(validos).Any())
                throw new ArgumentException("Hay misiones sugeridas que no existen, son de otra Aula o fueron rechazadas.");

            // El camino tiene que poder dibujarse como arbol: sin ciclos.
            var aristas = await _db.ConexionesMision
                .Where(c => c.AulaId == mision.AulaId && c.MisionOrigenId != mision.Id)
                .Select(c => new { c.MisionOrigenId, c.MisionDestinoId })
                .ToListAsync(cancellationToken);

            var pares = aristas.Select(a => (Origen: a.MisionOrigenId, Destino: a.MisionDestinoId)).ToList();

            if (CaminoGrafo.GeneraCiclo(mision.Id, destinos, pares))
                throw new ArgumentException("Esas conexiones generan un ciclo entre misiones.");
        }

        mision.DefinirMisionesSugeridas(request.DocenteId, destinos);
        await _repositorio.GuardarAsync(mision, cancellationToken);
    }
}
