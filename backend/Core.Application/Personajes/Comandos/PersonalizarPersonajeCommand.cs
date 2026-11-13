using Core.Application.Common.Behaviors;
using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;
using MediatR;

namespace Core.Application.Personajes.Comandos;

public sealed record PersonalizarPersonajeCommand(
    Guid AlumnoId, Guid AulaId,
    string? AvatarId, string? Marco, string? Mascota, string? Titulo = null) : IRequest, IAutorizacionAlumnoAula;

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
        if (request.AvatarId is not null && !EsMismoValor(request.AvatarId, personaje.AvatarEquipado))
            personaje.EquiparArticulo(request.AvatarId, TipoArticulo.Avatar, request.AvatarId);
        if (request.Marco is not null && !EsMismoValor(request.Marco, personaje.MarcoEquipado))
            personaje.EquiparArticulo(request.Marco, TipoArticulo.Marco, request.Marco);
        if (request.Mascota is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Mascota) || string.Equals(request.Mascota, "ninguna", StringComparison.OrdinalIgnoreCase))
                personaje.DesequiparMascota();
            else if (!EsMismoValor(request.Mascota, personaje.MascotaEquipada))
                personaje.EquiparArticulo(request.Mascota, TipoArticulo.Mascota, request.Mascota);
        }
        if (request.Titulo is not null && !EsMismoValor(request.Titulo, personaje.TituloEquipado))
            personaje.EquiparArticulo(request.Titulo, TipoArticulo.Titulo, request.Titulo);

        await _repositorio.GuardarAsync(personaje, cancellationToken);
    }

    private static bool EsMismoValor(string solicitado, string? actual)
    {
        if (string.Equals(solicitado, actual, StringComparison.OrdinalIgnoreCase)) return true;
        if (actual is null) return false;

        var catSolicitado = CatalogoBazar.Buscar(solicitado)?.Id;
        var catActual = CatalogoBazar.Buscar(actual)?.Id;
        return catSolicitado is not null && string.Equals(catSolicitado, catActual, StringComparison.OrdinalIgnoreCase);
    }
}
