namespace Core.Domain.Entidades;

public class Rol
{
    public Guid Id { get; private set; }
    public string Nombre { get; private set; } = default!;

    private Rol() { } // EF Core

    public Rol(string nombre) : this(Guid.NewGuid(), nombre) { }

    // Sobrecarga para seeding con Id determinístico, pactado de antemano con
    // el frontend (ver spec.md) -- no es el camino normal de creación.
    public Rol(Guid id, string nombre)
    {
        Id = id;
        Nombre = nombre;
    }
}
