using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Misiones;
using Core.Application.Misiones.Comandos;
using Core.Application.Common;
using Core.Domain.Entidades;
using Infrastructure.Auth;
using Infrastructure.Persistence.Repositorios;
using Infrastructure.Persistence;
using Infrastructure.IA;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using WebApi;
using WebApi.Endpoints.Misiones;
using WebApi.Endpoints.Usuarios;
using WebApi.Endpoints.Alumnos;
using WebApi.Endpoints.Aulas;
using WebApi.Endpoints.Docentes;
using WebApi.Endpoints.Directivo;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

var proxySecretConfigurado = builder.Configuration["ProxySecret"]?.Trim();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Si ProxySecret está configurado, la IP real del cliente se valida por canal autenticado (X-Proxy-Secret)
    // y limitamos X-Forwarded-For a 1 salto (el balanceador de Render) para impedir spoofing en llamadas directas.
    options.ForwardLimit = string.IsNullOrEmpty(proxySecretConfigurado) ? 2 : 1;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var rawConnString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DATABASE_URL"];

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(NormalizarConnectionStringPostgres(rawConnString))
           .UseSnakeCaseNamingConvention()
           .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

builder.Services.AddScoped<IGeneradorDeTokens, GeneradorDeTokensJwt>();

var origenesPermitidos = (builder.Configuration["FrontendUrl"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(u => u.TrimEnd('/'))
    .Where(u => !string.IsNullOrWhiteSpace(u))
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(origenesPermitidos)
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "GamificacionPFC",
            ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "GamificacionPFC",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]
                    ?? throw new InvalidOperationException("Falta configurar JwtSettings:Secret."))),
            ClockSkew = TimeSpan.Zero,
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("access_token", out var token))
                    context.Token = token;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var iaPermitLimit = builder.Configuration.GetValue("RateLimits:IaPermitLimit", 5);
var iaWindowMinutes = builder.Configuration.GetValue("RateLimits:IaWindowMinutes", 10);

static string ObtenerIpClienteSegura(HttpContext httpContext, string? proxySecretEsperado)
{
    if (!string.IsNullOrEmpty(proxySecretEsperado))
    {
        var secretRecibido = httpContext.Request.Headers["X-Proxy-Secret"].FirstOrDefault();
        if (!string.IsNullOrEmpty(secretRecibido))
        {
            var bytesEsperados = Encoding.UTF8.GetBytes(proxySecretEsperado);
            var bytesRecibidos = Encoding.UTF8.GetBytes(secretRecibido);
            if (CryptographicOperations.FixedTimeEquals(bytesEsperados, bytesRecibidos))
            {
                var ipProxy = httpContext.Request.Headers["X-Real-Client-IP"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(ipProxy))
                    return ipProxy.Trim();
            }
        }
    }

    return httpContext.Connection.RemoteIpAddress?.ToString() ?? "desconocido";
}

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        var esEndpointIa = context.HttpContext.Request.Path.StartsWithSegments("/api/misiones/generar-con-ia");

        await context.HttpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Límite de solicitudes alcanzado",
            Detail = esEndpointIa
                ? $"Alcanzaste el límite de {iaPermitLimit} generaciones con IA cada {iaWindowMinutes} minutos. Revisá tus borradores pendientes o aguardá unos minutos antes de generar otra misión."
                : "Demasiados intentos seguidos. Por favor, aguardá un minuto antes de volver a intentarlo.",
        }, cancellationToken);
    };

    // Resuelve la IP real del cliente validando X-Proxy-Secret en tiempo constante si está configurado,
    // o usando RemoteIpAddress del balanceador de Render para impedir spoofing de X-Forwarded-For.
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ObtenerIpClienteSegura(httpContext, proxySecretConfigurado),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

    options.AddPolicy("ia", httpContext =>
    {
        var usuarioId = httpContext.User.FindFirstValue("usuarioId")
            ?? httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? ObtenerIpClienteSegura(httpContext, proxySecretConfigurado);

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: $"ia:{usuarioId}",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = iaPermitLimit,
                Window = TimeSpan.FromMinutes(iaWindowMinutes),
                QueueLimit = 0,
            });
    });
});

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(ValidarMisionCommand).Assembly));

