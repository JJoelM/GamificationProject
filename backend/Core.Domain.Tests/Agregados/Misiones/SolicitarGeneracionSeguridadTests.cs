using System.Linq.Expressions;
using Core.Application.Common;
using Core.Application.Misiones.Comandos;
using Core.Domain.Agregados.Misiones;
using Core.Domain.Entidades;
using Core.Domain.SeedWork;
using Microsoft.EntityFrameworkCore.Query;
using Xunit;

namespace Core.Domain.Tests.Agregados.Misiones;

public class SolicitarGeneracionSeguridadTests
{
    private class FakeDbContext : IApplicationDbContext
    {
        public List<Aula> AulasLista { get; } = new();

        public IQueryable<Usuario> Usuarios => new TestAsyncEnumerable<Usuario>(Enumerable.Empty<Usuario>());
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

        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default) =>
            new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());

        IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
    }

    private class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;
        public TestAsyncEnumerator(IEnumerator<T> inner) => _inner = inner;
        public T Current => _inner.Current;
        public ValueTask<bool> MoveNextAsync() => ValueTask.FromResult(_inner.MoveNext());
        public ValueTask DisposeAsync() { _inner.Dispose(); return ValueTask.CompletedTask; }
    }

    private class FakeGenerador : IGeneradorDeMisiones
    {
        public Task<ContenidoGeneradoPorIA> GenerarAsync(
            TipoPlantilla tipo, string temaCurricular, string textoFuente, CancellationToken ct = default)
        {
            return Task.FromResult(new ContenidoGeneradoPorIA("Narrativa de prueba", "{}", 3));
        }
    }

    private class FakeRepositorioMisiones : IRepositorioMisiones
    {
        public Mision? MisionGuardada { get; private set; }

        public Task GuardarAsync(Mision mision, CancellationToken cancellationToken = default)
        {
            MisionGuardada = mision;
            return Task.CompletedTask;
        }

        public Task<Mision?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(MisionGuardada);
        }
    }

    [Fact]
    public async Task Handle_SiElAulaNoExiste_LanzaAgregadoNoEncontradoException()
    {
        var db = new FakeDbContext();
        var handler = new SolicitarGeneracionDeMisionCommandHandler(new FakeGenerador(), new FakeRepositorioMisiones(), db);

        var comando = new SolicitarGeneracionDeMisionCommand(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto de prueba con más de cincuenta caracteres para ser válido...");

        await Assert.ThrowsAsync<AgregadoNoEncontradoException>(() => handler.Handle(comando, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_SiElAulaPerteneceAOtroDocente_LanzaUnauthorizedAccessException()
    {
        var db = new FakeDbContext();
        var docenteReal = Guid.NewGuid();
        var docenteIntruso = Guid.NewGuid();
        var aula = new Aula(Guid.NewGuid(), "Aula de Ciencias", docenteReal);
        db.AulasLista.Add(aula);

        var handler = new SolicitarGeneracionDeMisionCommandHandler(new FakeGenerador(), new FakeRepositorioMisiones(), db);

        var comando = new SolicitarGeneracionDeMisionCommand(
            docenteIntruso, aula.Id, "Tema", "Texto de prueba con más de cincuenta caracteres para ser válido...");

        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(comando, CancellationToken.None));
        Assert.Contains("no pertenece al docente", ex.Message);
    }

    [Fact]
    public async Task Handle_SiElAulaPerteneceAlDocente_GeneraYGuardaMisionExitosamente()
    {
        var db = new FakeDbContext();
        var docente = Guid.NewGuid();
        var aula = new Aula(Guid.NewGuid(), "Aula de Ciencias", docente);
        db.AulasLista.Add(aula);

        var repo = new FakeRepositorioMisiones();
        var handler = new SolicitarGeneracionDeMisionCommandHandler(new FakeGenerador(), repo, db);

        var comando = new SolicitarGeneracionDeMisionCommand(
            docente, aula.Id, "La Fotosíntesis", "Texto de prueba con más de cincuenta caracteres para ser válido...");

        var misionId = await handler.Handle(comando, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, misionId);
        Assert.NotNull(repo.MisionGuardada);
        Assert.Equal(docente, repo.MisionGuardada.DocenteId);
        Assert.Equal(aula.Id, repo.MisionGuardada.AulaId);
    }
}
