using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;
using MediatR;

namespace Core.Application.Misiones.Comandos;

public sealed record RepublicarMisionCommand(Guid MisionId, Guid DocenteId) : IRequest;

public sealed class RepublicarMisionCommandHandler : IRequestHandler<RepublicarMisionCommand>
{
    private readonly IRepositorioMisiones _repositorio;

    public RepublicarMisionCommandHandler(IRepositorioMisiones repositorio) => _repositorio = repositorio;

    public async Task Handle(RepublicarMisionCommand request, CancellationToken cancellationToken)
    {
        var mision = await _repositorio.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No podés republicar una misión que no te pertenece.");

        mision.Republicar(request.DocenteId);

        await _repositorio.GuardarAsync(mision, cancellationToken);
    }
}
