namespace Core.Application.Misiones.Proyecciones;

public class ConexionMision
{
    public Guid MisionOrigenId { get; private set; }
    public Guid MisionDestinoId { get; private set; }
    public Guid AulaId { get; private set; }

    private ConexionMision() { }

    public ConexionMision(Guid misionOrigenId, Guid misionDestinoId, Guid aulaId)
    {
        MisionOrigenId = misionOrigenId;
        MisionDestinoId = misionDestinoId;
        AulaId = aulaId;
    }
}
