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

        // Avatares RPG Oficiales
        // Tier 1 — Esenciales y Avanzados (0 a 100 AP)
        new("erudito_arcano", "Erudito Arcano", TipoArticulo.Avatar, 0),
        new("exploradora_reliquias", "Exploradora de Reliquias", TipoArticulo.Avatar, 0),
        new("alquimista_botanica", "Alquimista Botánica", TipoArticulo.Avatar, 40),
        new("avatar_arquera", "Arquera Silvana", TipoArticulo.Avatar, 50),
        new("artifice_runico", "Artífice Rúnico", TipoArticulo.Avatar, 60),
        new("caballera_astral", "Caballera Astral", TipoArticulo.Avatar, 80),
        new("archimago_solar", "Archimago Solar", TipoArticulo.Avatar, 100),

        // Tier 2 — Ilustraciones Raras (180 AP)
        new("avatar_guerrero_veterano", "Guerrero Veterano", TipoArticulo.Avatar, 180),
        new("avatar_sanadora_luz", "Sanadora de la Luz", TipoArticulo.Avatar, 180),
        new("avatar_hechicero_arcano", "Hechicero Arcano", TipoArticulo.Avatar, 180),

        // Tier 3 — Ilustraciones Legendarias (300 AP)
        new("avatar_paladin_runico", "Paladín Rúnico", TipoArticulo.Avatar, 300),
        new("avatar_archimaga_floresta", "Archimaga de la Floresta", TipoArticulo.Avatar, 300),
        new("avatar_cazador_sombrio", "Cazador Sombrío", TipoArticulo.Avatar, 300),

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
            "arquera_silvana" or "arquera" => "avatar_arquera",
            "avatar_guerrero" => "caballera_astral",
            "avatar_mago" => "erudito_arcano",
            "avatar-explorador" => "exploradora_reliquias",
            "guerrero_veterano" => "avatar_guerrero_veterano",
            "sanadora_luz" => "avatar_sanadora_luz",
            "hechicero_arcano" => "avatar_hechicero_arcano",
            "paladin" or "paladin_runico" => "avatar_paladin_runico",
            "witch" or "archimaga_floresta" => "avatar_archimaga_floresta",
            "ranger" or "cazador_sombrio" => "avatar_cazador_sombrio",
            _ => id.Trim().ToLowerInvariant(),
        };

        return Articulos.FirstOrDefault(a => string.Equals(a.Id, normalizado, StringComparison.OrdinalIgnoreCase))
            ?? Articulos.FirstOrDefault(a => string.Equals(a.Id, id, StringComparison.OrdinalIgnoreCase));
    }
}
