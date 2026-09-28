namespace Infrastructure.EventStore;

// Envoltorio de persistencia. No confundir con un "domain event" de MediatR
// (efecto colateral en memoria dentro de una transacción): esto es el registro
// permanente e inmutable de que algo ocurrió. Los tipos de evento tipados
// (MisionValidada, ProgresoActualizado, etc.) se agregan en la Fase 4.
public class EventoPersistido
{
    public long Id { get; private set; }          // orden de inserción total, no de negocio
    public Guid AggregateId { get; private set; }  // a qué agregado pertenece (ej. la Misión)
    public string TipoAgregado { get; private set; } = default!;
    public int Version { get; private set; }       // posición del evento dentro del agregado
    public string TipoEvento { get; private set; } = default!;
    public string Payload { get; private set; } = default!; // JSON crudo -> columna jsonb
    public DateTime OcurridoEn { get; private set; }

    private EventoPersistido() { }

    public EventoPersistido(Guid aggregateId, string tipoAgregado, int version, string tipoEvento, string payload)
    {
        AggregateId = aggregateId;
        TipoAgregado = tipoAgregado;
        Version = version;
        TipoEvento = tipoEvento;
        Payload = payload;
        OcurridoEn = DateTime.UtcNow;
    }
}
