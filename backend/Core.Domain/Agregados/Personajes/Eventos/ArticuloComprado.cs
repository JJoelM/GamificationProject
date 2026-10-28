using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Personajes.Eventos;

public enum TipoArticulo { Avatar = 0, Marco = 1, Mascota = 2, EscudoRacha = 3, Titulo = 4, Pista = 5 }

public sealed record ArticuloComprado(
    Guid PersonajeId,
    string ArticuloId,
    TipoArticulo Tipo,
    string Valor,
    int CostoAp,
    int PuntosAccionRestantes,
    DateTime OcurridoEn) : IEventoDominio;
