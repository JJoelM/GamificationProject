using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Personajes.Eventos;

public sealed record PistaUsada(
    Guid PersonajeId,
    Guid MisionId,
    int IndicePregunta,
    int PistasRestantes,
    DateTime OcurridoEn) : IEventoDominio;
