namespace Core.Domain.Entidades;

// Tabla intermedia explícita, no muchos-a-muchos implícito: FechaInscripcion
// depende de la combinación Aula+Alumno, no de ninguna de las dos por separado (2FN).
public class Inscripcion
{
    public Guid AulaId { get; private set; }
    public Aula Aula { get; private set; } = default!;
    public Guid AlumnoId { get; private set; }
    public Usuario Alumno { get; private set; } = default!;
    public DateTime FechaInscripcion { get; private set; }

    private Inscripcion() { }

    public Inscripcion(Guid aulaId, Guid alumnoId)
    {
        AulaId = aulaId;
        AlumnoId = alumnoId;
        FechaInscripcion = DateTime.UtcNow;
    }
}
