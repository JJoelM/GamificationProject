namespace Core.Domain.Agregados.Personajes;

public interface IRepositorioPersonajes
{
    Task<Personaje?> ObtenerPorIdAsync(Guid personajeId, CancellationToken ct = default);
    Task GuardarAsync(Personaje personaje, CancellationToken ct = default);
}
