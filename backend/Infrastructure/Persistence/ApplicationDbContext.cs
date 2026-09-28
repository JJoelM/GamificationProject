using Core.Application.Common;
using Core.Application.Misiones.Proyecciones;
using Core.Domain.Entidades;
using Infrastructure.EventStore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Aula> Aulas => Set<Aula>();
    public DbSet<Inscripcion> Inscripciones => Set<Inscripcion>();
    public DbSet<EventoPersistido> EventosPersistidos => Set<EventoPersistido>();
    public DbSet<BorradorIA> BorradoresIA => Set<BorradorIA>();
    public DbSet<MisionActiva> MisionesActivas => Set<MisionActiva>();

    // Implementación explícita de IApplicationDbContext (Core.Application):
    // los DbSet de arriba siguen siendo lo que usa Infrastructure para
    // escribir directamente; esto es solo lo que ve Application.
    IQueryable<Usuario> IApplicationDbContext.Usuarios => Usuarios;
    IQueryable<Rol> IApplicationDbContext.Roles => Roles;
    IQueryable<Aula> IApplicationDbContext.Aulas => Aulas;
    IQueryable<Inscripcion> IApplicationDbContext.Inscripciones => Inscripciones;
    IQueryable<BorradorIA> IApplicationDbContext.BorradoresIA => BorradoresIA;
    IQueryable<MisionActiva> IApplicationDbContext.MisionesActivas => MisionesActivas;

    void IApplicationDbContext.Add<TEntity>(TEntity entity) => Add(entity);
    // SaveChangesAsync(CancellationToken) ya lo expone DbContext con una firma
    // compatible -- no hace falta implementación explícita para ese miembro.

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
