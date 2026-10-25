using Core.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Directivo.Consultas;

public sealed record ObtenerMetricasGlobalesQuery : IRequest<MetricasGlobalesDto>;

public sealed record MetricasGlobalesDto(
    int TotalDocentes,
    int DocentesActivos,
    int TotalAlumnos,
    int AlumnosActivosUltimos7Dias,
    int AlumnosActivosUltimos30Dias,
    int TotalMisionesGeneradas,
    int TotalMisionesValidadas,
    int TotalMisionesRechazadas,
    double TasaAprobacionHitlGlobal,
    List<AulaActividad> AulasMasActivas);

public sealed record AulaActividad(Guid AulaId, string NombreAula, int TotalResoluciones, int AlumnosActivos);

public sealed class ObtenerMetricasGlobalesQueryHandler
    : IRequestHandler<ObtenerMetricasGlobalesQuery, MetricasGlobalesDto>
{
    private readonly IApplicationDbContext _db;

    public ObtenerMetricasGlobalesQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<MetricasGlobalesDto> Handle(
        ObtenerMetricasGlobalesQuery request, CancellationToken cancellationToken)
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        var docentes = await _db.Usuarios
            .Where(u => u.Rol.Nombre == "Docente" && u.EstadoCuenta == Core.Domain.Entidades.EstadoCuenta.Activa)
            .CountAsync(cancellationToken);

        var totalAlumnos = await _db.Usuarios
            .CountAsync(u => u.Rol.Nombre == "Alumno", cancellationToken);

        var activos7 = await _db.ResolucionesRegistradas
            .Where(r => r.Fecha >= hoy.AddDays(-7))
            .Select(r => r.AlumnoId).Distinct()
            .CountAsync(cancellationToken);

        var activos30 = await _db.ResolucionesRegistradas
            .Where(r => r.Fecha >= hoy.AddDays(-30))
            .Select(r => r.AlumnoId).Distinct()
            .CountAsync(cancellationToken);

        var generadas = await _db.BorradoresIA.CountAsync(cancellationToken);
        var validadas = await _db.BorradoresIA.CountAsync(b => b.EstadoValidacion == "Validado", cancellationToken);
        var rechazadas = await _db.BorradoresIA.CountAsync(b => b.EstadoValidacion == "Rechazado", cancellationToken);
        var tasaHitl = generadas == 0 ? 0 : (double)validadas / generadas;

        var aulasMasActivas = await _db.ResolucionesRegistradas
            .GroupBy(r => r.AulaId)
            .Select(g => new
            {
                AulaId = g.Key,
                TotalResoluciones = g.Count(),
                AlumnosActivos = g.Select(r => r.AlumnoId).Distinct().Count()
            })
            .OrderByDescending(a => a.TotalResoluciones)
            .Take(10)
            .Join(_db.Aulas, a => a.AulaId, aula => aula.Id,
                (a, aula) => new AulaActividad(a.AulaId, aula.Nombre, a.TotalResoluciones, a.AlumnosActivos))
            .ToListAsync(cancellationToken);

        return new MetricasGlobalesDto(
            docentes, docentes, totalAlumnos, activos7, activos30,
            generadas, validadas, rechazadas, tasaHitl, aulasMasActivas);
    }
}
