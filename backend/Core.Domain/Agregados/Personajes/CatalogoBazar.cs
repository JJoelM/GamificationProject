using Core.Domain.Agregados.Personajes.Eventos;

namespace Core.Domain.Agregados.Personajes;

public sealed record ArticuloBazar(string Id, string Nombre, TipoArticulo Tipo, int CostoAp);

public static class CatalogoBazar
{
    private static readonly IReadOnlyList<ArticuloBazar> Articulos = new List<ArticuloBazar>
    {
        // Consumibles
        new("pista", "Pista", TipoArticulo.Pista, 15),
        new("escudo-racha", "Escudo de racha", TipoArticulo.EscudoRacha, 50),
        new("escudo_1", "Escudo de racha", TipoArticulo.EscudoRacha, 50),

        // Avatares
        new("avatar-explorador", "Explorador", TipoArticulo.Avatar, 40),
        new("avatar_guerrero", "Guerrero", TipoArticulo.Avatar, 50),
        new("avatar_mago", "Mago", TipoArticulo.Avatar, 60),
        new("avatar_arquera", "Arquera", TipoArticulo.Avatar, 50),

        // Marcos
        new("marco-pergamino", "Marco de pergamino", TipoArticulo.Marco, 30),
        new("marco_dorado", "Marco Dorado", TipoArticulo.Marco, 100),

        // Mascotas
        new("mascota-lechuza", "Lechuza", TipoArticulo.Mascota, 60),
        new("mascota_dragon", "Dragón", TipoArticulo.Mascota, 80),

        // Títulos
        new("titulo_centinela", "Centinela del Saber", TipoArticulo.Titulo, 140),
        new("titulo_erudito", "Erudito Arcano", TipoArticulo.Titulo, 150),
    };

    public static IReadOnlyList<ArticuloBazar> Todos => Articulos;

    public static ArticuloBazar? Buscar(string id) =>
        Articulos.FirstOrDefault(a => string.Equals(a.Id, id, StringComparison.OrdinalIgnoreCase));
}
