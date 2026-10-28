using Core.Domain.Agregados.Personajes.Eventos;

namespace Core.Domain.Agregados.Personajes;

public sealed record ArticuloBazar(string Id, string Nombre, TipoArticulo Tipo, int CostoAp);

public static class CatalogoBazar
{
    private static readonly IReadOnlyList<ArticuloBazar> Articulos = new List<ArticuloBazar>
    {
        // Consumibles (Únicamente 2 consumibles oficiales)
        new("pista", "Pista", TipoArticulo.Pista, 15),
        new("escudo-racha", "Escudo de racha", TipoArticulo.EscudoRacha, 50),

        // Avatares RPG Oficiales (sin duplicados)
        new("alquimista_botanica", "Alquimista Botánica", TipoArticulo.Avatar, 40),
        new("artifice_runico", "Artífice Rúnico", TipoArticulo.Avatar, 60),
        new("caballera_astral", "Caballera Astral", TipoArticulo.Avatar, 80),
        new("archimago_solar", "Archimago Solar", TipoArticulo.Avatar, 100),

        // Marcos
        new("scroll", "Marco de Pergamino", TipoArticulo.Marco, 30),
        new("orlado_dorado", "Marco Orlado de Oro", TipoArticulo.Marco, 100),
        new("cristal_celeste", "Marco de Cristal Astral", TipoArticulo.Marco, 90),
        new("runa_violeta", "Marco de Runas Arcanas", TipoArticulo.Marco, 110),

        // Mascotas (Únicamente 3 mascotas oficiales a 250 AP cada una)
        new("buho", "Búho Erudito", TipoArticulo.Mascota, 250),
        new("dragon", "Dragón Guardián", TipoArticulo.Mascota, 250),
        new("gato", "Gato Místico", TipoArticulo.Mascota, 250),

        // Títulos
        new("titulo_centinela", "Centinela del Saber", TipoArticulo.Titulo, 140),
        new("titulo_erudito", "Erudito Arcano", TipoArticulo.Titulo, 150),
        new("titulo_maestro_grimorios", "Maestro de Grimorios", TipoArticulo.Titulo, 200),
    };

    public static IReadOnlyList<ArticuloBazar> Todos => Articulos;

    public static ArticuloBazar? Buscar(string id)
    {
        if (string.IsNullOrWhiteSpace(id)) return null;

        var normalizado = id.Trim().ToLowerInvariant() switch
        {
            "escudo_1" => "escudo-racha",
            "mascota_buho" or "buho_erudito" or "mascota-lechuza" or "mascota_buho_erudito" => "buho",
            "mascota_dragon" => "dragon",
            "mascota_gato" => "gato",
            "marco-pergamino" => "scroll",
            "marco_dorado" => "orlado_dorado",
            "titulo_centinela_saber" => "titulo_centinela",
            "mago_sideral" => "archimago_solar",
            "avatar_arquera" => "alquimista_botanica",
            "avatar_guerrero" => "caballera_astral",
            "avatar_mago" => "erudito_arcano",
            "avatar-explorador" => "exploradora_reliquias",
            _ => id.Trim().ToLowerInvariant(),
        };

        return Articulos.FirstOrDefault(a => string.Equals(a.Id, normalizado, StringComparison.OrdinalIgnoreCase))
            ?? Articulos.FirstOrDefault(a => string.Equals(a.Id, id, StringComparison.OrdinalIgnoreCase));
    }
}
