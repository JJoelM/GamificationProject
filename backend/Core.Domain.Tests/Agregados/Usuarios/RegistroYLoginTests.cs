using System.Linq.Expressions;
using Core.Application.Common;
using Core.Application.Usuarios.Comandos;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Query;
using Xunit;

namespace Core.Domain.Tests.Agregados.Usuarios;

public class RegistroYLoginTests
{
    private class FakeTokens : IGeneradorDeTokens
    {
        public string GenerarToken(Guid usuarioId, string email, string rol) => $"token_valido_para_{email}";
    }

    private class FakeDbContext : IApplicationDbContext
    {
        public List<Usuario> UsuariosLista { get; } = new();
        public List<Rol> RolesLista { get; } = new();
        public List<Aula> AulasLista { get; } = new();
        public List<Inscripcion> InscripcionesLista { get; } = new();

        public IQueryable<Usuario> Usuarios => new TestAsyncEnumerable<Usuario>(UsuariosLista);
        public IQueryable<Rol> Roles => new TestAsyncEnumerable<Rol>(RolesLista);
        public IQueryable<Aula> Aulas => new TestAsyncEnumerable<Aula>(AulasLista);
        public IQueryable<Inscripcion> Inscripciones => new TestAsyncEnumerable<Inscripcion>(InscripcionesLista);

