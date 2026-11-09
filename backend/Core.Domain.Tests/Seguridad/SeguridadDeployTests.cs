using System.Net;
using System.Text;
using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using Infrastructure.Auth;
using Infrastructure.IA;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using WebApi;
using Xunit;

namespace Core.Domain.Tests.Seguridad;

public class SeguridadDeployTests
{
    private sealed class FakeHttpMessageHandler : HttpMessageHandler
    {
        private readonly HttpStatusCode _statusCode;
        private readonly string _responseBody;

        public FakeHttpMessageHandler(HttpStatusCode statusCode, string responseBody)
        {
            _statusCode = statusCode;
            _responseBody = responseBody;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(new HttpResponseMessage(_statusCode)
            {
                Content = new StringContent(_responseBody, Encoding.UTF8, "application/json")
            });
        }
    }

    [Fact]
    public void EfCoreModelSnapshot_CoincideExactamenteConElModeloActual_SinCambiosPendientes()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql("Host=localhost;Database=test_dummy;Username=test;Password=test")
            .UseSnakeCaseNamingConvention()
            .Options;

        using var context = new ApplicationDbContext(options);

        Assert.False(
            context.Database.HasPendingModelChanges(),
            "El ModelSnapshot de EF Core tiene diferencias respecto a las entidades C#. Debe generarse una migración formal.");
    }

    [Theory]
    [InlineData(HttpStatusCode.InternalServerError, """{"detail":"API key de Gemini no configurada: AIzaSySecretKey12345"}""")]
    [InlineData(HttpStatusCode.Unauthorized, """{"detail":"No autorizado. X-Internal-Token inválido: TokenInternoSecreto999"}""")]
    [InlineData(HttpStatusCode.UnprocessableEntity, """{"detail":[{"loc":["body","texto_fuente"],"msg":"Field required","type":"missing"}]}""")]
    public async Task GeneradorDeMisionesHttp_CuandoFastApiFalla_NoFiltraDetallesInternosNiSecretosAlCliente(
        HttpStatusCode statusCode, string rawInternalError)
    {
        using var handler = new FakeHttpMessageHandler(statusCode, rawInternalError);
        using var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("http://127.0.0.1:8001")
        };

        var generador = new GeneradorDeMisionesHttp(httpClient);

        var ex = await Assert.ThrowsAsync<GeneracionFallidaException>(() =>
            generador.GenerarAsync(TipoPlantilla.OpcionMultiple, "Historia", "Texto fuente válido de prueba."));

        Assert.DoesNotContain("AIzaSySecretKey12345", ex.Message);
        Assert.DoesNotContain("TokenInternoSecreto999", ex.Message);
        Assert.DoesNotContain("X-Internal-Token", ex.Message);
        Assert.DoesNotContain("texto_fuente", ex.Message);
        Assert.DoesNotContain("API key", ex.Message);
    }

    [Fact]
    public async Task ManejadorDeExcepciones_AnteOrigenNoAutorizado_NoReflejaCabecerasCorsConCredenciales()
    {
        var manejador = new ManejadorDeExcepciones(NullLogger<ManejadorDeExcepciones>.Instance);
        var context = new DefaultHttpContext();
        context.Request.Headers.Origin = "https://sitio-atacante-malicioso.com";
        context.Response.Body = new MemoryStream();

        var manejado = await manejador.TryHandleAsync(
            context,
            new UnauthorizedAccessException("Credenciales inválidas."),
            CancellationToken.None);

        Assert.True(manejado);
        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
        Assert.False(
            context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"),
            "El manejador de excepciones nunca debe reflejar un Origin arbitrario que no fue autorizado por el middleware CORS.");
        Assert.False(
            context.Response.Headers.ContainsKey("Access-Control-Allow-Credentials"),
            "El manejador de excepciones no debe habilitar Access-Control-Allow-Credentials manualmente.");
    }

    [Fact]
    public void GeneradorDeTokensJwt_IncluyeClaimUsuarioIdYRol_SinExponerSecretos()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = "ClaveSecretaDePruebaSuperLargaParaHmacSha256!",
                ["JwtSettings:Issuer"] = "GamificacionPFC",
                ["JwtSettings:Audience"] = "GamificacionPFC",
            })
            .Build();

        var generador = new GeneradorDeTokensJwt(config);
        var usuarioId = Guid.NewGuid();
        var token = generador.GenerarToken(usuarioId, "docente@unne.edu.ar", "Docente");

        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal(usuarioId.ToString(), jwt.Claims.FirstOrDefault(c => c.Type == "usuarioId")?.Value);
        Assert.DoesNotContain(jwt.Claims, c => c.Value.Contains("ClaveSecretaDePrueba"));
    }

    [Fact]
    public void NormalizarConnectionStringPostgres_ConvierteUriDeNeonAFormatoKeyValueNpgsqlConSslRequire()
    {
        const string neonUri = "postgresql://neondb_owner:MiPassword123@ep-nameless-pond-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

        var normalizada = Program.NormalizarConnectionStringPostgres(neonUri);

        Assert.NotNull(normalizada);
        Assert.Contains("Host=ep-nameless-pond-pooler.sa-east-1.aws.neon.tech;", normalizada);
        Assert.Contains("Database=neondb;", normalizada);
        Assert.Contains("Username=neondb_owner;", normalizada);
        Assert.Contains("Password=MiPassword123;", normalizada);
        Assert.Contains("SSL Mode=Require;", normalizada);
        Assert.Contains("Channel Binding=Require;", normalizada);
    }
}
