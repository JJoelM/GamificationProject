using Core.Application.Common;
using Core.Domain.Agregados.Personajes;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Personajes.Comandos;

public sealed record ComprarArticuloBazarCommand(
    Guid AlumnoId, Guid AulaId, string ArticuloId) : IRequest;

public sealed class ComprarArticuloBazarCommandHandler : IRequestHandler<ComprarArticuloBazarCommand>
{
    private readonly IRepositorioPersonajes _repositorio;
    private readonly IApplicationDbContext _db;

    public ComprarArticuloBazarCommandHandler(IRepositorioPersonajes repositorio, IApplicationDbContext db)
    {
        _repositorio = repositorio;
        _db = db;
    }

    public async Task Handle(ComprarArticuloBazarCommand request, CancellationToken cancellationToken)
    {
        var estaInscripto = await _db.Inscripciones
            .AnyAsync(i => i.AulaId == request.AulaId && i.AlumnoId == request.AlumnoId, cancellationToken);
        if (!estaInscripto)
            throw new UnauthorizedAccessException("No estás inscripto en esta Aula.");

        var articulo = CatalogoBazar.Buscar(request.ArticuloId)
            ?? throw new ArgumentException($"Artículo inexistente en el catálogo del bazar: '{request.ArticuloId}'.");

        var personajeId = IdentidadCompuesta.Combinar(request.AlumnoId, request.AulaId);
        var personaje = await _repositorio.ObtenerPorIdAsync(personajeId, cancellationToken)
            ?? Personaje.Iniciar(request.AlumnoId, request.AulaId);

        personaje.ComprarArticulo(articulo.Id, articulo.CostoAp, articulo.Tipo, articulo.Id);

        await _repositorio.GuardarAsync(personaje, cancellationToken);
    }
}
