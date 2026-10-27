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
        new("erudito_arcano", "Erudito Arcano", TipoArticulo.Avatar, 40),
        new("exploradora_reliquias", "Exploradora de Reliquias", TipoArticulo.Avatar, 40),

        // Marcos
        new("marco-pergamino", "Marco de pergamino", TipoArticulo.Marco, 30),
        new("marco_dorado", "Marco Dorado", TipoArticulo.Marco, 100),
        new("orlado_dorado", "Marco Orlado de Oro", TipoArticulo.Marco, 100),
        new("cristal_celeste", "Marco de Cristal Astral", TipoArticulo.Marco, 90),
        new("runa_violeta", "Marco de Runas Arcanas", TipoArticulo.Marco, 110),

        // Mascotas
        new("mascota-lechuza", "Lechuza", TipoArticulo.Mascota, 60),
        new("mascota_dragon", "Dragón", TipoArticulo.Mascota, 80),
        new("buho_erudito", "Búho Erudito", TipoArticulo.Mascota, 80),
        new("mascota_buho_erudito", "Búho Erudito", TipoArticulo.Mascota, 80),
        new("mascota_fenix_tinta", "Fénix de Tinta", TipoArticulo.Mascota, 150),
        new("mascota_golem_arcilla", "Golem de Arcilla & Runa", TipoArticulo.Mascota, 100),

        // Títulos
        new("titulo_centinela", "Centinela del Saber", TipoArticulo.Titulo, 140),
        new("titulo_centinela_saber", "Centinela del Saber", TipoArticulo.Titulo, 140),
        new("titulo_erudito", "Erudito Arcano", TipoArticulo.Titulo, 150),
        new("titulo_maestro_grimorios", "Maestro de Grimorios", TipoArticulo.Titulo, 200),
    };

    public static IReadOnlyList<ArticuloBazar> Todos => Articulos;

    public static ArticuloBazar? Buscar(string id) =>
        Articulos.FirstOrDefault(a => string.Equals(a.Id, id, StringComparison.OrdinalIgnoreCase));
}
