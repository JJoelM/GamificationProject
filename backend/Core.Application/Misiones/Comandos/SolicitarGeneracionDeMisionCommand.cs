using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using MediatR;

namespace Core.Application.Misiones.Comandos;

public sealed record SolicitarGeneracionDeMisionCommand(
    Guid DocenteId, Guid AulaId, string TemaCurricular, string TextoFuente,
    TipoPlantilla TipoPlantilla = TipoPlantilla.OpcionMultiple) : IRequest<Guid>;

public sealed class SolicitarGeneracionDeMisionCommandHandler
    : IRequestHandler<SolicitarGeneracionDeMisionCommand, Guid>
{
    // Gemini no devuelve un puntaje de confianza propio via structured output
    // -- fijo un valor provisorio en vez de fingir precisión que no existe.
    // El docente lo recalibra en la práctica al revisar (aprobar/editar/rechazar).
    private const int NivelConfianzaProvisorio = 70;

    private readonly IGeneradorDeMisiones _generador;
    private readonly IRepositorioMisiones _repositorio;

    public SolicitarGeneracionDeMisionCommandHandler(
        IGeneradorDeMisiones generador, IRepositorioMisiones repositorio)
    {
        _generador = generador;
        _repositorio = repositorio;
    }

    public async Task<Guid> Handle(SolicitarGeneracionDeMisionCommand request, CancellationToken cancellationToken)
    {
        var contenido = await _generador.GenerarAsync(
            request.TipoPlantilla, request.TemaCurricular, request.TextoFuente, cancellationToken);

        // 20 XP por elemento generado (preguntas, fases, eventos): fórmula determinística
        var recompensaXp = contenido.CantidadDeElementos * 20;

        var mision = Mision.Generar(
            request.DocenteId, request.AulaId, request.TemaCurricular, request.TextoFuente,
            contenido.Narrativa, request.TipoPlantilla.ToString(), contenido.PayloadJson,
            NivelConfianzaProvisorio, recompensaXp);

        await _repositorio.GuardarAsync(mision, cancellationToken);

        return mision.Id;
    }
}
