using System.Linq.Expressions;
using Core.Application.Common;
using Core.Application.Usuarios.Comandos;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Query;
using Xunit;

namespace Core.Domain.Tests.Agregados.Usuarios;

public class LoginCuentaPendienteTests
{
    private class FakeTokens : IGeneradorDeTokens
    {
        public string GenerarToken(Guid usuarioId, string email, string rol) => "token_valido";
    }

    private class FakeDbContext : IApplicationDbContext
    {
        public List<Usuario> UsuariosLista { get; } = new();

        public IQueryable<Usuario> Usuarios => new TestAsyncEnumerable<Usuario>(UsuariosLista);
        public IQueryable<Rol> Roles => new TestAsyncEnumerable<Rol>(Enumerable.Empty<Rol>());
        public IQueryable<Aula> Aulas => new TestAsyncEnumerable<Aula>(Enumerable.Empty<Aula>());
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
    public async Task Login_ConCuentaPendienteDeAprobacion_LanzaTransicionDeEstadoInvalidaException_QueMapeaA409()
    {
        // Arrange
        var db = new FakeDbContext();
        var rol = new Rol("Alumno");
        var usuario = new Usuario("menor@unne.edu.ar", "Alumno Menor", rol.Id);
        var hasher = new PasswordHasher<Usuario>();
        usuario.EstablecerContrasena(hasher.HashPassword(usuario, "Password123!"));
        // Registrar menor setea EstadoCuenta = PendienteDeAprobacion
        usuario.RegistrarDatosDeMenor(new DateOnly(2012, 1, 1), "tutor@unne.edu.ar");

        // Set navigation property Rol via reflection or field
        typeof(Usuario).GetProperty("Rol")?.SetValue(usuario, rol);

        db.UsuariosLista.Add(usuario);

        var handler = new LoginCommandHandler(db, new FakeTokens());
        var command = new LoginCommand("menor@unne.edu.ar", "Password123!");

        // Act & Assert
        var ex = await Assert.ThrowsAsync<TransicionDeEstadoInvalidaException>(() =>
            handler.Handle(command, CancellationToken.None));

        Assert.Contains("PendienteDeAprobacion", ex.Message);
    }
}
