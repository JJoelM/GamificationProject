using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;
using MediatR;

namespace Core.Application.Misiones.Comandos;

public sealed record EditarMisionCommand(Guid MisionId, Guid DocenteId, string Narrativa, string PayloadJson, int RecompensaXp) : IRequest;

public sealed class EditarMisionCommandHandler : IRequestHandler<EditarMisionCommand>
{
    private readonly IRepositorioMisiones _repositorio;

    public EditarMisionCommandHandler(IRepositorioMisiones repositorio) => _repositorio = repositorio;

    public async Task Handle(EditarMisionCommand request, CancellationToken cancellationToken)
    {
        var mision = await _repositorio.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No podés editar una misión que no te pertenece.");

        mision.Editar(request.DocenteId, request.Narrativa, request.PayloadJson, request.RecompensaXp);

        await _repositorio.GuardarAsync(mision, cancellationToken);
    }
}
