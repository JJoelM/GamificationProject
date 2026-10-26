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

    private readonly List<Guid> _misionesSugeridas = new();
    public IReadOnlyList<Guid> MisionesSugeridas => _misionesSugeridas;

    public const int MaxMisionesSugeridas = 5;

    private const int MaxLongitudTemaCurricular = 200;
    private const int MaxLongitudTextoFuente = 20_000;
    private const int MaxLongitudNarrativa = 2_000;
    private const int MaxLongitudPayloadJson = 50_000;

    private Mision() { }

    public static Mision ParaReconstruccion() => new();

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

        var mision = new Mision { Id = misionId ?? Guid.NewGuid() };
        mision.RegistrarEvento(new MisionGenerada(
            mision.Id, docenteId, aulaId, temaCurricular, textoFuente, narrativa,
            tipoPlantilla, payloadJson, nivelConfianzaIA, recompensaXpSugerida, DateTime.UtcNow));
        return mision;
    }

    private static void ValidarLongitudes(string temaCurricular, string textoFuente, string narrativa, string payloadJson)
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
            throw new TransicionDeEstadoInvalidaException(
                $"Solo se puede validar una mision en estado Generada. Estado actual: {Estado}.");

        RegistrarEvento(new MisionValidada(Id, docenteId, DateTime.UtcNow));
    }

    // Se puede editar en Generada, Validada u Oculta. Una Rechazada es terminal.
    // Editar una mision ya publicada no altera las notas ya dadas: cada
    // ProgresoActualizado guardo el porcentaje del momento en que se resolvio.
    public void Editar(Guid docenteId, string narrativa, string payloadJson, int recompensaXp)
    {
        if (Estado == EstadoMision.Rechazada)
            throw new TransicionDeEstadoInvalidaException("No se puede editar una misión rechazada.");

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
            throw new TransicionDeEstadoInvalidaException(
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
            throw new TransicionDeEstadoInvalidaException(
                $"Solo se puede ocultar una mision Validada. Estado actual: {Estado}.");

        RegistrarEvento(new MisionOcultada(Id, docenteId, DateTime.UtcNow));
    }

    public void Republicar(Guid docenteId)
    {
        if (Estado != EstadoMision.Oculta)
            throw new TransicionDeEstadoInvalidaException(
                $"Solo se puede republicar una mision Oculta. Estado actual: {Estado}.");

        RegistrarEvento(new MisionRepublicada(Id, docenteId, DateTime.UtcNow));
    }

    // Sugerencia, no bloqueo: el alumno puede resolver cualquier mision activa
    // en cualquier orden. Si el docente quiere bloquear, oculta la mision.
    public void DefinirMisionesSugeridas(Guid docenteId, IEnumerable<Guid> misionesSugeridas)
    {
        if (Estado == EstadoMision.Rechazada)
            throw new TransicionDeEstadoInvalidaException("Una misión rechazada no puede tener sugerencias.");

        var lista = misionesSugeridas.Distinct().ToList();

        if (lista.Contains(Id))
            throw new ArgumentException("Una misión no puede sugerirse a sí misma.");
        if (lista.Count > MaxMisionesSugeridas)
            throw new ArgumentException($"Una misión admite como máximo {MaxMisionesSugeridas} sugerencias.");

        if (lista.ToHashSet().SetEquals(_misionesSugeridas)) return;

        RegistrarEvento(new MisionesSugeridasDefinidas(Id, docenteId, lista, DateTime.UtcNow));
    }

    // Consulta de solo lectura -- no genera evento ni cambia Version.
    // OpcionMultiple y BatallaDeJefe comparten esta rama -- misma forma de respuesta.
    public ResultadoCalificacion Calificar(IReadOnlyList<RespuestaAlumno> respuestas) =>
        CalificarPreguntas(ObtenerPreguntas(), respuestas);

    private List<(string Enunciado, List<string> Opciones, string RespuestaCorrecta, string Explicacion)> ObtenerPreguntas()
    {
        switch (TipoPlantilla)
        {
            case "OpcionMultiple":
                var om = JsonSerializer.Deserialize<ContenidoOpcionMultiple>(PayloadJson, OpcionesJsonMision.Instancia)
                    ?? throw new InvalidOperationException("El payload de la mision no tiene el formato esperado.");
                return om.Preguntas
                    .Select(p => (p.Enunciado, p.Opciones, p.RespuestaCorrecta, p.Explicacion)).ToList();

            case "BatallaDeJefe":
                var bj = JsonSerializer.Deserialize<ContenidoBatallaDeJefe>(PayloadJson, OpcionesJsonMision.Instancia)
                    ?? throw new InvalidOperationException("El payload de la mision no tiene el formato esperado.");
                return bj.Fases
                    .Select(f => (f.Enunciado, f.Opciones, f.RespuestaCorrecta, f.Explicacion)).ToList();

            default:
                throw new NotSupportedException(
                    $"Calificacion automatica no implementada todavia para el tipo '{TipoPlantilla}'.");
        }
    }

    private static ResultadoCalificacion CalificarPreguntas(
        List<(string Enunciado, List<string> Opciones, string RespuestaCorrecta, string Explicacion)> preguntas,
        IReadOnlyList<RespuestaAlumno> respuestas)
    {
        if (preguntas.Count == 0)
            return new ResultadoCalificacion(0, 0, 0, new List<FeedbackPregunta>());

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

    // Pista: devuelve UNA opcion incorrecta para tachar. Nunca la correcta y
    // nunca deja menos de dos opciones en pie. No modifica el agregado: quien
    // la consume (el Personaje) es otro agregado, lo orquesta el comando.
    public string ObtenerOpcionADescartar(int indicePregunta, IReadOnlyCollection<string> opcionesYaDescartadas)
    {
        if (TipoPlantilla is not ("OpcionMultiple" or "BatallaDeJefe"))
            throw new TransicionDeEstadoInvalidaException($"Las misiones de tipo '{TipoPlantilla}' no admiten pistas.");

        var preguntas = ObtenerPreguntas();
        if (indicePregunta < 0 || indicePregunta >= preguntas.Count)
            throw new ArgumentOutOfRangeException(nameof(indicePregunta), "La pregunta no existe en esta misión.");

        var pregunta = preguntas[indicePregunta];
        var restantes = pregunta.Opciones.Where(o => !opcionesYaDescartadas.Contains(o)).ToList();

        if (restantes.Count <= 2)
            throw new TransicionDeEstadoInvalidaException("Ya no quedan opciones para descartar en esta pregunta.");

        return restantes.FirstOrDefault(o => !string.Equals(o, pregunta.RespuestaCorrecta, StringComparison.Ordinal))
            ?? throw new TransicionDeEstadoInvalidaException("No hay una opción incorrecta disponible para descartar.");
    }

    // Metodo propio: la respuesta (un orden + un culpable) tiene otra forma.
    public ResultadoOrdenTemporal CalificarOrdenTemporal(RespuestaOrdenTemporal respuesta)
    {
        if (TipoPlantilla != "LineaTemporal")
            throw new NotSupportedException($"Este metodo es exclusivo del tipo 'LineaTemporal'. La mision es '{TipoPlantilla}'.");

        var contenido = JsonSerializer.Deserialize<ContenidoLineaTemporal>(PayloadJson, OpcionesJsonMision.Instancia)
            ?? throw new InvalidOperationException("El payload de la mision no tiene el formato esperado.");

        if (contenido.EventosDesordenados.Count == 0)
            return new ResultadoOrdenTemporal(0, false, contenido.Explicacion, new List<string>(), contenido.EventoCulpableId);

        var posicionesCorrectas = 0;
        for (var i = 0; i < respuesta.OrdenPropuesto.Count && i < contenido.EventosDesordenados.Count; i++)
        {
            var evento = contenido.EventosDesordenados.FirstOrDefault(e => e.Id == respuesta.OrdenPropuesto[i]);
            if (evento is not null && evento.OrdenCorrecto == i + 1)
                posicionesCorrectas++;
        }

        var culpableCorrecto = string.Equals(respuesta.EventoCulpableElegido, contenido.EventoCulpableId, StringComparison.Ordinal);

        // 70% por el orden, 30% por identificar al culpable.
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

            case MisionesSugeridasDefinidas e:
                _misionesSugeridas.Clear();
                _misionesSugeridas.AddRange(e.MisionesSugeridas);
                break;

            default:
                throw new InvalidOperationException(
                    $"Evento no reconocido por el agregado Mision: {evento.GetType().Name}");
        }
    }
}
