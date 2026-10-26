using Core.Application.Misiones.Proyecciones;
using Core.Application.Personajes.Proyecciones;
using Core.Domain.Entidades;

namespace Core.Application.Common;

public interface IApplicationDbContext
{
    IQueryable<Usuario> Usuarios { get; }
    IQueryable<Rol> Roles { get; }
    IQueryable<Aula> Aulas { get; }
    IQueryable<Inscripcion> Inscripciones { get; }
    IQueryable<BorradorIA> BorradoresIA { get; }
    IQueryable<MisionActiva> MisionesActivas { get; }
    IQueryable<FichaGrimorio> FichasGrimorio { get; }
    IQueryable<FichaGrimorioDesbloqueada> FichasGrimorioDesbloqueadas { get; }
    IQueryable<PersonajeResumen> PersonajesResumen { get; }
    IQueryable<ResolucionRegistrada> ResolucionesRegistradas { get; }
    IQueryable<ConexionMision> ConexionesMision { get; }

    void Add<TEntity>(TEntity entity) where TEntity : class;
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
