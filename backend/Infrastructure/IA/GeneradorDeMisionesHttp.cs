using System.Net.Http.Json;
using Core.Application.Common;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.IA;

public class GeneradorDeMisionesHttp : IGeneradorDeMisiones
{
    private readonly HttpClient _httpClient;
    private readonly string _tokenInterno;

    public GeneradorDeMisionesHttp(HttpClient httpClient, IConfiguration configuracion)
    {
        _httpClient = httpClient;
        // Falla al construirse si falta la config, no en el primer request real.
        _tokenInterno = configuracion["AiService:TokenInterno"]?.Trim()
                ?? throw new InvalidOperationException("Falta configurar AiService:TokenInterno.");
    }

    public async Task<ContenidoGeneradoPorIA> GenerarAsync(
        string temaCurricular, string textoFuente, CancellationToken ct = default)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/generar")
        {
            Content = JsonContent.Create(new { tema_curricular = temaCurricular, texto_fuente = textoFuente }),
        };
        request.Headers.Add("X-Internal-Token", _tokenInterno);

        var response = await _httpClient.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();

        var resultado = await response.Content.ReadFromJsonAsync<RespuestaGeneracion>(cancellationToken: ct)
            ?? throw new InvalidOperationException("El microservicio de IA devolvió una respuesta vacía.");

        return new ContenidoGeneradoPorIA(
            resultado.narrativa,
            resultado.preguntas
                .Select(p => new PreguntaGenerada(p.enunciado, p.opciones, p.respuesta_correcta, p.explicacion))
                .ToList());
    }

    // Forma exacta del JSON que devuelve FastAPI -- nombres en snake_case,
    // como los define el modelo Pydantic del lado de Python.
    private sealed record RespuestaGeneracion(
        string narrativa, List<PreguntaGeneracion> preguntas);

    private sealed record PreguntaGeneracion(
        string enunciado, List<string> opciones, string respuesta_correcta, string explicacion);
}
