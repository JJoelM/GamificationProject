using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;
using MediatR;

namespace Core.Application.Misiones.Comandos;

public sealed record OcultarMisionCommand(Guid MisionId, Guid DocenteId) : IRequest;

public sealed class OcultarMisionCommandHandler : IRequestHandler<OcultarMisionCommand>
{
    private readonly IRepositorioMisiones _repositorio;

    public OcultarMisionCommandHandler(IRepositorioMisiones repositorio) => _repositorio = repositorio;

    public async Task Handle(OcultarMisionCommand request, CancellationToken cancellationToken)
    {
        var mision = await _repositorio.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No podés ocultar una misión que no te pertenece.");

        mision.Ocultar(request.DocenteId);

        await _repositorio.GuardarAsync(mision, cancellationToken);
    }
}
