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
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention());

builder.Services.AddScoped<IGeneradorDeTokens, GeneradorDeTokensJwt>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(builder.Configuration["FrontendUrl"] ?? "http://localhost:5173")
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

        // El token viaja en la cookie access_token, no en el header
        // Authorization -- hay que decirle al middleware dónde buscarlo.
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

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Por IP, no por usuario -- en login/registro todavía no hay identidad.
    // 5 intentos por minuto alcanza para un uso legítimo (incluso con algún
    // typo) y frena tanto fuerza bruta de contraseñas como spam de altas.
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "desconocido",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
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

    var tokenInterno = builder.Configuration["AiService:TokenInterno"]?
        .Replace("\r", "").Replace("\n", "").Trim()
        ?? throw new InvalidOperationException("Falta configurar AiService:TokenInterno.");

    client.DefaultRequestHeaders.Add("X-Internal-Token", tokenInterno);
});

var app = builder.Build();


app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapMisionesEndpoints();
app.MapAlumnosEndpoints();
app.MapUsuariosEndpoints();
app.MapAulasEndpoints();
app.MapDocentesEndpoints();
app.MapDirectivoEndpoints();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Usuario>();

    var rolDocenteId = Guid.Parse("A0000000-0000-0000-0000-000000000000");
    var rolAlumnoId = Guid.Parse("B0000000-0000-0000-0000-000000000000");
    var rolDirectivoId = Guid.Parse("C0000000-0000-0000-0000-000000000000");
    var rolAdministradorId = Guid.Parse("D0000000-0000-0000-0000-000000000000");
    var docenteId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    var alumnoId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    var aulaId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    var administradorId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    var directivoId = Guid.Parse("55555555-5555-5555-5555-555555555555");

    if (!context.Roles.Any(r => r.Id == rolDocenteId))
        context.Roles.Add(new Rol(rolDocenteId, "Docente"));
    if (!context.Roles.Any(r => r.Id == rolAlumnoId))
        context.Roles.Add(new Rol(rolAlumnoId, "Alumno"));
    if (!context.Roles.Any(r => r.Id == rolDirectivoId))
        context.Roles.Add(new Rol(rolDirectivoId, "Directivo"));
    if (!context.Roles.Any(r => r.Id == rolAdministradorId))
        context.Roles.Add(new Rol(rolAdministradorId, "Administrador"));

    if (!context.Usuarios.Any(u => u.Id == docenteId))
    {
        var docente = new Usuario(docenteId, "docente@unne.edu.ar", "Profesor Arduino", rolDocenteId);
        docente.EstablecerContrasena(hasher.HashPassword(docente, "Cambiar123!"));
        context.Usuarios.Add(docente);
    }

    if (!context.Usuarios.Any(u => u.Id == alumnoId))
    {
        var alumno = new Usuario(alumnoId, "joel@alumno.unne.edu.ar", "Joel Marcori", rolAlumnoId);
        alumno.EstablecerContrasena(hasher.HashPassword(alumno, "Cambiar123!"));
        alumno.RegistrarFechaNacimiento(new DateOnly(2003, 1, 1));
        context.Usuarios.Add(alumno);
    }

    if (!context.Usuarios.Any(u => u.Id == administradorId))
    {
        var admin = new Usuario(administradorId, "admin@unne.edu.ar", "Administrador", rolAdministradorId);
        admin.EstablecerContrasena(hasher.HashPassword(admin, "Cambiar123!"));
        context.Usuarios.Add(admin);
    }

    if (!context.Usuarios.Any(u => u.Id == directivoId))
    {
        var directivo = new Usuario(directivoId, "directivo@unne.edu.ar", "Directivo de Escuela", rolDirectivoId);
        directivo.EstablecerContrasena(hasher.HashPassword(directivo, "Cambiar123!"));
        context.Usuarios.Add(directivo);
    }

    if (!context.Aulas.Any(a => a.Id == aulaId))
    {
        context.Aulas.Add(new Aula(aulaId, "Laboratorio de Sistemas", docenteId));
        context.Inscripciones.Add(new Inscripcion(aulaId, alumnoId));
    }

    context.SaveChanges();

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


app.Run();
