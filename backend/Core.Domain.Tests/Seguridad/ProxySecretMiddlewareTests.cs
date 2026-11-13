using System.Net;
using System.Reflection;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Core.Domain.Tests.Seguridad;

public class ProxySecretMiddlewareTests
{
    private const string SecretoPrueba = "secreto-super-seguro-de-prueba-32bytes";
    private const string OrigenFrontend = "https://gamificationproject.pages.dev";

    private sealed class ApiFactory : WebApplicationFactory<Program>
    {
        private readonly string _environmentName;
        private readonly string? _proxySecret;
        private readonly string _dbName = $"ProxySecretTests_{Guid.NewGuid():N}";

        public ApiFactory(string environmentName, string? proxySecret)
        {
            _environmentName = environmentName;
            _proxySecret = proxySecret;
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment(_environmentName);

            // UseSetting se aplica antes de ejecutar las sentencias de nivel superior de Program.cs
            // (donde se leen ProxySecret, FrontendUrl, JwtSettings y AiService) y aísla del entorno local/CI.
            builder.UseSetting("ConnectionStrings:DefaultConnection", "Host=localhost;Database=test;Username=test;Password=test");
            builder.UseSetting("JwtSettings:Secret", "clave-jwt-para-tests-de-integracion-32-bytes!");
            builder.UseSetting("JwtSettings:Issuer", "GamificacionPFC");
            builder.UseSetting("JwtSettings:Audience", "GamificacionPFC");
            builder.UseSetting("FrontendUrl", OrigenFrontend);
            builder.UseSetting("AiService:BaseUrl", "https://ai.example.test");
            builder.UseSetting("AiService:TokenInterno", "token-ia-test");
            builder.UseSetting("ApplyMigrationsOnStartup", "false");
            builder.UseSetting("SeedDemoData", "false");
            builder.UseSetting("ProxySecret", _proxySecret ?? string.Empty);

            builder.ConfigureServices(services =>
            {
                var descriptors = services
                    .Where(d =>
                        d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                        d.ServiceType == typeof(ApplicationDbContext) ||
                        (d.ServiceType.IsGenericType &&
                         d.ServiceType.GetGenericTypeDefinition().Name.StartsWith("IDbContextOptionsConfiguration", StringComparison.Ordinal) &&
                         d.ServiceType.GenericTypeArguments[0] == typeof(ApplicationDbContext)))
                    .ToList();

                foreach (var descriptor in descriptors)
                    services.Remove(descriptor);

                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase(_dbName));
            });
        }
    }

    [Fact]
    public async Task EnProduccion_SinSecreto_ApiDevuelve403YHealthPublicoDevuelve200()
    {
        await using var factory = new ApiFactory(Environments.Production, SecretoPrueba);
        using var client = factory.CreateClient();

        var respApiHealth = await client.GetAsync("/api/health");
        var respLogin = await client.PostAsync("/api/usuarios/login", null);
        var respHealth = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.Forbidden, respApiHealth.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, respLogin.StatusCode);
        Assert.Equal(HttpStatusCode.OK, respHealth.StatusCode);
    }

    [Theory]
    [InlineData("secreto-incorrecto")]
    [InlineData("secreto-super-seguro-de-prueba-32byteX")]
    [InlineData("")]
    public async Task EnProduccion_ConSecretoInvalido_ApiDevuelve403(string secretoInvalido)
    {
        await using var factory = new ApiFactory(Environments.Production, SecretoPrueba);
        using var client = factory.CreateClient();

        var req = new HttpRequestMessage(HttpMethod.Get, "/api/health");
        req.Headers.Add("X-Proxy-Secret", secretoInvalido);

        var resp = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    [Fact]
    public async Task EnProduccion_ConMultiplesHeadersSecreto_ApiDevuelve403()
    {
        await using var factory = new ApiFactory(Environments.Production, SecretoPrueba);
        using var client = factory.CreateClient();

        var req = new HttpRequestMessage(HttpMethod.Get, "/api/health");
        req.Headers.Add("X-Proxy-Secret", new[] { SecretoPrueba, SecretoPrueba });

        var resp = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    [Fact]
    public async Task EnProduccion_ConSecretoValido_ApiHealthDevuelve200()
    {
        await using var factory = new ApiFactory(Environments.Production, SecretoPrueba);
        using var client = factory.CreateClient();

        var req = new HttpRequestMessage(HttpMethod.Get, "/api/health");
        req.Headers.Add("X-Proxy-Secret", SecretoPrueba);

        var resp = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }

    [Fact]
    public async Task EnProduccion_PreflightOptionsSinSecreto_Devuelve403SinCabecerasCors()
    {
        await using var factory = new ApiFactory(Environments.Production, SecretoPrueba);
        using var client = factory.CreateClient();

        var reqSinSecreto = new HttpRequestMessage(HttpMethod.Options, "/api/usuarios/login");
        reqSinSecreto.Headers.Add("Origin", OrigenFrontend);
        reqSinSecreto.Headers.Add("Access-Control-Request-Method", "POST");

        var respSinSecreto = await client.SendAsync(reqSinSecreto);
        Assert.Equal(HttpStatusCode.Forbidden, respSinSecreto.StatusCode);
        Assert.False(respSinSecreto.Headers.Contains("Access-Control-Allow-Origin"));

        // Contraste: con secreto válido sí alcanza el middleware CORS y responde con el header esperado
        var reqConSecreto = new HttpRequestMessage(HttpMethod.Options, "/api/usuarios/login");
        reqConSecreto.Headers.Add("Origin", OrigenFrontend);
        reqConSecreto.Headers.Add("Access-Control-Request-Method", "POST");
        reqConSecreto.Headers.Add("X-Proxy-Secret", SecretoPrueba);

        var respConSecreto = await client.SendAsync(reqConSecreto);
        Assert.True(respConSecreto.Headers.TryGetValues("Access-Control-Allow-Origin", out var corsValues));
        Assert.Contains(OrigenFrontend, corsValues);
    }

    [Fact]
    public async Task EnProduccion_EvaluacionPorSegmento_Mayusculas403YApix404()
    {
        await using var factory = new ApiFactory(Environments.Production, SecretoPrueba);
        using var client = factory.CreateClient();

        var respMayusculas = await client.GetAsync("/API/health");
        var respApix = await client.GetAsync("/apix");

        Assert.Equal(HttpStatusCode.Forbidden, respMayusculas.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, respApix.StatusCode);
    }

    [Fact]
    public async Task EnDevelopment_SinSecreto_PermiteAccesoAApiYHealth()
    {
        await using var factory = new ApiFactory(Environments.Development, proxySecret: null);
        using var client = factory.CreateClient();

        var respApiHealth = await client.GetAsync("/api/health");
        var respHealth = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, respApiHealth.StatusCode);
        Assert.Equal(HttpStatusCode.OK, respHealth.StatusCode);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("   ")]
    public async Task EnProduccion_SinProxySecretConfigurado_DebeFallarAlArrancar(string? proxySecret)
    {
        await using var factory = new ApiFactory(Environments.Production, proxySecret);

        Exception? captured = null;
        try
        {
            _ = factory.CreateClient();
        }
        catch (Exception ex)
        {
            captured = ex;
        }

        Assert.NotNull(captured);
        while (captured is TargetInvocationException tie && tie.InnerException is not null)
            captured = tie.InnerException;

        var invalidOp = Assert.IsType<InvalidOperationException>(captured);
        Assert.Contains("ProxySecret", invalidOp.Message, StringComparison.OrdinalIgnoreCase);
    }
}
