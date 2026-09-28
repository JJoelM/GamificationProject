using System.Security.Cryptography;

namespace Core.Domain.Entidades;

public class Aula
{
    public Guid Id { get; private set; }
    public string Nombre { get; private set; } = default!;
    public Guid DocenteId { get; private set; }
    public Usuario Docente { get; private set; } = default!;
    public string CodigoInvitacion { get; private set; } = default!;

    private readonly List<Inscripcion> _inscripciones = new();
    public IReadOnlyCollection<Inscripcion> Inscripciones => _inscripciones;

    private Aula() { }

    public Aula(string nombre, Guid docenteId) : this(Guid.NewGuid(), nombre, docenteId) { }

    public Aula(Guid id, string nombre, Guid docenteId)
    {
        Id = id;
        Nombre = nombre;
        DocenteId = docenteId;
        CodigoInvitacion = GenerarCodigo();
    }

    // Codigo corto y legible para compartir (no un Guid entero en el link).
    // Alfabeto sin 0/O ni 1/I/L, para que no haya ambiguedad si alguien lo
    // transcribe a mano.
    private static string GenerarCodigo()
    {
        const string alfabeto = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        var bytes = RandomNumberGenerator.GetBytes(8);
        var codigo = new char[8];
        for (var i = 0; i < 8; i++)
            codigo[i] = alfabeto[bytes[i] % alfabeto.Length];
        return new string(codigo);
    }
}