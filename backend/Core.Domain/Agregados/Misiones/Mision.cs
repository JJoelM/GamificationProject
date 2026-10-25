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

    // Las opciones de deserializacion del payload viven en OpcionesJsonMision
    // (fuente unica compartida, case-insensitive -- ver ahi el porque).

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
        int recompensaXpSugerida,
        Guid? misionId = null)
    {
        if (nivelConfianzaIA is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(nivelConfianzaIA), "Debe estar entre 0 y 100.");

        ValidarLongitudes(temaCurricular, textoFuente, narrativa, payloadJson);

        var id = misionId ?? Guid.NewGuid();
        var mision = new Mision { Id = id };
        mision.RegistrarEvento(new MisionGenerada(
            id, docenteId, aulaId, temaCurricular, textoFuente, narrativa,
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

    public void Ocultar(Guid docenteId)
    {
        if (Estado != EstadoMision.Validada)
            throw new InvalidOperationException($"Solo se puede ocultar una mision validada. Estado actual: {Estado}.");

        RegistrarEvento(new MisionOcultada(Id, docenteId, DateTime.UtcNow));
    }

    public void Republicar(Guid docenteId)
    {
        if (Estado != EstadoMision.Oculta)
            throw new InvalidOperationException($"Solo se puede republicar una mision oculta. Estado actual: {Estado}.");

        RegistrarEvento(new MisionRepublicada(Id, docenteId, DateTime.UtcNow));
    }

    // Consulta de solo lectura -- no genera evento ni cambia Version.
    // OpcionMultiple y BatallaDeJefe comparten esta rama -- misma forma de
    // respuesta, solo cambia el nombre del campo contenedor en el payload.
    public ResultadoCalificacion Calificar(IReadOnlyList<RespuestaAlumno> respuestas)
    {
        return TipoPlantilla switch
        {
            "OpcionMultiple" => CalificarPreguntas(
                JsonSerializer.Deserialize<ContenidoOpcionMultiple>(PayloadJson, OpcionesJsonMision.Instancia)?.Preguntas?
                    .Select(p => (p.Enunciado, p.Opciones, p.RespuestaCorrecta, p.Explicacion)).ToList()
                    ?? throw new InvalidOperationException("El payload de la mision no tiene el formato esperado."),
                respuestas),
            "BatallaDeJefe" => CalificarPreguntas(
                JsonSerializer.Deserialize<ContenidoBatallaDeJefe>(PayloadJson, OpcionesJsonMision.Instancia)?.Fases?
                    .Select(f => (f.Enunciado, f.Opciones, f.RespuestaCorrecta, f.Explicacion)).ToList()
                    ?? throw new InvalidOperationException("El payload de la mision no tiene el formato esperado."),
                respuestas),
            _ => throw new NotSupportedException(
                $"Calificacion automatica no implementada todavia para el tipo '{TipoPlantilla}'."),
        };
    }

    private static ResultadoCalificacion CalificarPreguntas(
        List<(string Enunciado, List<string> Opciones, string RespuestaCorrecta, string Explicacion)> preguntas,
        IReadOnlyList<RespuestaAlumno> respuestas)
    {
        if (preguntas.Count == 0)
            return new ResultadoCalificacion(0, 0, 0, new List<FeedbackPregunta>());

        // Se itera sobre las preguntas del payload (la fuente canónica), no
        // sobre las respuestas del alumno: así una respuesta duplicada para
        // el mismo índice no puede contar dos veces, y una pregunta sin
        // responder simplemente queda marcada como incorrecta, sin romper el cálculo.
        var correctas = 0;
        var feedback = new List<FeedbackPregunta>(preguntas.Count);

        for (var i = 0; i < preguntas.Count; i++)
        {
            var pregunta = preguntas[i];
            var respuesta = respuestas.FirstOrDefault(r => r.IndicePregunta == i);
            var esCorrecta = respuesta is not null
                && string.Equals(pregunta.RespuestaCorrecta, respuesta.OpcionElegida, StringComparison.Ordinal);

            if (esCorrecta) correctas++;

            feedback.Add(new FeedbackPregunta(i, esCorrecta, pregunta.RespuestaCorrecta, pregunta.Explicacion));
        }

        var porcentaje = (int)Math.Round(100.0 * correctas / preguntas.Count);
        return new ResultadoCalificacion(porcentaje, correctas, preguntas.Count, feedback);
    }

    // Metodo propio, no una rama de Calificar: la forma de la respuesta
    // (un orden + un culpable) es genuinamente distinta, no una variante de
    // "lista de respuestas por indice". Tambien de solo lectura.
    public ResultadoOrdenTemporal CalificarOrdenTemporal(RespuestaOrdenTemporal respuesta)
    {
        if (TipoPlantilla != "LineaTemporal")
            throw new NotSupportedException(
                $"Este metodo es exclusivo del tipo 'LineaTemporal'. La mision es '{TipoPlantilla}'.");

        var contenido = JsonSerializer.Deserialize<ContenidoLineaTemporal>(PayloadJson, OpcionesJsonMision.Instancia)
            ?? throw new InvalidOperationException("El payload de la mision no tiene el formato esperado.");

        if (contenido.EventosDesordenados is null or { Count: 0 }) {
            var ordenVacio = contenido.EventosDesordenados?.OrderBy(e => e.OrdenCorrecto).Select(e => e.Id).ToList() ?? new List<string>();
            return new ResultadoOrdenTemporal(0, false, contenido.Explicacion, ordenVacio, contenido.EventoCulpableId);
        }

        // Se compara por posicion: un Id repetido en el orden propuesto no
        // puede sumar dos veces, porque cada posicion tiene un unico
        // OrdenCorrecto posible.
        var posicionesCorrectas = 0;
        for (var i = 0; i < respuesta.OrdenPropuesto.Count && i < contenido.EventosDesordenados.Count; i++)
        {
            var evento = contenido.EventosDesordenados.FirstOrDefault(e => e.Id == respuesta.OrdenPropuesto[i]);
            if (evento is not null && evento.OrdenCorrecto == i + 1)
                posicionesCorrectas++;
        }

        var culpableCorrecto = string.Equals(
            respuesta.EventoCulpableElegido, contenido.EventoCulpableId, StringComparison.Ordinal);

        // 70% por el orden, 30% por identificar al culpable: construir el
        // razonamiento completo pesa mas que la conclusion final.
        var porcentajeOrden = 100.0 * posicionesCorrectas / contenido.EventosDesordenados.Count;
        var porcentaje = Math.Min((int)Math.Round(porcentajeOrden * 0.7 + (culpableCorrecto ? 30 : 0)), 100);

        var ordenCorrecto = contenido.EventosDesordenados.OrderBy(e => e.OrdenCorrecto).Select(e => e.Id).ToList();
        return new ResultadoOrdenTemporal(porcentaje, culpableCorrecto, contenido.Explicacion, ordenCorrecto, contenido.EventoCulpableId);
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

            case MisionOcultada:
                Estado = EstadoMision.Oculta;
                break;

            case MisionRepublicada:
                Estado = EstadoMision.Validada;
                break;

            default:
                throw new InvalidOperationException(
                    $"Evento no reconocido por el agregado Mision: {evento.GetType().Name}");
        }
    }
}
