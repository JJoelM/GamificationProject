using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using Core.Domain.Agregados.Personajes;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Personajes.Comandos;

public sealed record UsarPistaCommand(
    Guid MisionId, Guid AlumnoId, int IndicePregunta, List<string> OpcionesYaDescartadas)
    : IRequest<ResultadoPista>;

public sealed record ResultadoPista(string OpcionADescartar, int PistasRestantes);

public sealed class UsarPistaCommandHandler : IRequestHandler<UsarPistaCommand, ResultadoPista>
{
    private const int MaxOpcionesDescartadas = 20;

    private readonly IRepositorioMisiones _repositorioMisiones;
    private readonly IRepositorioPersonajes _repositorioPersonajes;
    private readonly IApplicationDbContext _db;

    public UsarPistaCommandHandler(
        IRepositorioMisiones repositorioMisiones, IRepositorioPersonajes repositorioPersonajes, IApplicationDbContext db)
    {
        _repositorioMisiones = repositorioMisiones;
        _repositorioPersonajes = repositorioPersonajes;
        _db = db;
    }

    public async Task<ResultadoPista> Handle(UsarPistaCommand request, CancellationToken cancellationToken)
    {
        if (request.OpcionesYaDescartadas.Count > MaxOpcionesDescartadas)
            throw new ArgumentException("Cantidad de opciones descartadas fuera de rango.");

        var mision = await _repositorioMisiones.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.Estado != EstadoMision.Validada)
            throw new TransicionDeEstadoInvalidaException(
                $"No se pueden usar pistas en una mision en estado {mision.Estado}.");

        var estaInscripto = await _db.Inscripciones
            .AnyAsync(i => i.AulaId == mision.AulaId && i.AlumnoId == request.AlumnoId, cancellationToken);
        if (!estaInscripto)
            throw new UnauthorizedAccessException("No estás inscripto en el Aula de esta misión.");

        // Primero se calcula la pista (puede fallar sin cobrar nada) y recien despues se consume.
        var opcion = mision.ObtenerOpcionADescartar(request.IndicePregunta, request.OpcionesYaDescartadas);

        var personajeId = IdentidadCompuesta.Combinar(request.AlumnoId, mision.AulaId);
        var personaje = await _repositorioPersonajes.ObtenerPorIdAsync(personajeId, cancellationToken)
            ?? throw new TransicionDeEstadoInvalidaException(
                "No tenés pistas disponibles. Podés comprarlas en el Bazar.");

        personaje.UsarPista(mision.Id, request.IndicePregunta);
        await _repositorioPersonajes.GuardarAsync(personaje, cancellationToken);

        return new ResultadoPista(opcion, personaje.PistasDisponibles);
    }
}
