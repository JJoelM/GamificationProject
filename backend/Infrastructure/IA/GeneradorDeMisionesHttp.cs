using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;

namespace Infrastructure.IA;

// Capa anticorrupcion: traduce lo que devuelve el microservicio de Python (snake_case)
// al formato del dominio. El header X-Internal-Token ya lo agrega el HttpClient registrado en Program.cs.
public class GeneradorDeMisionesHttp : IGeneradorDeMisiones
{
    private const string MensajeGenerico =
        "La IA no pudo generar este tipo de misión con ese material. Probá con más texto o con otro tipo de misión.";

    private readonly HttpClient _http;

    public GeneradorDeMisionesHttp(HttpClient http) => _http = http;

    public async Task<ContenidoGeneradoPorIA> GenerarAsync(
        TipoPlantilla tipo, string temaCurricular, string textoFuente, CancellationToken ct = default)
    {
        var ruta = tipo switch
        {
            TipoPlantilla.OpcionMultiple => "/generar/opcion-multiple",
            TipoPlantilla.BatallaDeJefe => "/generar/batalla-de-jefe",
            TipoPlantilla.LineaTemporal => "/generar/linea-temporal",
            _ => throw new ArgumentOutOfRangeException(nameof(tipo), "Tipo de misión no soportado."),
        };

        HttpResponseMessage respuesta;
        try
        {
            respuesta = await _http.PostAsJsonAsync(
                ruta, new { tema_curricular = temaCurricular, texto_fuente = textoFuente }, ct);
        }
        catch (HttpRequestException ex)
        {
            throw new GeneracionFallidaException("No se pudo contactar al servicio de IA. Intentá de nuevo en unos minutos.", ex);
        }
        catch (TaskCanceledException ex) when (!ct.IsCancellationRequested)
        {
            throw new GeneracionFallidaException("El servicio de IA tardó demasiado en responder. Intentá de nuevo.", ex);
        }

        using (respuesta)
        {
            if (respuesta.StatusCode == HttpStatusCode.BadGateway)
                throw new GeneracionFallidaException(MensajeGenerico);

            // 401, 422, 500...: error de configuracion o de contrato, no algo que el docente pueda reintentar.
            if (!respuesta.IsSuccessStatusCode)
                throw new InvalidOperationException($"El microservicio de IA respondió {(int)respuesta.StatusCode}.");

            try
            {
                return tipo switch
                {
                    TipoPlantilla.OpcionMultiple => await LeerOpcionMultiple(respuesta, ct),
                    TipoPlantilla.BatallaDeJefe => await LeerBatalla(respuesta, ct),
                    _ => await LeerLineaTemporal(respuesta, ct),
                };
            }
            catch (JsonException ex)
            {
                throw new GeneracionFallidaException(MensajeGenerico, ex);
            }
        }
    }

    private static async Task<ContenidoGeneradoPorIA> LeerOpcionMultiple(HttpResponseMessage r, CancellationToken ct)
    {
        var dto = await r.Content.ReadFromJsonAsync<RespuestaOpcionMultiple>(cancellationToken: ct)
            ?? throw new GeneracionFallidaException(MensajeGenerico);

        var payload = new ContenidoOpcionMultiple(dto.preguntas
            .Select(p => new PreguntaOpcionMultiple(p.enunciado, p.opciones, p.respuesta_correcta, p.explicacion))
            .ToList());

        return new ContenidoGeneradoPorIA(
            dto.narrativa, JsonSerializer.Serialize(payload, OpcionesJsonMision.Instancia), dto.preguntas.Count);
    }

    private static async Task<ContenidoGeneradoPorIA> LeerBatalla(HttpResponseMessage r, CancellationToken ct)
    {
        var dto = await r.Content.ReadFromJsonAsync<RespuestaBatalla>(cancellationToken: ct)
            ?? throw new GeneracionFallidaException(MensajeGenerico);

        var payload = new ContenidoBatallaDeJefe(dto.nombre_jefe, dto.hp_maximo, dto.fases
            .Select(f => new FaseDeBatalla(
                f.enunciado, f.opciones, f.respuesta_correcta, f.explicacion, f.danio_al_jefe, f.penalizacion_fallo))
            .ToList());

        return new ContenidoGeneradoPorIA(
            dto.narrativa, JsonSerializer.Serialize(payload, OpcionesJsonMision.Instancia), dto.fases.Count);
    }

    private static async Task<ContenidoGeneradoPorIA> LeerLineaTemporal(HttpResponseMessage r, CancellationToken ct)
    {
        var dto = await r.Content.ReadFromJsonAsync<RespuestaLineaTemporal>(cancellationToken: ct)
            ?? throw new GeneracionFallidaException(MensajeGenerico);

        var payload = new ContenidoLineaTemporal(
            dto.estado_erroneo_descripcion,
            dto.eventos_desordenados.Select(ev => new EventoDesordenado(ev.id, ev.descripcion, ev.orden_correcto)).ToList(),
            dto.evento_culpable_id,
            dto.explicacion);

        return new ContenidoGeneradoPorIA(
            dto.narrativa, JsonSerializer.Serialize(payload, OpcionesJsonMision.Instancia), dto.eventos_desordenados.Count);
    }

    // Los nombres van en snake_case para coincidir byte a byte con lo que emite Python.
    private sealed record PreguntaDto(string enunciado, List<string> opciones, string respuesta_correcta, string explicacion);
    private sealed record RespuestaOpcionMultiple(string narrativa, List<PreguntaDto> preguntas);

    private sealed record FaseDto(
        string enunciado, List<string> opciones, string respuesta_correcta, string explicacion,
        int danio_al_jefe, string penalizacion_fallo);
    private sealed record RespuestaBatalla(string narrativa, string nombre_jefe, int hp_maximo, List<FaseDto> fases);

    private sealed record EventoDto(string id, string descripcion, int orden_correcto);
    private sealed record RespuestaLineaTemporal(
        string narrativa, string estado_erroneo_descripcion, List<EventoDto> eventos_desordenados,
        string evento_culpable_id, string explicacion);
}
