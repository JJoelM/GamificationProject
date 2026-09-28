using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;
using MediatR;

namespace Core.Application.Misiones.Comandos;

public sealed record RechazarMisionCommand(Guid MisionId, Guid DocenteId, string Motivo) : IRequest;

public sealed class RechazarMisionCommandHandler : IRequestHandler<RechazarMisionCommand>
{
    private readonly IRepositorioMisiones _repositorio;

    public RechazarMisionCommandHandler(IRepositorioMisiones repositorio) => _repositorio = repositorio;

    public async Task Handle(RechazarMisionCommand request, CancellationToken cancellationToken)
    {
        var mision = await _repositorio.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No podés rechazar una misión que no te pertenece.");

        mision.Rechazar(request.DocenteId, request.Motivo);

        await _repositorio.GuardarAsync(mision, cancellationToken);
    }
}
