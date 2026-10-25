using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;
using MediatR;

namespace Core.Application.Personajes.Comandos;

public sealed record PersonalizarPersonajeCommand(
    Guid AlumnoId, Guid AulaId,
    string? AvatarId, string? Marco, string? Mascota) : IRequest;

public sealed class PersonalizarPersonajeCommandHandler : IRequestHandler<PersonalizarPersonajeCommand>
{
    private readonly IRepositorioPersonajes _repositorio;

    public PersonalizarPersonajeCommandHandler(IRepositorioPersonajes repositorio) => _repositorio = repositorio;

    public async Task Handle(PersonalizarPersonajeCommand request, CancellationToken cancellationToken)
    {
        var personajeId = IdentidadCompuesta.Combinar(request.AlumnoId, request.AulaId);
        var personaje = await _repositorio.ObtenerPorIdAsync(personajeId, cancellationToken)
            ?? throw new InvalidOperationException("El personaje aún no tiene progreso registrado en esta Aula.");

        // Equipar (no ComprarArticulo) -- el artículo ya debe estar en _cosmeticosComprados.
        // Cada llamada genera un ArticuloEquipado en el Ledger, no un ArticuloComprado.
        if (request.AvatarId is not null)
            personaje.EquiparArticulo(request.AvatarId, TipoArticulo.Avatar, request.AvatarId);
        if (request.Marco is not null)
            personaje.EquiparArticulo(request.Marco, TipoArticulo.Marco, request.Marco);
        if (request.Mascota is not null)
            personaje.EquiparArticulo(request.Mascota, TipoArticulo.Mascota, request.Mascota);

        await _repositorio.GuardarAsync(personaje, cancellationToken);
    }
}
