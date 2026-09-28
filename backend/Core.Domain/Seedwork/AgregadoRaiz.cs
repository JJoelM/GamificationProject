namespace Core.Domain.SeedWork;

public abstract class AgregadoRaiz
{
    public Guid Id { get; protected set; }

    // -1: el agregado todavia no tiene eventos aplicados. Es el numero de version
    // que se compara contra la restriccion UNIQUE(AggregateId, Version) al persistir.
    public int Version { get; private set; } = -1;

    private readonly List<IEventoDominio> _eventosNoConfirmados = new();
    public IReadOnlyList<IEventoDominio> EventosNoConfirmados => _eventosNoConfirmados.AsReadOnly();

    // Un comando llama a esto luego de validar sus invariantes. Aplica el evento
    // al estado interno YA MISMO (para que el resto del comando vea el estado
    // actualizado) y lo deja pendiente de persistir.
    protected void RegistrarEvento(IEventoDominio evento)
    {
        Aplicar(evento);
        _eventosNoConfirmados.Add(evento);
        Version++;
    }

    // El "Complete Rebuild" de Event Sourcing (Fowler): reconstruye el agregado
    // completo repitiendo su historial, sin tocar la base de datos de nuevo.
    public void CargarDesdeHistorial(IEnumerable<IEventoDominio> historial)
    {
        foreach (var evento in historial)
        {
            Aplicar(evento);
            Version++;
        }
    }

    public void MarcarEventosComoConfirmados() => _eventosNoConfirmados.Clear();

    // Cada agregado concreto decide como cada tipo de evento cambia su estado interno.
    protected abstract void Aplicar(IEventoDominio evento);
}
