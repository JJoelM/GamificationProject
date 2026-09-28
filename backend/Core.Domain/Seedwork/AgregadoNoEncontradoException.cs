namespace Core.Domain.SeedWork;

public sealed class AgregadoNoEncontradoException : Exception
{
    public AgregadoNoEncontradoException(string tipoAgregado, Guid id)
        : base($"No existe un(a) {tipoAgregado} con Id {id}.") { }
}
