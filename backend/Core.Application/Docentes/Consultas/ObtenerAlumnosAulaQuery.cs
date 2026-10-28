using Core.Application.Common;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Docentes.Consultas;

public sealed record AlumnoAulaDto(
    Guid AlumnoId,
    string NombreCompleto,
    string Email,
    DateTime FechaInscripcion,
    int ExperienciaXP,
    int Nivel,
    int PuntosAccionAP,
    int RachaDiasActivos,
    int MisionesCompletadas,
    string AvatarEquipado,
    string? MarcoEquipado,
    string? MascotaEquipada,
    string? TituloEquipado);

public sealed record ObtenerAlumnosAulaQuery(Guid AulaId, Guid DocenteId) : IRequest<List<AlumnoAulaDto>>;

public sealed class ObtenerAlumnosAulaQueryHandler : IRequestHandler<ObtenerAlumnosAulaQuery, List<AlumnoAulaDto>>
{
    private readonly IApplicationDbContext _db;

    public ObtenerAlumnosAulaQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<List<AlumnoAulaDto>> Handle(ObtenerAlumnosAulaQuery request, CancellationToken cancellationToken)
    {
        var aula = await _db.Aulas.FirstOrDefaultAsync(a => a.Id == request.AulaId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException("Aula", request.AulaId);

        if (aula.DocenteId != request.DocenteId)
            throw new UnauthorizedAccessException("No tenés acceso a la información de los alumnos de esta Aula.");

        var inscripciones = await _db.Inscripciones
            .Where(i => i.AulaId == request.AulaId)
            .ToListAsync(cancellationToken);

        var alumnoIds = inscripciones.Select(i => i.AlumnoId).ToList();

        var usuarios = await _db.Usuarios
            .Where(u => alumnoIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, cancellationToken);

        var resumenes = await _db.PersonajesResumen
            .Where(p => p.AulaId == request.AulaId && alumnoIds.Contains(p.AlumnoId))
            .ToDictionaryAsync(p => p.AlumnoId, cancellationToken);

        var resultado = new List<AlumnoAulaDto>();

        foreach (var inscripcion in inscripciones)
        {
            if (!usuarios.TryGetValue(inscripcion.AlumnoId, out var usuario))
                continue;

            resumenes.TryGetValue(inscripcion.AlumnoId, out var resumen);

            var xp = resumen?.ExperienciaXP ?? 0;
            var nivel = CalcularNivel(xp);

            resultado.Add(new AlumnoAulaDto(
                inscripcion.AlumnoId,
                usuario.NombreCompleto,
                usuario.Email,
                inscripcion.FechaInscripcion,
                xp,
                nivel,
                resumen?.PuntosAccionAP ?? 0,
                resumen?.RachaDiasActivos ?? 0,
                resumen?.MisionesCompletadas ?? 0,
                resumen?.AvatarEquipado ?? "erudito_arcano",
                resumen?.MarcoEquipado,
                resumen?.MascotaEquipada,
                resumen?.TituloEquipado ?? "Iniciado del Saber"
            ));
        }

        return resultado.OrderByDescending(a => a.ExperienciaXP).ToList();
    }

    private static int CalcularNivel(int xp)
    {
        if (xp < 300) return 1;
        if (xp < 700) return 2;
        if (xp < 1200) return 3;
        if (xp < 2000) return 4;
        return 5;
    }
}
