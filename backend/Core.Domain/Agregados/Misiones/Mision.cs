using System.Text.Json;
using Core.Domain.Agregados.Misiones.Eventos;
using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Misiones;

public sealed class Mision : AgregadoRaiz
{
    public EstadoMision Estado { get; private set; }
    public Guid DocenteId { get; private set; }
    public Guid AulaId { get; private set; }
    public string TemaCurricular { get; private set; } = default!;
    public string Narrativa { get; private set; } = default!;
    public string TipoPlantilla { get; private set; } = default!;
    public string PayloadJson { get; private set; } = default!;
    public int NivelConfianzaIA { get; private set; }
    public int RecompensaXp { get; private set; }

    // Case-insensitive a proposito: PayloadJson puede haber sido escrito por
    // distintos caminos con el tiempo (serializacion C#, un fixture de test,
    // eventualmente una edicion manual) -- no vale la pena que Calificar
    // dependa silenciosamente de que todos usen exactamente la misma
    // convencion de mayusculas/minusculas. Default de System.Text.Json es
    // case-sensitive, a diferencia de Newtonsoft; hay que pedirlo explicito.
    private static readonly JsonSerializerOptions OpcionesJson = new() { PropertyNameCaseInsensitive = true };

    // Mismos criterios que los límites del microservicio de IA (ai-service),
    // aplicados acá también porque POST /api/misiones (el endpoint de
    // prueba/mock) no pasa por Python -- sin esto, ese camino queda sin protección.
    private const int MaxLongitudTemaCurricular = 200;
    private const int MaxLongitudTextoFuente = 20_000;
    private const int MaxLongitudNarrativa = 2_000;
    private const int MaxLongitudPayloadJson = 50_000;

    private Mision() { }

    public static Mision ParaReconstruccion() => new();

    // Una Mision nace unicamente a traves de esta
    // factory, que es el unico lugar donde se permite crear el evento inicial.
    // Asi es imposible tener en memoria una Mision en un estado que nunca paso
    // por una regla de negocio validada.
    public static Mision Generar(
        Guid docenteId,
        Guid aulaId,
        string temaCurricular,
        string textoFuente,
        string narrativa,
        string tipoPlantilla,
        string payloadJson,
        int nivelConfianzaIA,
        int recompensaXpSugerida)
    {
        if (nivelConfianzaIA is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(nivelConfianzaIA), "Debe estar entre 0 y 100.");

        ValidarLongitudes(temaCurricular, textoFuente, narrativa, payloadJson);

        var mision = new Mision { Id = Guid.NewGuid() };
        mision.RegistrarEvento(new MisionGenerada(
            mision.Id, docenteId, aulaId, temaCurricular, textoFuente, narrativa,
            tipoPlantilla, payloadJson, nivelConfianzaIA, recompensaXpSugerida,
            DateTime.UtcNow));
        return mision;
    }

    private static void ValidarLongitudes(
        string temaCurricular, string textoFuente, string narrativa, string payloadJson)
    {
        if (temaCurricular.Length > MaxLongitudTemaCurricular)
            throw new ArgumentException($"TemaCurricular excede {MaxLongitudTemaCurricular} caracteres.");
        if (textoFuente.Length > MaxLongitudTextoFuente)
            throw new ArgumentException($"TextoFuente excede {MaxLongitudTextoFuente} caracteres.");
        if (narrativa.Length > MaxLongitudNarrativa)
            throw new ArgumentException($"Narrativa excede {MaxLongitudNarrativa} caracteres.");
        if (payloadJson.Length > MaxLongitudPayloadJson)
            throw new ArgumentException($"PayloadJson excede {MaxLongitudPayloadJson} caracteres.");
    }

    public void Validar(Guid docenteId)
    {
        if (Estado != EstadoMision.Generada)
            throw new InvalidOperationException(
                $"Solo se puede validar una mision en estado Generada. Estado actual: {Estado}.");

        RegistrarEvento(new MisionValidada(Id, docenteId, DateTime.UtcNow));
    }

