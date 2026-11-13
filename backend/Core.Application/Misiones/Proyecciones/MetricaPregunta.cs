namespace Core.Application.Misiones.Proyecciones;

/// <summary>
/// Proyección pre-agregada de fallos por pregunta y opción (CQRS Read Model).
/// Permite consultar la pregunta más fallada y opción incorrecta más frecuente en O(1)
/// sin parsear JSON al vuelo en ObtenerMetricasAulaQuery.
/// </summary>
public class MetricaPregunta
{
    public Guid Id { get; private set; }
    public Guid AulaId { get; private set; }
    public Guid MisionId { get; private set; }
    public int IndicePregunta { get; private set; }
    public string Enunciado { get; private set; } = default!;
    public string OpcionElegida { get; private set; } = default!;
    public int CantidadFallos { get; private set; }

    private MetricaPregunta() { }

    public MetricaPregunta(Guid aulaId, Guid misionId, int indicePregunta, string enunciado, string opcionElegida)
    {
        Id = Guid.NewGuid();
        AulaId = aulaId;
        MisionId = misionId;
        IndicePregunta = indicePregunta;
        Enunciado = enunciado;
        OpcionElegida = opcionElegida;
        CantidadFallos = 1;
    }

    public void RegistrarFallo() => CantidadFallos++;
}