        public IQueryable<Core.Application.Misiones.Proyecciones.BorradorIA> BorradoresIA =>
            new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.BorradorIA>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.BorradorIA>());
        public IQueryable<Core.Application.Misiones.Proyecciones.MisionActiva> MisionesActivas =>
            new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.MisionActiva>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.MisionActiva>());
        public IQueryable<Core.Application.Misiones.Proyecciones.FichaGrimorio> FichasGrimorio =>
            new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.FichaGrimorio>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.FichaGrimorio>());
        public IQueryable<Core.Application.Misiones.Proyecciones.FichaGrimorioDesbloqueada> FichasGrimorioDesbloqueadas =>
            new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.FichaGrimorioDesbloqueada>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.FichaGrimorioDesbloqueada>());
        public IQueryable<Core.Application.Personajes.Proyecciones.PersonajeResumen> PersonajesResumen =>
            new TestAsyncEnumerable<Core.Application.Personajes.Proyecciones.PersonajeResumen>(Enumerable.Empty<Core.Application.Personajes.Proyecciones.PersonajeResumen>());
        public IQueryable<Core.Application.Personajes.Proyecciones.ResolucionRegistrada> ResolucionesRegistradas =>
            new TestAsyncEnumerable<Core.Application.Personajes.Proyecciones.ResolucionRegistrada>(Enumerable.Empty<Core.Application.Personajes.Proyecciones.ResolucionRegistrada>());
        public IQueryable<Core.Application.Misiones.Proyecciones.ConexionMision> ConexionesMision =>
            new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.ConexionMision>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.ConexionMision>());

        public void Add<TEntity>(TEntity entity) where TEntity : class
        {
            if (entity is Usuario u) UsuariosLista.Add(u);
            else if (entity is Rol r) RolesLista.Add(r);
            else if (entity is Aula a) AulasLista.Add(a);
            else if (entity is Inscripcion i) InscripcionesLista.Add(i);
        }

        public Task<int> SaveChangesAsync(CancellationToken ct = default) => Task.FromResult(1);
    }

    private class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;
        internal TestAsyncQueryProvider(IQueryProvider inner) => _inner = inner;

        public IQueryable CreateQuery(Expression expression) => new TestAsyncEnumerable<TEntity>(expression);
        public IQueryable<TElement> CreateQuery<TElement>(Expression expression) => new TestAsyncEnumerable<TElement>(expression);
        public object? Execute(Expression expression) => _inner.Execute(expression);
        public TResult Execute<TResult>(Expression expression) => _inner.Execute<TResult>(expression);

        public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
        {
            var expectedResultType = typeof(TResult).GetGenericArguments()[0];
            var executionResult = typeof(IQueryProvider)
                .GetMethods()
                .First(m => m.Name == nameof(IQueryProvider.Execute) && m.IsGenericMethod)
                .MakeGenericMethod(expectedResultType)
                .Invoke(_inner, new object[] { expression });

            return (TResult)typeof(Task).GetMethod(nameof(Task.FromResult))!
                .MakeGenericMethod(expectedResultType)
                .Invoke(null, new[] { executionResult })!;
        }
    }

    private class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
    {
        public TestAsyncEnumerable(IEnumerable<T> enumerable) : base(enumerable) { }
        public TestAsyncEnumerable(Expression expression) : base(expression) { }

        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
            => new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());

        IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
    }

    private class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;
        public TestAsyncEnumerator(IEnumerator<T> inner) => _inner = inner;
        public T Current => _inner.Current;
        public ValueTask<bool> MoveNextAsync() => new(_inner.MoveNext());
        public ValueTask DisposeAsync() { _inner.Dispose(); return ValueTask.CompletedTask; }
    }

    private (FakeDbContext db, Rol rolAlumno, Rol rolDocente, Aula aula) CrearEscenarioBase()
    {
        var db = new FakeDbContext();
        var rolDocente = new Rol("Docente");
        var rolAlumno = new Rol("Alumno");
        db.RolesLista.Add(rolDocente);
        db.RolesLista.Add(rolAlumno);

        var docente = new Usuario("docente.base@unne.edu.ar", "Docente Base", rolDocente.Id);
        db.UsuariosLista.Add(docente);

        var aula = new Aula("Aula Demo 101", docente.Id);
        db.AulasLista.Add(aula);

        return (db, rolAlumno, rolDocente, aula);
    }

    [Fact]
    public async Task RegistrarAlumno_MayorDeEdad_CreaUsuarioActivoEInscribeEnAula()
    {
        var (db, _, _, aula) = CrearEscenarioBase();
        var handler = new RegistrarAlumnoConInvitacionCommandHandler(db);
        var command = new RegistrarAlumnoConInvitacionCommand(
            aula.CodigoInvitacion,
            "alumno.nuevo@unne.edu.ar",
            "Estudiante Nuevo",
            "ClaveSegura123!",
            new DateOnly(2000, 5, 20),
            EmailTutor: null,
            AceptaUsoInvestigacion: true
        );

        var resultado = await handler.Handle(command, CancellationToken.None);

        Assert.NotNull(resultado);
        Assert.Equal(aula.Id, resultado.AulaId);
        Assert.False(resultado.RequiereAprobacionParental);

        var usuarioGuardado = db.UsuariosLista.FirstOrDefault(u => u.Email == "alumno.nuevo@unne.edu.ar");
        Assert.NotNull(usuarioGuardado);
        Assert.Equal(EstadoCuenta.Activa, usuarioGuardado.EstadoCuenta);
        Assert.True(usuarioGuardado.AceptaUsoInvestigacion);

        var inscripcion = db.InscripcionesLista.FirstOrDefault(i => i.AlumnoId == usuarioGuardado.Id && i.AulaId == aula.Id);
        Assert.NotNull(inscripcion);
    }

    [Fact]
    public async Task RegistrarAlumno_MenorDeEdad_RequiereAprobacionParentalYGuardaEmailTutor()
    {
        var (db, _, _, aula) = CrearEscenarioBase();
        var handler = new RegistrarAlumnoConInvitacionCommandHandler(db);
        var fechaNacimientoMenor = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-14));
        var command = new RegistrarAlumnoConInvitacionCommand(
            aula.CodigoInvitacion,
            "menor.nuevo@unne.edu.ar",
            "Estudiante Menor",
            "ClaveSegura123!",
            fechaNacimientoMenor,
            EmailTutor: "padre@unne.edu.ar",
            AceptaUsoInvestigacion: true
        );

        var resultado = await handler.Handle(command, CancellationToken.None);

        Assert.True(resultado.RequiereAprobacionParental);

        var usuarioGuardado = db.UsuariosLista.FirstOrDefault(u => u.Email == "menor.nuevo@unne.edu.ar");
        Assert.NotNull(usuarioGuardado);
        Assert.Equal(EstadoCuenta.PendienteDeAprobacion, usuarioGuardado.EstadoCuenta);
        Assert.Equal("padre@unne.edu.ar", usuarioGuardado.EmailTutor);
    }

    [Fact]
    public async Task RegistrarAlumno_MenorDeEdad_SinEmailTutor_LanzaArgumentException()
    {
        var (db, _, _, aula) = CrearEscenarioBase();
        var handler = new RegistrarAlumnoConInvitacionCommandHandler(db);
        var fechaNacimientoMenor = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-14));
        var command = new RegistrarAlumnoConInvitacionCommand(
            aula.CodigoInvitacion,
            "menor.sintutor@unne.edu.ar",
            "Estudiante Sin Tutor",
            "ClaveSegura123!",
            fechaNacimientoMenor,
            EmailTutor: null,
            AceptaUsoInvestigacion: true
        );

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(command, CancellationToken.None));
        Assert.Contains("tutor", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task RegistrarAlumno_CodigoInvitacionInexistente_LanzaArgumentException()
    {
        var (db, _, _, _) = CrearEscenarioBase();
        var handler = new RegistrarAlumnoConInvitacionCommandHandler(db);
        var command = new RegistrarAlumnoConInvitacionCommand(
            "CODIGO_INVALIDO_XYZ",
            "alumno.err@unne.edu.ar",
            "Estudiante Test",
            "ClaveSegura123!",
            new DateOnly(2002, 1, 1),
            EmailTutor: null,
            AceptaUsoInvestigacion: true
        );

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(command, CancellationToken.None));
        Assert.Contains("código de invitación no es válido", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task RegistrarAlumno_EmailDuplicado_LanzaArgumentException()
    {
        var (db, _, _, aula) = CrearEscenarioBase();
        var handler = new RegistrarAlumnoConInvitacionCommandHandler(db);
        var command = new RegistrarAlumnoConInvitacionCommand(
            aula.CodigoInvitacion,
            "docente.base@unne.edu.ar", // Ya existe
            "Estudiante Clónico",
            "ClaveSegura123!",
            new DateOnly(2002, 1, 1),
            EmailTutor: null,
            AceptaUsoInvestigacion: true
        );

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(command, CancellationToken.None));
        Assert.Contains("Ya existe una cuenta registrada con ese email", ex.Message);
    }

    [Theory]
    [InlineData("corta")]                   // Menor a 8
    [InlineData("sinmayuscula123!")]        // Sin mayúscula
    [InlineData("SINMINUSCULA123!")]        // Sin minúscula
    [InlineData("SinNumeroYSimbolo")]       // Sin número y sin símbolo
    [InlineData("SinSimbolo123")]           // Sin símbolo
    public async Task RegistrarAlumno_PasswordInsegura_LanzaArgumentException(string passwordInvalida)
    {
        var (db, _, _, aula) = CrearEscenarioBase();
        var handler = new RegistrarAlumnoConInvitacionCommandHandler(db);
        var command = new RegistrarAlumnoConInvitacionCommand(
            aula.CodigoInvitacion,
            "alumno.pass@unne.edu.ar",
            "Estudiante Clave Invalida",
            passwordInvalida,
            new DateOnly(2002, 1, 1),
            EmailTutor: null,
            AceptaUsoInvestigacion: true
        );

        await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task RegistrarDocente_Exitoso_CreaDocenteActivo()
    {
        var (db, _, _, _) = CrearEscenarioBase();
        var handler = new RegistrarDocenteCommandHandler(db);
        var command = new RegistrarDocenteCommand(
            "docente.nuevo@unne.edu.ar",
            "Docente Ingeniero",
            "ClaveFuerte123!",
            AceptaUsoInvestigacion: true
        );

        var id = await handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, id);
        var guardado = db.UsuariosLista.FirstOrDefault(u => u.Id == id);
        Assert.NotNull(guardado);
        Assert.Equal(EstadoCuenta.Activa, guardado.EstadoCuenta);
    }

    [Fact]
    public async Task Login_CredencialesCorrectas_RetornaTokenYDatos()
    {
        var (db, rolAlumno, _, _) = CrearEscenarioBase();
        var usuario = new Usuario("alumno.login@unne.edu.ar", "Alumno Login", rolAlumno.Id);
        var hasher = new PasswordHasher<Usuario>();
        usuario.EstablecerContrasena(hasher.HashPassword(usuario, "SuperSecreta123!"));
        typeof(Usuario).GetProperty("Rol")?.SetValue(usuario, rolAlumno);
        db.UsuariosLista.Add(usuario);

        var handler = new LoginCommandHandler(db, new FakeTokens());
        var command = new LoginCommand("alumno.login@unne.edu.ar", "SuperSecreta123!");

        var resultado = await handler.Handle(command, CancellationToken.None);

        Assert.NotNull(resultado);
        Assert.Equal("Alumno Login", resultado.NombreCompleto);
        Assert.Equal("Alumno", resultado.Rol);
        Assert.False(string.IsNullOrWhiteSpace(resultado.Token));
    }

    [Fact]
    public async Task Login_PasswordIncorrecta_LanzaUnauthorizedAccessException()
    {
        var (db, rolAlumno, _, _) = CrearEscenarioBase();
        var usuario = new Usuario("alumno.fail@unne.edu.ar", "Alumno Login", rolAlumno.Id);
        var hasher = new PasswordHasher<Usuario>();
        usuario.EstablecerContrasena(hasher.HashPassword(usuario, "SuperSecreta123!"));
        typeof(Usuario).GetProperty("Rol")?.SetValue(usuario, rolAlumno);
        db.UsuariosLista.Add(usuario);

        var handler = new LoginCommandHandler(db, new FakeTokens());
        var command = new LoginCommand("alumno.fail@unne.edu.ar", "PasswordEquivocada123!");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Login_EmailInexistente_LanzaUnauthorizedAccessException()
    {
        var (db, _, _, _) = CrearEscenarioBase();
        var handler = new LoginCommandHandler(db, new FakeTokens());
        var command = new LoginCommand("fantasma@unne.edu.ar", "Password123!");

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Login_CuentaSuspendida_LanzaTransicionDeEstadoInvalidaException()
    {
        var (db, rolAlumno, _, _) = CrearEscenarioBase();
        var usuario = new Usuario("suspendido@unne.edu.ar", "Alumno Suspendido", rolAlumno.Id);
        var hasher = new PasswordHasher<Usuario>();
        usuario.EstablecerContrasena(hasher.HashPassword(usuario, "ClaveValida123!"));
        usuario.Suspender();
        typeof(Usuario).GetProperty("Rol")?.SetValue(usuario, rolAlumno);
        db.UsuariosLista.Add(usuario);

        var handler = new LoginCommandHandler(db, new FakeTokens());
        var command = new LoginCommand("suspendido@unne.edu.ar", "ClaveValida123!");

        var ex = await Assert.ThrowsAsync<TransicionDeEstadoInvalidaException>(() =>
            handler.Handle(command, CancellationToken.None));
        Assert.Contains("Suspendida", ex.Message);
    }
}
