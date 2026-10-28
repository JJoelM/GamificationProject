using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Misiones.Consultas;

// Nivel: columna donde dibujar el nodo (0 = sin misiones previas sugeridas).
// Resuelta: null para el docente; true/false para el alumno.
public sealed record NodoCaminoDto(
    Guid MisionId, string TemaCurricular, string TipoPlantilla, string Estado, int Nivel, bool? Resuelta);

public sealed record AristaCaminoDto(Guid Origen, Guid Destino);

public sealed record CaminoDto(List<NodoCaminoDto> Nodos, List<AristaCaminoDto> Aristas);

// ---------- Vista del docente: todas las misiones no rechazadas del Aula ----------
public sealed record ObtenerCaminoParaDocenteQuery(Guid AulaId, Guid DocenteId) : IRequest<CaminoDto>;

public sealed class ObtenerCaminoParaDocenteQueryHandler : IRequestHandler<ObtenerCaminoParaDocenteQuery, CaminoDto>
{
    private readonly IApplicationDbContext _db;

    public ObtenerCaminoParaDocenteQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<CaminoDto> Handle(ObtenerCaminoParaDocenteQuery request, CancellationToken cancellationToken)
    {
        var aula = await _db.Aulas.FirstOrDefaultAsync(a => a.Id == request.AulaId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException("Aula", request.AulaId);
        if (aula.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No tenés acceso a esta Aula.");

        var misiones = await _db.BorradoresIA
            .Where(b => b.AulaId == request.AulaId && b.EstadoValidacion != "Rechazado")
            .Select(b => new { b.MisionId, b.TemaCurricular, b.TipoPlantilla, b.EstadoValidacion })
            .ToListAsync(cancellationToken);

        var aristas = await _db.ConexionesMision
            .Where(c => c.AulaId == request.AulaId)
            .Select(c => new { c.MisionOrigenId, c.MisionDestinoId })
            .ToListAsync(cancellationToken);

        var ids = misiones.Select(m => m.MisionId).ToHashSet();
        var pares = aristas
            .Where(a => ids.Contains(a.MisionOrigenId) && ids.Contains(a.MisionDestinoId))
            .Select(a => (Origen: a.MisionOrigenId, Destino: a.MisionDestinoId))
            .ToList();

        var niveles = CaminoGrafo.CalcularNiveles(ids, pares);

        return new CaminoDto(
            misiones.Select(m => new NodoCaminoDto(
                m.MisionId, m.TemaCurricular, m.TipoPlantilla, m.EstadoValidacion, niveles[m.MisionId], null)).ToList(),
            pares.Select(p => new AristaCaminoDto(p.Origen, p.Destino)).ToList());
    }
}

// ---------- Vista del alumno: solo misiones activas y visibles ----------
public sealed record ObtenerCaminoParaAlumnoQuery(Guid AulaId, Guid AlumnoId) : IRequest<CaminoDto>;

public sealed class ObtenerCaminoParaAlumnoQueryHandler : IRequestHandler<ObtenerCaminoParaAlumnoQuery, CaminoDto>
{
    private readonly IApplicationDbContext _db;

    public ObtenerCaminoParaAlumnoQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<CaminoDto> Handle(ObtenerCaminoParaAlumnoQuery request, CancellationToken cancellationToken)
    {
        var estaInscripto = await _db.Inscripciones
            .AnyAsync(i => i.AulaId == request.AulaId && i.AlumnoId == request.AlumnoId, cancellationToken);
        if (!estaInscripto)
            throw new UnauthorizedAccessException("No estás inscripto en esta Aula.");

        var misiones = await _db.MisionesActivas
            .Where(m => m.AulaId == request.AulaId && m.EstaVisible)
            .Join(_db.BorradoresIA, m => m.MisionId, b => b.MisionId,
                (m, b) => new { m.MisionId, b.TemaCurricular, m.TipoPlantilla })
            .ToListAsync(cancellationToken);

        var resueltas = (await _db.ResolucionesRegistradas
                .Where(r => r.AlumnoId == request.AlumnoId && r.AulaId == request.AulaId)
                .Select(r => r.MisionId)
                .Distinct()
                .ToListAsync(cancellationToken))
            .ToHashSet();

        var aristas = await _db.ConexionesMision
            .Where(c => c.AulaId == request.AulaId)
            .Select(c => new { c.MisionOrigenId, c.MisionDestinoId })
            .ToListAsync(cancellationToken);

        // Las aristas hacia misiones ocultas se descartan: no se filtra que existen.
        var ids = misiones.Select(m => m.MisionId).ToHashSet();
        var pares = aristas
            .Where(a => ids.Contains(a.MisionOrigenId) && ids.Contains(a.MisionDestinoId))
            .Select(a => (Origen: a.MisionOrigenId, Destino: a.MisionDestinoId))
            .ToList();

        var niveles = CaminoGrafo.CalcularNiveles(ids, pares);

        return new CaminoDto(
            misiones.Select(m => new NodoCaminoDto(
                m.MisionId, m.TemaCurricular, m.TipoPlantilla, "Activa", niveles[m.MisionId],
                resueltas.Contains(m.MisionId))).ToList(),
            pares.Select(p => new AristaCaminoDto(p.Origen, p.Destino)).ToList());
    }
}
