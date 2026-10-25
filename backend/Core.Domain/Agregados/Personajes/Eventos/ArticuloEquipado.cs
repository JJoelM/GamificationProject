using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Personajes.Eventos;

// Distinto de ArticuloComprado: equipar no cuesta AP ni valida duplicados.
// Solo cambia qué está activo visualmente. Un artículo comprado puede
// desequiparse y reequiparse libremente sin generar transacciones de AP.
public sealed record ArticuloEquipado(
    Guid PersonajeId,
    string ArticuloId,
    TipoArticulo Tipo,
    string Valor,
    DateTime OcurridoEn) : IEventoDominio;
