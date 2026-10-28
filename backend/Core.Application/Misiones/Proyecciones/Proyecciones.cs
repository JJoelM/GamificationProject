namespace Core.Application.Misiones.Proyecciones;

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
    public string EstadoValidacion { get; private set; } = "Pendiente";
    public string? MotivoRechazo { get; private set; }
    public Guid? MisionOrigenId { get; private set; }

    private BorradorIA() { }

    public BorradorIA(
        Guid misionId, Guid docenteId, Guid aulaId, string temaCurricular, string narrativa,
        string tipoPlantilla, string payloadJson, int nivelConfianzaIA, int recompensaXpSugerida,
        Guid? misionOrigenId = null)
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
        MisionOrigenId = misionOrigenId;
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
    public void MarcarComoPendiente()
    {
        EstadoValidacion = "Pendiente";
        MotivoRechazo = null;
    }
    public void MarcarComoOculto() => EstadoValidacion = "Oculto";
}

public class MisionActiva
{
    public Guid MisionId { get; private set; }
    public Guid DocenteId { get; private set; }
    public Guid AulaId { get; private set; }
    public string Narrativa { get; private set; } = default!;
    public string TipoPlantilla { get; private set; } = default!;
    public string PayloadJson { get; private set; } = default!;
    public int RecompensaXp { get; private set; }
    public bool EstaVisible { get; private set; } = true;
    public Guid? MisionOrigenId { get; private set; }

    private MisionActiva() { }

    public MisionActiva(
        Guid misionId, Guid docenteId, Guid aulaId, string narrativa,
        string tipoPlantilla, string payloadJson, int recompensaXp,
        Guid? misionOrigenId = null)
    {
        MisionId = misionId;
        DocenteId = docenteId;
        AulaId = aulaId;
        Narrativa = narrativa;
        TipoPlantilla = tipoPlantilla;
        PayloadJson = payloadJson;
        RecompensaXp = recompensaXp;
        MisionOrigenId = misionOrigenId;
    }

    // Al editar una misión ya validada, los alumnos
    // ven el contenido actualizado, no la versión original publicada.
    public void Actualizar(string narrativa, string payloadJson, int recompensaXp)
    {
        Narrativa = narrativa;
        PayloadJson = payloadJson;
        RecompensaXp = recompensaXp;
    }

    public void Ocultar() => EstaVisible = false;
    public void Republicar() => EstaVisible = true;
}
