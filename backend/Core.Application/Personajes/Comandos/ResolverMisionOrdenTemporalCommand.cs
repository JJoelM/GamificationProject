using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Personajes.Comandos;

public sealed record ResolverMisionOrdenTemporalCommand(
    Guid MisionId, Guid AlumnoId, List<string> OrdenPropuesto, string EventoCulpableElegido, DateOnly Fecha)
    : IRequest<ResultadoResolucionOrdenTemporal>;

public sealed record ResultadoResolucionOrdenTemporal(
    int PorcentajeCorrecto, bool CulpableIdentificadoCorrectamente, string ExplicacionCorrecta,
    List<string> OrdenCorrecto, string EventoCulpableId,
    int XpGanado, int ApGanado, bool EsRepaso);

public sealed class ResolverMisionOrdenTemporalCommandHandler
    : IRequestHandler<ResolverMisionOrdenTemporalCommand, ResultadoResolucionOrdenTemporal>
{
    private const int MaxEventosPropuestos = 200;

    private readonly IRepositorioMisiones _repositorioMisiones;
    private readonly IRepositorioPersonajes _repositorioPersonajes;
    private readonly IApplicationDbContext _db;

    public ResolverMisionOrdenTemporalCommandHandler(
        IRepositorioMisiones repositorioMisiones, IRepositorioPersonajes repositorioPersonajes, IApplicationDbContext db)
    {
        _repositorioMisiones = repositorioMisiones;
        _repositorioPersonajes = repositorioPersonajes;
        _db = db;
    }

    public async Task<ResultadoResolucionOrdenTemporal> Handle(
        ResolverMisionOrdenTemporalCommand request, CancellationToken cancellationToken)
    {
        // Mismo tope defensivo que ResolverMisionCommand: el body viene del cliente.
        if (request.OrdenPropuesto is null || request.OrdenPropuesto.Count > MaxEventosPropuestos)
            throw new ArgumentException("El orden propuesto es inválido o excede el máximo permitido.", nameof(request.OrdenPropuesto));

        var mision = await _repositorioMisiones.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.Estado != EstadoMision.Validada)
            throw new InvalidOperationException(
                $"No se puede resolver una mision en estado {mision.Estado}. Solo las Validadas están disponibles.");

        var estaInscripto = await _db.Inscripciones
            .AnyAsync(i => i.AulaId == mision.AulaId && i.AlumnoId == request.AlumnoId, cancellationToken);
        if (!estaInscripto)
            throw new UnauthorizedAccessException("No estás inscripto en el Aula de esta misión.");

        var resultado = mision.CalificarOrdenTemporal(
            new RespuestaOrdenTemporal(request.OrdenPropuesto, request.EventoCulpableElegido ?? string.Empty));

        var personajeId = IdentidadCompuesta.Combinar(request.AlumnoId, mision.AulaId);
        var personaje = await _repositorioPersonajes.ObtenerPorIdAsync(personajeId, cancellationToken)
            ?? Personaje.Iniciar(request.AlumnoId, mision.AulaId);

        // Misma formula que ResolverMisionCommand -- si cambia alli, cambiar aca.
        // (Solo dos ocurrencias: no se abstrae todavia, Rule of Three.)
        var recompensaApBase = Math.Max(25, mision.RecompensaXp / 4);
        personaje.RegistrarResolucionDeMision(
            mision.Id, mision.RecompensaXp, recompensaApBase, resultado.PorcentajeCorrecto, request.Fecha);

        var eventoGenerado = (ProgresoActualizado)personaje.EventosNoConfirmados[^1];

        await _repositorioPersonajes.GuardarAsync(personaje, cancellationToken);

        return new ResultadoResolucionOrdenTemporal(
            resultado.PorcentajeCorrecto, resultado.CulpableIdentificadoCorrectamente, resultado.ExplicacionCorrecta,
            resultado.OrdenCorrecto, resultado.EventoCulpableId,
            eventoGenerado.XpGanado, eventoGenerado.ApGanado, eventoGenerado.EsRepaso);
    }
}
