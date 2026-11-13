using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WebApi;

namespace Core.Domain.Tests.Seguridad;

public class ProxySecretMiddlewareTests
{
    private const string SecretoPrueba = "secreto-super-seguro-de-prueba-32bytes";

    private static async Task<IHost> CrearServidorPruebaAsync(string? proxySecret, bool isDevelopment)
    {
        var builder = new HostBuilder()
            .ConfigureWebHost(webHost =>
            {
                webHost.UseTestServer();
                webHost.ConfigureServices(services =>
                {
                    services.AddRouting();
                    services.AddCors(o => o.AddPolicy("Frontend", p =>
                        p.WithOrigins("https://gamificationproject.pages.dev")
                         .AllowAnyHeader()
                         .AllowAnyMethod()));
                });
                webHost.Configure(app =>
                {
                    app.UseRouting();
                    app.UseMiddleware<ProxySecretMiddleware>(proxySecret, isDevelopment);
                    app.UseCors("Frontend");
                    app.UseEndpoints(endpoints =>
                    {
                        endpoints.MapGet("/health", () => Results.Ok(new { status = "ok" }));
                        endpoints.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
                        endpoints.MapPost("/api/usuarios/login", () => Results.Ok(new { ok = true }));
                        endpoints.MapGet("/apix", () => Results.Ok(new { ok = true }));
                    });
                });
            });

        var host = builder.Build();
        await host.StartAsync();
        return host;
    }

    [Fact]
    public void ValidarConfiguracion_EnProduccionSinSecreto_DebeLanzarExcepcionFailClosed()
    {
        Assert.Throws<InvalidOperationException>(() =>
            ProxySecretMiddleware.ValidarConfiguracion(null, isDevelopment: false));
        Assert.Throws<InvalidOperationException>(() =>
            ProxySecretMiddleware.ValidarConfiguracion("   ", isDevelopment: false));
    }

    [Fact]
    public void ValidarConfiguracion_EnDevelopmentSinSecreto_NoDebeFallar()
    {
        ProxySecretMiddleware.ValidarConfiguracion(null, isDevelopment: true);
        ProxySecretMiddleware.ValidarConfiguracion("", isDevelopment: true);
    }

    [Fact]
    public async Task PeticionAApi_SinHeaderSecreto_DebeDevolver403()
    {
        using var host = await CrearServidorPruebaAsync(SecretoPrueba, isDevelopment: false);
        var client = host.GetTestClient();

        var respLogin = await client.PostAsync("/api/usuarios/login", null);
        var respApiHealth = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.Forbidden, respLogin.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, respApiHealth.StatusCode);
    }

    [Theory]
    [InlineData("secreto-incorrecto")]
    [InlineData("secreto-super-seguro-de-prueba-32byteX")]
    [InlineData("")]
    public async Task PeticionAApi_ConHeaderIncorrecto_DebeDevolver403(string secretoInvalido)
    {
        using var host = await CrearServidorPruebaAsync(SecretoPrueba, isDevelopment: false);
        var client = host.GetTestClient();

        var req = new HttpRequestMessage(HttpMethod.Post, "/api/usuarios/login");
        req.Headers.Add("X-Proxy-Secret", secretoInvalido);

        var resp = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    [Fact]
    public async Task PeticionAApi_ConMultiplesHeadersSecreto_DebeDevolver403()
    {
        using var host = await CrearServidorPruebaAsync(SecretoPrueba, isDevelopment: false);
        var client = host.GetTestClient();

        var req = new HttpRequestMessage(HttpMethod.Post, "/api/usuarios/login");
        req.Headers.Add("X-Proxy-Secret", new[] { SecretoPrueba, SecretoPrueba });

        var resp = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }

    [Fact]
    public async Task PeticionAApi_ConHeaderValido_DebePasar()
    {
        using var host = await CrearServidorPruebaAsync(SecretoPrueba, isDevelopment: false);
        var client = host.GetTestClient();

        var req = new HttpRequestMessage(HttpMethod.Post, "/api/usuarios/login");
        req.Headers.Add("X-Proxy-Secret", SecretoPrueba);

        var resp = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }

    [Fact]
    public async Task PeticionAHealth_SinHeaderSecreto_DebeDevolver200()
    {
        using var host = await CrearServidorPruebaAsync(SecretoPrueba, isDevelopment: false);
        var client = host.GetTestClient();

        var resp = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }

    [Fact]
    public async Task PeticionPreflightOptionsAApi_SinHeaderSecreto_DebeDevolver403()
    {
        using var host = await CrearServidorPruebaAsync(SecretoPrueba, isDevelopment: false);
        var client = host.GetTestClient();

        var req = new HttpRequestMessage(HttpMethod.Options, "/api/usuarios/login");
        req.Headers.Add("Origin", "https://gamificationproject.pages.dev");
        req.Headers.Add("Access-Control-Request-Method", "POST");

        var resp = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
        Assert.False(resp.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task CoincidenciaPrefijoApi_ManejaMayusculasYNoAfectaApix()
    {
        using var host = await CrearServidorPruebaAsync(SecretoPrueba, isDevelopment: false);
        var client = host.GetTestClient();

        var respUpper = await client.PostAsync("/API/usuarios/login", null);
        var respApix = await client.GetAsync("/apix");

        Assert.Equal(HttpStatusCode.Forbidden, respUpper.StatusCode);
        Assert.Equal(HttpStatusCode.OK, respApix.StatusCode);
    }
}
