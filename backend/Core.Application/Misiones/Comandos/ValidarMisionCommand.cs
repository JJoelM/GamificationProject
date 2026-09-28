using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;
using MediatR;

namespace Core.Application.Misiones.Comandos;

public sealed record ValidarMisionCommand(Guid MisionId, Guid DocenteId) : IRequest;

public sealed class ValidarMisionCommandHandler : IRequestHandler<ValidarMisionCommand>
{
    private readonly IRepositorioMisiones _repositorio;

    public ValidarMisionCommandHandler(IRepositorioMisiones repositorio) => _repositorio = repositorio;

    public async Task Handle(ValidarMisionCommand request, CancellationToken cancellationToken)
    {
        var mision = await _repositorio.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No podés validar una misión que no te pertenece.");

        mision.Validar(request.DocenteId);

        await _repositorio.GuardarAsync(mision, cancellationToken);
    }
}
