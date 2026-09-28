using Core.Domain.Agregados.Misiones;
using MediatR;

namespace Core.Application.Misiones.Comandos;

// A diferencia de Validar/Editar/Rechazar, este comando no carga nada primero:
// la Mision nace aca mismo, dentro del handler, via el factory del dominio.
public sealed record GenerarMisionCommand(
    Guid DocenteId,
    Guid AulaId,
    string TemaCurricular,
    string TextoFuente,
    string Narrativa,
    string TipoPlantilla,
    string PayloadJson,
    int NivelConfianzaIA,
    int RecompensaXpSugerida) : IRequest<Guid>;

public sealed class GenerarMisionCommandHandler : IRequestHandler<GenerarMisionCommand, Guid>
{
    private readonly IRepositorioMisiones _repositorio;

    public GenerarMisionCommandHandler(IRepositorioMisiones repositorio) => _repositorio = repositorio;

    public async Task<Guid> Handle(GenerarMisionCommand request, CancellationToken cancellationToken)
    {
        var mision = Mision.Generar(
            request.DocenteId,
            request.AulaId,
            request.TemaCurricular,
            request.TextoFuente,
            request.Narrativa,
            request.TipoPlantilla,
            request.PayloadJson,
            request.NivelConfianzaIA,
            request.RecompensaXpSugerida);

        await _repositorio.GuardarAsync(mision, cancellationToken);

        // El caller (el endpoint que recibe la respuesta del microservicio Python)
        // necesita este Id para poder mostrarle el borrador al docente despues.
        return mision.Id;
    }
}
