namespace Core.Application.Personajes.Proyecciones;

// Proyeccion que persiste cada resolucion individual con su porcentaje y
// el feedback por pregunta. Necesaria para las metricas del docente
// (promedio de acierto por mision, opcion mas elegida incorrectamente) sin
// tener que reconstruir el Ledger completo en cada consulta.
public class ResolucionRegistrada
{
    public Guid Id { get; private set; }
    public Guid PersonajeId { get; private set; }
    public Guid AlumnoId { get; private set; }
    public Guid AulaId { get; private set; }
    public Guid MisionId { get; private set; }
    public int NumeroDeIntento { get; private set; }
    public int PorcentajeCorrecto { get; private set; }
    public bool EsRepaso { get; private set; }
    public string FeedbackJson { get; private set; } = default!;
    public DateOnly Fecha { get; private set; }
    public DateTime OcurridoEn { get; private set; }

    private ResolucionRegistrada() { }

    public ResolucionRegistrada(
        Guid personajeId, Guid alumnoId, Guid aulaId, Guid misionId,
        int numeroDeIntento, int porcentajeCorrecto, bool esRepaso,
        string feedbackJson, DateOnly fecha, DateTime ocurridoEn)
    {
        Id = Guid.NewGuid();
        PersonajeId = personajeId;
        AlumnoId = alumnoId;
        AulaId = aulaId;
        MisionId = misionId;
        NumeroDeIntento = numeroDeIntento;
        PorcentajeCorrecto = porcentajeCorrecto;
        EsRepaso = esRepaso;
        FeedbackJson = feedbackJson;
        Fecha = fecha;
        OcurridoEn = ocurridoEn;
    }
}
