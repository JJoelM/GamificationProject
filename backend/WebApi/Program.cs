using System.Text;
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
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

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

    if (!context.Aulas.Any(a => a.Id == aulaId))
    {
        context.Aulas.Add(new Aula(aulaId, "Laboratorio de Sistemas", docenteId));
        context.Inscripciones.Add(new Inscripcion(aulaId, alumnoId));
    }

    context.SaveChanges();
}


app.Run();
