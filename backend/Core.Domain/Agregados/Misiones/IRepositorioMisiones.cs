namespace Core.Domain.Agregados.Misiones;

public interface IRepositorioMisiones
{
    Task<Mision?> ObtenerPorIdAsync(Guid misionId, CancellationToken ct = default);
    Task GuardarAsync(Mision mision, CancellationToken ct = default);
}
