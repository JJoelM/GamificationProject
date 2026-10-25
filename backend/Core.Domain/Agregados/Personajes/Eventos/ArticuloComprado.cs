using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Personajes.Eventos;

public enum TipoArticulo { Avatar, Marco, Mascota, EscudoRacha, Titulo }

public sealed record ArticuloComprado(
    Guid PersonajeId,
    string ArticuloId,
    TipoArticulo Tipo,
    string Valor,
    int CostoAp,
    int PuntosAccionRestantes,
    DateTime OcurridoEn) : IEventoDominio;
