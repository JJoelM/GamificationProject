using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Personajes.Eventos;

public sealed record ProgresoActualizado(
    Guid PersonajeId,
    Guid AlumnoId,
    Guid AulaId,
    Guid MisionId,
    int NumeroDeIntento,
    int PorcentajeCorrecto,
    bool EsRepaso,
    int XpGanado,
    int ApGanado,
    int ExperienciaTotal,
    int PuntosAccionTotal,
    int RachaDiasActivos,
    DateOnly Fecha,
    DateTime OcurridoEn) : IEventoDominio;