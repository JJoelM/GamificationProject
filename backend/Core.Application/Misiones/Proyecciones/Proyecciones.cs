namespace Core.Application.Misiones.Proyecciones;

// Proyección de lectura -- NO es un agregado. No protege invariantes propias,
// se reconstruye a partir de los eventos de Mision (ver
// RepositorioMisiones.AplicarAProyeccionAsync en Infrastructure). Vive en
// Application porque los query handlers necesitan verla sin que Application
// dependa de Infrastructure.
public class BorradorIA
{
    public Guid MisionId { get; private set; }
    public Guid DocenteId { get; private set; }
    public Guid AulaId { get; private set; }
    public string TemaCurricular { get; private set; } = default!;
    public string Narrativa { get; private set; } = default!;
    public string TipoPlantilla { get; private set; } = default!;
    public string PayloadJson { get; private set; } = default!;
    public int NivelConfianzaIA { get; private set; }
    public int RecompensaXpSugerida { get; private set; }
    public string EstadoValidacion { get; private set; } = "Pendiente"; // Pendiente | Validado | Rechazado
    public string? MotivoRechazo { get; private set; }

    private BorradorIA() { } // EF

    public BorradorIA(
        Guid misionId, Guid docenteId, Guid aulaId, string temaCurricular, string narrativa,
        string tipoPlantilla, string payloadJson, int nivelConfianzaIA, int recompensaXpSugerida)
    {
        MisionId = misionId;
        DocenteId = docenteId;
        AulaId = aulaId;
        TemaCurricular = temaCurricular;
        Narrativa = narrativa;
        TipoPlantilla = tipoPlantilla;
        PayloadJson = payloadJson;
        NivelConfianzaIA = nivelConfianzaIA;
        RecompensaXpSugerida = recompensaXpSugerida;
    }

    public void Actualizar(string narrativa, string payloadJson, int recompensaXp)
    {
        Narrativa = narrativa;
        PayloadJson = payloadJson;
        RecompensaXpSugerida = recompensaXp;
    }

    public void MarcarComoValidado() => EstadoValidacion = "Validado";

    public void MarcarComoRechazado(string motivo)
    {
        EstadoValidacion = "Rechazado";
        MotivoRechazo = motivo;
    }
}

// Misma idea: la vista del alumno sobre qué misiones puede resolver. Comparte
// el mismo Id que el agregado Mision -- no hace falta un Id nuevo, y ya no
// necesitamos un campo separado de "borrador de origen": el MisionId ya ES
// esa trazabilidad (más simple que el diagrama ER original de hace varias
// sesiones, que sí tenía un campo aparte para eso).
public class MisionActiva
{
    public Guid MisionId { get; private set; }
    public Guid DocenteId { get; private set; }
    public Guid AulaId { get; private set; }
    public string Narrativa { get; private set; } = default!;
    public string TipoPlantilla { get; private set; } = default!;
    public string PayloadJson { get; private set; } = default!;
    public int RecompensaXp { get; private set; }

    private MisionActiva() { }

    public MisionActiva(
        Guid misionId, Guid docenteId, Guid aulaId, string narrativa,
        string tipoPlantilla, string payloadJson, int recompensaXp)
    {
        MisionId = misionId;
        DocenteId = docenteId;
        AulaId = aulaId;
        Narrativa = narrativa;
        TipoPlantilla = tipoPlantilla;
        PayloadJson = payloadJson;
        RecompensaXp = recompensaXp;
    }
}
