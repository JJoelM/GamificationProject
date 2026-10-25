using Core.Application.Common;
using Core.Application.Misiones.Proyecciones;
using Core.Application.Personajes.Proyecciones;
using Core.Domain.Entidades;
using Infrastructure.EventStore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // Tablas de referencia
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Aula> Aulas => Set<Aula>();
    public DbSet<Inscripcion> Inscripciones => Set<Inscripcion>();

    // Ledger
    public DbSet<EventoPersistido> EventosPersistidos => Set<EventoPersistido>();

    // Proyecciones de Misión
    public DbSet<BorradorIA> BorradoresIA => Set<BorradorIA>();
    public DbSet<MisionActiva> MisionesActivas => Set<MisionActiva>();
    public DbSet<FichaGrimorio> FichasGrimorio => Set<FichaGrimorio>();
    public DbSet<FichaGrimorioDesbloqueada> FichasGrimorioDesbloqueadas => Set<FichaGrimorioDesbloqueada>();

    // Proyecciones de Personaje
    public DbSet<PersonajeResumen> PersonajesResumen => Set<PersonajeResumen>();
    public DbSet<ResolucionRegistrada> ResolucionesRegistradas => Set<ResolucionRegistrada>();

    // IApplicationDbContext -- lectura para los query handlers en Application
    IQueryable<Usuario> IApplicationDbContext.Usuarios => Usuarios;
    IQueryable<Rol> IApplicationDbContext.Roles => Roles;
    IQueryable<Aula> IApplicationDbContext.Aulas => Aulas;
    IQueryable<Inscripcion> IApplicationDbContext.Inscripciones => Inscripciones;
    IQueryable<BorradorIA> IApplicationDbContext.BorradoresIA => BorradoresIA;
    IQueryable<MisionActiva> IApplicationDbContext.MisionesActivas => MisionesActivas;
    IQueryable<FichaGrimorio> IApplicationDbContext.FichasGrimorio => FichasGrimorio;
    IQueryable<FichaGrimorioDesbloqueada> IApplicationDbContext.FichasGrimorioDesbloqueadas => FichasGrimorioDesbloqueadas;
    IQueryable<PersonajeResumen> IApplicationDbContext.PersonajesResumen => PersonajesResumen;
    IQueryable<ResolucionRegistrada> IApplicationDbContext.ResolucionesRegistradas => ResolucionesRegistradas;

    void IApplicationDbContext.Add<TEntity>(TEntity entity) => Add(entity);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
