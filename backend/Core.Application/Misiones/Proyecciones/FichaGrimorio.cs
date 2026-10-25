namespace Core.Application.Misiones.Proyecciones;

// Proyeccion generada automaticamente al validar una mision. Se construye a
// partir del payload existente (TemaCurricular + preguntas + explicaciones)
// sin llamar a la IA de nuevo -- la IA ya hizo su trabajo al generar la mision.
// Al momento de desbloqueo (alumno completa la mision), el Grimorio marca la
// ficha como desbloqueada para ese alumno en la tabla FichaGrimorioDesbloqueada.
public class FichaGrimorio
{
    public Guid FichaId { get; private set; }
    public Guid MisionId { get; private set; }
    public Guid AulaId { get; private set; }
    public string TemaCurricular { get; private set; } = default!;
    public string Narrativa { get; private set; } = default!;
    public string ConceptosClave { get; private set; } = default!; // JSON: lista de strings
    public DateTime CreadaEn { get; private set; }

    private FichaGrimorio() { }

    public FichaGrimorio(Guid misionId, Guid aulaId, string temaCurricular, string narrativa, string conceptosClave)
    {
        FichaId = Guid.NewGuid();
        MisionId = misionId;
        AulaId = aulaId;
        TemaCurricular = temaCurricular;
        Narrativa = narrativa;
        ConceptosClave = conceptosClave;
        CreadaEn = DateTime.UtcNow;
    }
}

public class FichaGrimorioDesbloqueada
{
    public Guid FichaId { get; private set; }
    public Guid AlumnoId { get; private set; }
    public DateTime DesbloquedaEn { get; private set; }

    private FichaGrimorioDesbloqueada() { }

    public FichaGrimorioDesbloqueada(Guid fichaId, Guid alumnoId)
    {
        FichaId = fichaId;
        AlumnoId = alumnoId;
        DesbloquedaEn = DateTime.UtcNow;
    }
}
