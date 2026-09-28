namespace Core.Domain.SeedWork;

// Un evento de dominio real y tipado (MisionGenerada, etc.), no el envoltorio
// de persistencia (EventoPersistido, en Infrastructure). La capa de Infrastructure
// es responsable de serializar estos eventos al guardarlos en el Event Store.
public interface IEventoDominio
{
    DateTime OcurridoEn { get; }
}