builder.Services.AddScoped<IRepositorioMisiones, RepositorioMisiones>();

builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

builder.Services.AddScoped<IRepositorioPersonajes, RepositorioPersonajes>();

builder.Services.AddExceptionHandler<ManejadorDeExcepciones>();
builder.Services.AddProblemDetails();

builder.Services.AddHttpClient<IGeneradorDeMisiones, GeneradorDeMisionesHttp>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AiService:BaseUrl"]
        ?? throw new InvalidOperationException("Falta configurar AiService:BaseUrl."));

    client.Timeout = TimeSpan.FromSeconds(90);

    var tokenInterno = (builder.Configuration["AiService:TokenInterno"]
        ?? builder.Configuration["TOKEN_INTERNO_BACKEND"])?
        .Replace("\r", "").Replace("\n", "").Trim()
        ?? throw new InvalidOperationException("Falta configurar AiService:TokenInterno.");

    client.DefaultRequestHeaders.Add("X-Internal-Token", tokenInterno);
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseCors("Frontend");
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .WithName("HealthCheck")
   .ExcludeFromDescription();

app.MapMisionesEndpoints();
app.MapAlumnosEndpoints();
app.MapUsuariosEndpoints();
app.MapAulasEndpoints();
app.MapDocentesEndpoints();
app.MapDirectivoEndpoints();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Si se habilita ApplyMigrationsOnStartup (por ejemplo en el deploy a Neon),
    // aplica las migraciones pendientes antes de verificar la tabla de roles.
    if (app.Configuration.GetValue<bool>("ApplyMigrationsOnStartup"))
    {
        context.Database.Migrate();
    }

    var rolDocenteId = Guid.Parse("A0000000-0000-0000-0000-000000000000");
    var rolAlumnoId = Guid.Parse("B0000000-0000-0000-0000-000000000000");
    var rolDirectivoId = Guid.Parse("C0000000-0000-0000-0000-000000000000");
    var rolAdministradorId = Guid.Parse("D0000000-0000-0000-0000-000000000000");

    // Los 4 roles base del sistema se aseguran siempre de forma idempotente
    if (!context.Roles.Any(r => r.Id == rolDocenteId))
        context.Roles.Add(new Rol(rolDocenteId, "Docente"));
    if (!context.Roles.Any(r => r.Id == rolAlumnoId))
        context.Roles.Add(new Rol(rolAlumnoId, "Alumno"));
    if (!context.Roles.Any(r => r.Id == rolDirectivoId))
        context.Roles.Add(new Rol(rolDirectivoId, "Directivo"));
    if (!context.Roles.Any(r => r.Id == rolAdministradorId))
        context.Roles.Add(new Rol(rolAdministradorId, "Administrador"));

    context.SaveChanges();

    if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("SeedDemoData"))
    {
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Usuario>();
        var passwordSeedConfig = app.Configuration["SeedDemoPassword"];

        if (!app.Environment.IsDevelopment() &&
            (string.IsNullOrWhiteSpace(passwordSeedConfig) || passwordSeedConfig == "Cambiar123!"))
        {
            throw new InvalidOperationException(
                "Por seguridad, cuando SeedDemoData está habilitado en producción es obligatorio configurar una contraseña privada en la variable de entorno SeedDemoPassword.");
        }

        var passwordSeed = string.IsNullOrWhiteSpace(passwordSeedConfig) ? "Cambiar123!" : passwordSeedConfig;

        var docenteId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var alumnoId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var alumno2Id = Guid.Parse("66666666-6666-6666-6666-666666666666");
        var aulaId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var administradorId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var directivoId = Guid.Parse("55555555-5555-5555-5555-555555555555");

        if (!context.Usuarios.Any(u => u.Id == docenteId))
        {
            var docente = new Usuario(docenteId, "docente@unne.edu.ar", "Profesor Arduino", rolDocenteId);
            docente.EstablecerContrasena(hasher.HashPassword(docente, passwordSeed));
            context.Usuarios.Add(docente);
        }

        if (!context.Usuarios.Any(u => u.Id == alumnoId))
        {
            var alumno = new Usuario(alumnoId, "joel@alumno.unne.edu.ar", "Joel Marcori", rolAlumnoId);
            alumno.EstablecerContrasena(hasher.HashPassword(alumno, passwordSeed));
            alumno.RegistrarFechaNacimiento(new DateOnly(2003, 1, 1));
            context.Usuarios.Add(alumno);
        }

        if (!context.Usuarios.Any(u => u.Id == alumno2Id))
        {
            var alumno2 = new Usuario(alumno2Id, "lucia@alumno.unne.edu.ar", "Lucía Fernández", rolAlumnoId);
            alumno2.EstablecerContrasena(hasher.HashPassword(alumno2, passwordSeed));
            alumno2.RegistrarFechaNacimiento(new DateOnly(2003, 5, 12));
            context.Usuarios.Add(alumno2);
        }

        if (!context.Usuarios.Any(u => u.Id == administradorId))
        {
            var admin = new Usuario(administradorId, "admin@unne.edu.ar", "Administrador", rolAdministradorId);
            admin.EstablecerContrasena(hasher.HashPassword(admin, passwordSeed));
            context.Usuarios.Add(admin);
        }

        if (!context.Usuarios.Any(u => u.Id == directivoId))
        {
            var directivo = new Usuario(directivoId, "directivo@unne.edu.ar", "Directivo de Escuela", rolDirectivoId);
            directivo.EstablecerContrasena(hasher.HashPassword(directivo, passwordSeed));
            context.Usuarios.Add(directivo);
        }

        if (!context.Aulas.Any(a => a.Id == aulaId))
        {
            context.Aulas.Add(new Aula(aulaId, "Laboratorio de Sistemas", docenteId));
        }

        if (!context.Inscripciones.Any(i => i.AulaId == aulaId && i.AlumnoId == alumnoId))
        {
            context.Inscripciones.Add(new Inscripcion(aulaId, alumnoId));
        }

        if (!context.Inscripciones.Any(i => i.AulaId == aulaId && i.AlumnoId == alumno2Id))
        {
            context.Inscripciones.Add(new Inscripcion(aulaId, alumno2Id));
        }

        context.SaveChanges();

        var repoPersonajes = scope.ServiceProvider.GetRequiredService<IRepositorioPersonajes>();
        var personajeId = Core.Domain.SeedWork.IdentidadCompuesta.Combinar(alumnoId, aulaId);
        var personaje = repoPersonajes.ObtenerPorIdAsync(personajeId).GetAwaiter().GetResult();
        if (personaje is null)
        {
            personaje = Core.Domain.Agregados.Personajes.Personaje.Iniciar(alumnoId, aulaId);
            repoPersonajes.GuardarAsync(personaje).GetAwaiter().GetResult();
        }

        var repoMisiones = scope.ServiceProvider.GetRequiredService<IRepositorioMisiones>();

        var misionOpcionMultipleId = Guid.Parse("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
        var misionBatallaJefeId = Guid.Parse("c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f");
        var misionLineaTemporalId = Guid.Parse("d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a");

        if (!context.MisionesActivas.Any(m => m.MisionId == misionOpcionMultipleId))
        {
            var m1 = Mision.Generar(
                docenteId, aulaId,
                "Historia: Revolución de Mayo",
                "En mayo de 1810 en Buenos Aires se formó la Primera Junta tras el Cabildo Abierto.",
                "El virrey Cisneros ha convocado al pueblo ante los rumores de España. Los patriotas se reúnen en la plaza para exigir un cabildo abierto que decida el futuro de la nación.",
                "OpcionMultiple",
                """{"preguntas":[{"enunciado":"¿En qué año se llevó a cabo el Cabildo Abierto de Mayo?","opciones":["1810","1816","1820","1806"],"respuestaCorrecta":"1810","explicacion":"El 25 de mayo de 1810 se formó el primer gobierno patrio en Buenos Aires."},{"enunciado":"¿Quién presidió la Primera Junta de Gobierno?","opciones":["Cornelio Saavedra","Mariano Moreno","Manuel Belgrano","Juan José Paso"],"respuestaCorrecta":"Cornelio Saavedra","explicacion":"Cornelio Saavedra fue electo presidente de la Junta Provisional Gubernativa."}]}""",
                95, 150, misionOpcionMultipleId);
            m1.Validar(docenteId);
            repoMisiones.GuardarAsync(m1).GetAwaiter().GetResult();
        }

        var personaje2Id = Core.Domain.SeedWork.IdentidadCompuesta.Combinar(alumno2Id, aulaId);
        var personaje2 = repoPersonajes.ObtenerPorIdAsync(personaje2Id).GetAwaiter().GetResult();
        if (personaje2 is null)
        {
            personaje2 = Core.Domain.Agregados.Personajes.Personaje.Iniciar(alumno2Id, aulaId);
            personaje2.RegistrarResolucionDeMision(
                misionOpcionMultipleId,
                recompensaXpBase: 180,
                recompensaApBase: 500,
                porcentajeCorrecto: 100,
                fecha: DateOnly.FromDateTime(DateTime.UtcNow));

            personaje2.EquiparArticulo("exploradora_reliquias", Core.Domain.Agregados.Personajes.Eventos.TipoArticulo.Avatar, "exploradora_reliquias");
            personaje2.ComprarArticulo("orlado_dorado", 100, Core.Domain.Agregados.Personajes.Eventos.TipoArticulo.Marco, "orlado_dorado");
            personaje2.ComprarArticulo("dragon", 250, Core.Domain.Agregados.Personajes.Eventos.TipoArticulo.Mascota, "dragon");
            personaje2.EquiparArticulo("Buscador de Respuestas", Core.Domain.Agregados.Personajes.Eventos.TipoArticulo.Titulo, "Buscador de Respuestas");

            repoPersonajes.GuardarAsync(personaje2).GetAwaiter().GetResult();

            var resumenP2 = context.PersonajesResumen.FirstOrDefault(p => p.PersonajeId == personaje2Id);
            if (resumenP2 is not null)
            {
                resumenP2.ActualizarPersonalizacion("exploradora_reliquias", "orlado_dorado", "dragon", "Buscador de Respuestas");
                resumenP2.ActualizarProgreso(180, 150, 1, 1);
                context.SaveChanges();
            }
        }

        if (!context.MisionesActivas.Any(m => m.MisionId == misionBatallaJefeId))
        {
            var m2 = Mision.Generar(
                docenteId, aulaId,
                "Algoritmos: Batalla de Jefe",
                "Análisis de algoritmos, complejidades Big-O, concurrencia y estructuras de datos eficientes.",
                "El Bug Ancestral ha despertado en las profundidades del código fuente. Desata ciclos infinitos y corrompe la memoria. ¡Enfréntalo con tus mejores tácticas de optimización!",
                "BatallaDeJefe",
                """{"nombreJefe":"El Bug Ancestral","hpMaximo":100,"fases":[{"enunciado":"El jefe invoca una búsqueda lineal sobre 1.000.000 de elementos desordenados. ¿Cuál es la complejidad temporal en el peor caso?","opciones":["O(N)","O(log N)","O(1)","O(N^2)"],"danioAlJefe":35,"penalizacionFallo":"temblor","respuestaCorrecta":"O(N)","explicacion":"En el peor caso de búsqueda lineal sin ordenar se debe examinar cada elemento hasta el final: O(N)."},{"enunciado":"El jefe intenta mutar un estado compartido entre múltiples hilos sin sincronización. ¿Qué problema crítico ocurre?","opciones":["Condición de carrera (Race Condition)","Stack Overflow","Segmentation Fault","Buffer Underrun"],"danioAlJefe":35,"penalizacionFallo":"destello","respuestaCorrecta":"Condición de carrera (Race Condition)","explicacion":"Múltiples accesos concurrentes de escritura no sincronizados causan condiciones de carrera."},{"enunciado":"Para el golpe de gracia: ¿Qué estructura de datos permite inserción y búsqueda en tiempo promedio O(1)?","opciones":["Tabla Hash (Hash Map)","Árbol Binario de Búsqueda","Lista Enlazada","Grafo no ponderado"],"danioAlJefe":30,"penalizacionFallo":"enfriamiento","respuestaCorrecta":"Tabla Hash (Hash Map)","explicacion":"Las tablas hash calculan el índice mediante función hash promediando tiempo constante O(1)."}]}""",
                98, 220, misionBatallaJefeId);
            m2.Validar(docenteId);
            repoMisiones.GuardarAsync(m2).GetAwaiter().GetResult();
        }

        if (!context.MisionesActivas.Any(m => m.MisionId == misionLineaTemporalId))
        {
            var m3 = Mision.Generar(
                docenteId, aulaId,
                "Sistemas: Línea Temporal",
                "Auditoría de transacciones bancarias, concurrencia en cajeros y validación de saldo.",
                "Una inconsistencia temporal provocó que un cliente retirara más dinero del que poseía en su cuenta. Reconstruye el orden cronológico de los eventos y acusa a la causa raíz.",
                "LineaTemporal",
                """{"estadoErroneoDescripcion":"El saldo del usuario quedó en -$5.000 y el sistema permitió el retiro sin validación previa.","eventosDesordenados":[{"id":"ev-auth","descripcion":"El usuario inicia sesión exitosamente en el cajero automático","ordenCorrecto":1},{"id":"ev-deposito","descripcion":"Se acredita un depósito previo de $2.000 en su caja de ahorro","ordenCorrecto":2},{"id":"ev-retiro","descripcion":"El cajero entrega $7.000 en efectivo sin verificar el saldo disponible","ordenCorrecto":3},{"id":"ev-sync","descripcion":"El servidor central sincroniza el saldo negativo y genera una alerta","ordenCorrecto":4}],"eventoCulpableId":"ev-retiro","explicacion":"El cajero automático entregó efectivo antes de que el servidor validara si el saldo era suficiente para cubrir el retiro."}""",
                96, 180, misionLineaTemporalId);
            m3.Validar(docenteId);
            repoMisiones.GuardarAsync(m3).GetAwaiter().GetResult();
        }

        var misionPendienteId = Guid.Parse("e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b");
        if (!context.BorradoresIA.Any(b => b.MisionId == misionPendienteId))
        {
            var mPendiente = Mision.Generar(
                docenteId, aulaId,
                "Ciencias: El Ciclo del Agua",
                "Fases del ciclo hidrológico: evaporación, condensación, precipitación y recolección.",
                "Una gran sequía amenaza el valle de los sabios. El elemental de agua ha perdido sus memorias sobre el ciclo vital del agua. ¡Ayúdalo a reconstruirlo!",
                "OpcionMultiple",
                """{"preguntas":[{"enunciado":"¿Cómo se denomina el proceso por el cual el agua líquida pasa a estado gaseoso por acción del calor?","opciones":["Evaporación","Condensación","Precipitación","Sublimación"],"respuestaCorrecta":"Evaporación","explicacion":"La evaporación transforma el agua líquida de océanos y ríos en vapor hacia la atmósfera."},{"enunciado":"¿Qué fenómeno produce la formación de nubes a partir del vapor de agua?","opciones":["Condensación","Fusión","Evaporación","Solidificación"],"respuestaCorrecta":"Condensación","explicacion":"Al enfriarse en las capas altas, el vapor se condensa formando diminutas gotas que componen las nubes."}]}""",
                92, 120, misionPendienteId);
            repoMisiones.GuardarAsync(mPendiente).GetAwaiter().GetResult();
        }
    }
}

app.Run();

public partial class Program
{
    /// <summary>
    /// Convierte automáticamente URIs de Neon/PostgreSQL (postgresql://user:pass@host/db?sslmode=require)
    /// al formato Key-Value requerido por Npgsql, o devuelve la cadena intacta si ya está en formato Key-Value.
    /// </summary>
    public static string? NormalizarConnectionStringPostgres(string? connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            return connectionString;

        var limpia = connectionString.Trim().Trim('"', '\'');

        if (!limpia.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !limpia.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return limpia;
        }

        var uri = new Uri(limpia);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.Trim('/');
        var port = uri.Port > 0 ? uri.Port : 5432;

        var sb = new StringBuilder();
        sb.Append($"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};");

        if (uri.Query.Contains("sslmode=require", StringComparison.OrdinalIgnoreCase) ||
            uri.Host.EndsWith(".neon.tech", StringComparison.OrdinalIgnoreCase))
        {
            sb.Append("SSL Mode=Require;");
        }

        if (uri.Query.Contains("channel_binding=require", StringComparison.OrdinalIgnoreCase))
        {
            sb.Append("Channel Binding=Require;");
        }

        return sb.ToString();
    }
}
