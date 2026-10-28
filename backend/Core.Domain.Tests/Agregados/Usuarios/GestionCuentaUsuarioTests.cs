using Core.Application.Common;
using Core.Application.Usuarios.Comandos;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;
using Xunit;

namespace Core.Domain.Tests.Agregados.Usuarios;

public class GestionCuentaUsuarioTests
{
    private class FakeDbContext : IApplicationDbContext
    {
        public List<Usuario> UsuariosLista { get; } = new();
        public List<Aula> AulasLista { get; } = new();

        public IQueryable<Usuario> Usuarios => new TestAsyncEnumerable<Usuario>(UsuariosLista);
        public IQueryable<Rol> Roles => new TestAsyncEnumerable<Rol>(Enumerable.Empty<Rol>());
        public IQueryable<Aula> Aulas => new TestAsyncEnumerable<Aula>(AulasLista);
        public IQueryable<Inscripcion> Inscripciones => new TestAsyncEnumerable<Inscripcion>(Enumerable.Empty<Inscripcion>());
        public IQueryable<Core.Application.Misiones.Proyecciones.BorradorIA> BorradoresIA => new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.BorradorIA>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.BorradorIA>());
        public IQueryable<Core.Application.Misiones.Proyecciones.MisionActiva> MisionesActivas => new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.MisionActiva>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.MisionActiva>());
        public IQueryable<Core.Application.Misiones.Proyecciones.FichaGrimorio> FichasGrimorio => new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.FichaGrimorio>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.FichaGrimorio>());
        public IQueryable<Core.Application.Misiones.Proyecciones.FichaGrimorioDesbloqueada> FichasGrimorioDesbloqueadas => new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.FichaGrimorioDesbloqueada>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.FichaGrimorioDesbloqueada>());
        public IQueryable<Core.Application.Personajes.Proyecciones.PersonajeResumen> PersonajesResumen => new TestAsyncEnumerable<Core.Application.Personajes.Proyecciones.PersonajeResumen>(Enumerable.Empty<Core.Application.Personajes.Proyecciones.PersonajeResumen>());
        public IQueryable<Core.Application.Personajes.Proyecciones.ResolucionRegistrada> ResolucionesRegistradas => new TestAsyncEnumerable<Core.Application.Personajes.Proyecciones.ResolucionRegistrada>(Enumerable.Empty<Core.Application.Personajes.Proyecciones.ResolucionRegistrada>());
        public IQueryable<Core.Application.Misiones.Proyecciones.ConexionMision> ConexionesMision => new TestAsyncEnumerable<Core.Application.Misiones.Proyecciones.ConexionMision>(Enumerable.Empty<Core.Application.Misiones.Proyecciones.ConexionMision>());

        public void Add<TEntity>(TEntity entity) where TEntity : class { }
        public Task<int> SaveChangesAsync(CancellationToken ct = default) => Task.FromResult(0);
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

    [Fact]
    public async Task EliminarMiCuenta_UsuarioSinAulas_AnonimizaDatosYCambiaEstadoAEliminada()
    {
        // Arrange
        var db = new FakeDbContext();
        var rol = new Rol("Alumno");
        var usuario = new Usuario("alumno.prueba@unne.edu.ar", "Alumno Prueba", rol.Id);
        var hasher = new PasswordHasher<Usuario>();
        usuario.EstablecerContrasena(hasher.HashPassword(usuario, "Password123!"));
        usuario.ActualizarConsentimientoInvestigacion(true);
        db.UsuariosLista.Add(usuario);

        var handler = new EliminarMiCuentaCommandHandler(db);
        var command = new EliminarMiCuentaCommand(usuario.Id);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(EstadoCuenta.Eliminada, usuario.EstadoCuenta);
        Assert.Equal($"eliminado-{usuario.Id}@eliminado.local", usuario.Email);
        Assert.Equal("Usuario eliminado", usuario.NombreCompleto);
        Assert.Null(usuario.PasswordHash);
        Assert.False(usuario.AceptaUsoInvestigacion);
    }

    [Fact]
    public async Task EliminarMiCuenta_DocenteConAulasActivas_LanzaTransicionDeEstadoInvalidaException()
    {
        // Arrange
        var db = new FakeDbContext();
        var rol = new Rol("Docente");
        var docente = new Usuario("docente@unne.edu.ar", "Docente Titular", rol.Id);
        db.UsuariosLista.Add(docente);

        var aula = new Aula("Laboratorio de Programación", docente.Id);
        db.AulasLista.Add(aula);

        var handler = new EliminarMiCuentaCommandHandler(db);
        var command = new EliminarMiCuentaCommand(docente.Id);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<TransicionDeEstadoInvalidaException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.Contains("No podés eliminar tu cuenta mientras tengas Aulas", ex.Message);
    }

    [Fact]
    public async Task CambiarPassword_PasswordActualCorrectaYNuevaSegura_ActualizaContrasenaExitosamente()
    {
        // Arrange
        var db = new FakeDbContext();
        var rol = new Rol("Alumno");
        var usuario = new Usuario("alumno@unne.edu.ar", "Alumno Valiente", rol.Id);
        var hasher = new PasswordHasher<Usuario>();
        usuario.EstablecerContrasena(hasher.HashPassword(usuario, "ClaveVieja123!"));
        db.UsuariosLista.Add(usuario);

        var handler = new CambiarPasswordCommandHandler(db);
        var command = new CambiarPasswordCommand(usuario.Id, "ClaveVieja123!", "ClaveNueva456$");

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        var resultadoVerificacion = hasher.VerifyHashedPassword(usuario, usuario.PasswordHash!, "ClaveNueva456$");
        Assert.Equal(PasswordVerificationResult.Success, resultadoVerificacion);

        // La contraseña anterior ya no es válida
        var resultadoVieja = hasher.VerifyHashedPassword(usuario, usuario.PasswordHash!, "ClaveVieja123!");
        Assert.Equal(PasswordVerificationResult.Failed, resultadoVieja);
    }

    [Fact]
    public async Task CambiarPassword_PasswordActualIncorrecta_LanzaUnauthorizedAccessException()
    {
        // Arrange
        var db = new FakeDbContext();
        var rol = new Rol("Alumno");
        var usuario = new Usuario("alumno@unne.edu.ar", "Alumno Valiente", rol.Id);
        var hasher = new PasswordHasher<Usuario>();
        usuario.EstablecerContrasena(hasher.HashPassword(usuario, "ClaveCorrecta123!"));
        db.UsuariosLista.Add(usuario);

        var handler = new CambiarPasswordCommandHandler(db);
        var command = new CambiarPasswordCommand(usuario.Id, "ClaveIncorrecta999!", "ClaveNueva456$");

        // Act & Assert
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.Contains("La contraseña actual no es correcta", ex.Message);
    }

    [Theory]
    [InlineData("corta")]
    [InlineData("sinmayusculas123!")]
    [InlineData("SINMINUSCULAS123!")]
    [InlineData("SinNumerosNiSimbolo")]
    [InlineData("SinSimbolo12345")]
    public async Task CambiarPassword_PasswordNuevaInsegura_LanzaArgumentException(string passwordInvalida)
    {
        // Arrange
        var db = new FakeDbContext();
        var rol = new Rol("Alumno");
        var usuario = new Usuario("alumno@unne.edu.ar", "Alumno Valiente", rol.Id);
        var hasher = new PasswordHasher<Usuario>();
        usuario.EstablecerContrasena(hasher.HashPassword(usuario, "ClaveCorrecta123!"));
        db.UsuariosLista.Add(usuario);

        var handler = new CambiarPasswordCommandHandler(db);
        var command = new CambiarPasswordCommand(usuario.Id, "ClaveCorrecta123!", passwordInvalida);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() =>
            handler.Handle(command, CancellationToken.None));
    }
}
