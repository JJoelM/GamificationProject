using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Personajes.Eventos;

public sealed record MisionSuperadaPorPrimeraVez(
    Guid PersonajeId,
    Guid MisionId,
    DateTime OcurridoEn) : IEventoDominio;