    // Solo mientras esta pendiente de revision (Generada). Cada llamada es un
    // evento propio en el Ledger. 
    // Si el docente edita tres veces antes de aprobar, las tres ediciones
    // quedan en el historial siedno la evidencia completa de la intervencion humana sobre
    // lo que propuso la IA
    public void Editar(Guid docenteId, string narrativa, string payloadJson, int recompensaXp)
    {
        if (Estado != EstadoMision.Generada)
            throw new InvalidOperationException(
                $"Solo se puede editar una mision pendiente de revision (Generada). Estado actual: {Estado}.");

        if (string.IsNullOrWhiteSpace(narrativa))
            throw new ArgumentException("La narrativa no puede quedar vacia.", nameof(narrativa));

        if (string.IsNullOrWhiteSpace(payloadJson))
            throw new ArgumentException("El payload no puede quedar vacio.", nameof(payloadJson));

        if (narrativa.Length > MaxLongitudNarrativa)
            throw new ArgumentException($"Narrativa excede {MaxLongitudNarrativa} caracteres.");
        if (payloadJson.Length > MaxLongitudPayloadJson)
            throw new ArgumentException($"PayloadJson excede {MaxLongitudPayloadJson} caracteres.");

        RegistrarEvento(new MisionEditada(Id, docenteId, narrativa, payloadJson, recompensaXp, DateTime.UtcNow));
    }

    public void Rechazar(Guid docenteId, string motivo)
    {
        if (Estado != EstadoMision.Generada)
            throw new InvalidOperationException(
                $"Solo se puede rechazar una mision en estado Generada. Estado actual: {Estado}.");

        if (string.IsNullOrWhiteSpace(motivo))
            throw new ArgumentException(
                "El rechazo requiere un motivo -- es parte de lo que queda auditado en el Ledger.",
                nameof(motivo));

        RegistrarEvento(new MisionRechazada(Id, docenteId, motivo, DateTime.UtcNow));
    }

    // Consulta de solo lectura -- no genera evento ni cambia Version.
    public ResultadoCalificacion Calificar(IReadOnlyList<RespuestaAlumno> respuestas)
    {
        if (TipoPlantilla != "OpcionMultiple")
            throw new NotSupportedException(
                $"Calificacion automatica no implementada todavia para el tipo '{TipoPlantilla}'.");

        var contenido = JsonSerializer.Deserialize<ContenidoOpcionMultiple>(PayloadJson, OpcionesJson)
            ?? throw new InvalidOperationException("El payload de la mision no tiene el formato esperado.");

        if (contenido.Preguntas.Count == 0)
            return new ResultadoCalificacion(0, 0, 0, new List<FeedbackPregunta>());

        // Se itera sobre las preguntas del payload (la fuente canónica), no
        // sobre las respuestas del alumno: así una respuesta duplicada para
        // el mismo índice no puede contar dos veces, y una pregunta sin
        // responder simplemente queda marcada como incorrecta, sin romper el cálculo.
        var correctas = 0;
        var feedback = new List<FeedbackPregunta>(contenido.Preguntas.Count);

        for (var i = 0; i < contenido.Preguntas.Count; i++)
        {
            var pregunta = contenido.Preguntas[i];
            var respuesta = respuestas.FirstOrDefault(r => r.IndicePregunta == i);
            var esCorrecta = respuesta is not null
                && string.Equals(pregunta.RespuestaCorrecta, respuesta.OpcionElegida, StringComparison.Ordinal);

            if (esCorrecta) correctas++;

            feedback.Add(new FeedbackPregunta(i, esCorrecta, pregunta.RespuestaCorrecta, pregunta.Explicacion));
        }

        var porcentaje = (int)Math.Round(100.0 * correctas / contenido.Preguntas.Count);
        return new ResultadoCalificacion(porcentaje, correctas, contenido.Preguntas.Count, feedback);
    }

    protected override void Aplicar(IEventoDominio evento)
    {
        switch (evento)
        {
            case MisionGenerada e:
                Id = e.MisionId;
                DocenteId = e.DocenteId;
                AulaId = e.AulaId;
                TemaCurricular = e.TemaCurricular;
                Narrativa = e.Narrativa;
                TipoPlantilla = e.TipoPlantilla;
                PayloadJson = e.PayloadJson;
                NivelConfianzaIA = e.NivelConfianzaIA;
                RecompensaXp = e.RecompensaXpSugerida;
                Estado = EstadoMision.Generada;
                break;

            case MisionEditada e:
                Narrativa = e.Narrativa;
                PayloadJson = e.PayloadJson;
                RecompensaXp = e.RecompensaXp;
                break;

            case MisionValidada:
                Estado = EstadoMision.Validada;
                break;

            case MisionRechazada:
                Estado = EstadoMision.Rechazada;
                break;

            default:
                throw new InvalidOperationException(
                    $"Evento no reconocido por el agregado Mision: {evento.GetType().Name}");
        }
    }
}
