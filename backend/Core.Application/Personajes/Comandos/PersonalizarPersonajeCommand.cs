using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;
using MediatR;

namespace Core.Application.Personajes.Comandos;

public sealed record PersonalizarPersonajeCommand(
    Guid AlumnoId, Guid AulaId,
    string? AvatarId, string? Marco, string? Mascota, string? Titulo = null) : IRequest;

public sealed class PersonalizarPersonajeCommandHandler : IRequestHandler<PersonalizarPersonajeCommand>
{
    private readonly IRepositorioPersonajes _repositorio;

    public PersonalizarPersonajeCommandHandler(IRepositorioPersonajes repositorio) => _repositorio = repositorio;

    public async Task Handle(PersonalizarPersonajeCommand request, CancellationToken cancellationToken)
    {
        var personajeId = IdentidadCompuesta.Combinar(request.AlumnoId, request.AulaId);
        var personaje = await _repositorio.ObtenerPorIdAsync(personajeId, cancellationToken)
            ?? Personaje.Iniciar(request.AlumnoId, request.AulaId);

        // Equipar sólo los cosméticos que hayan sido especificados y difieran de lo equipado actualmente
        if (request.AvatarId is not null && request.AvatarId != personaje.AvatarEquipado)
            personaje.EquiparArticulo(request.AvatarId, TipoArticulo.Avatar, request.AvatarId);
        if (request.Marco is not null && request.Marco != personaje.MarcoEquipado)
            personaje.EquiparArticulo(request.Marco, TipoArticulo.Marco, request.Marco);
        if (request.Mascota is not null && request.Mascota != personaje.MascotaEquipada)
            personaje.EquiparArticulo(request.Mascota, TipoArticulo.Mascota, request.Mascota);
        if (request.Titulo is not null && request.Titulo != personaje.TituloEquipado)
            personaje.EquiparArticulo(request.Titulo, TipoArticulo.Titulo, request.Titulo);

        await _repositorio.GuardarAsync(personaje, cancellationToken);
    }
}
