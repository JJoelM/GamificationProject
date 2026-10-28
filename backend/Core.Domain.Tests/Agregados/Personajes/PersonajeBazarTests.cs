using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;
using Xunit;

namespace Core.Domain.Tests.Agregados.Personajes;

public class PersonajeBazarTests
{
    private static readonly DateOnly Hoy = new(2026, 9, 28);

    // Un 100% en el primer intento da exactamente 'ap' puntos de accion.
    private static Personaje ConAp(int ap)
    {
        var personaje = Personaje.Iniciar(Guid.NewGuid(), Guid.NewGuid());
        personaje.RegistrarResolucionDeMision(Guid.NewGuid(), ap * 2, ap, 100, Hoy);
        return personaje;
    }

    [Fact]
    public void ComprarPista_DescuentaApYSumaUnaPista()
    {
        var personaje = ConAp(40);

        personaje.ComprarArticulo("pista", 15, TipoArticulo.Pista, "pista");

        Assert.Equal(25, personaje.PuntosAccionAP);
        Assert.Equal(1, personaje.PistasDisponibles);
    }

    [Fact]
    public void ComprarPistaDosVeces_EsValido_PorqueEsConsumible()
    {
        var personaje = ConAp(40);

        personaje.ComprarArticulo("pista", 15, TipoArticulo.Pista, "pista");
        personaje.ComprarArticulo("pista", 15, TipoArticulo.Pista, "pista");

        Assert.Equal(2, personaje.PistasDisponibles);
        Assert.Equal(10, personaje.PuntosAccionAP);
    }

    [Fact]
    public void ComprarUnCosmetico_LoEquipaYNoSePuedeComprarDeNuevo()
    {
        var personaje = ConAp(100);

        personaje.ComprarArticulo("avatar-explorador", 40, TipoArticulo.Avatar, "avatar-explorador");

        Assert.Equal("avatar-explorador", personaje.AvatarEquipado);
        Assert.Throws<TransicionDeEstadoInvalidaException>(() =>
            personaje.ComprarArticulo("avatar-explorador", 40, TipoArticulo.Avatar, "avatar-explorador"));
    }

    [Fact]
    public void ComprarSinApSuficiente_Lanza()
    {
        var personaje = ConAp(10);

        Assert.Throws<TransicionDeEstadoInvalidaException>(() =>
            personaje.ComprarArticulo("pista", 15, TipoArticulo.Pista, "pista"));
    }

    [Fact]
    public void UsarPista_ConsumeUnaYRegistraElEvento()
    {
        var personaje = ConAp(40);
        personaje.ComprarArticulo("pista", 15, TipoArticulo.Pista, "pista");
        var misionId = Guid.NewGuid();

        personaje.UsarPista(misionId, 2);

        Assert.Equal(0, personaje.PistasDisponibles);
        var evento = Assert.IsType<PistaUsada>(personaje.EventosNoConfirmados[^1]);
        Assert.Equal(misionId, evento.MisionId);
        Assert.Equal(2, evento.IndicePregunta);
    }

    [Fact]
    public void UsarPista_SinPistas_Lanza()
    {
        var personaje = ConAp(40);

        Assert.Throws<TransicionDeEstadoInvalidaException>(() => personaje.UsarPista(Guid.NewGuid(), 0));
    }

    [Fact]
    public void EquiparUnArticuloNoComprado_Lanza()
    {
        var personaje = ConAp(40);

        Assert.Throws<TransicionDeEstadoInvalidaException>(() =>
            personaje.EquiparArticulo("avatar-x", TipoArticulo.Avatar, "avatar-x"));
    }

    [Fact]
    public void EquiparUnEscudo_Lanza_YNoRegalaEscudosGratis()
    {
        var personaje = ConAp(40);

        Assert.Throws<ArgumentException>(() =>
            personaje.EquiparArticulo("escudo-racha", TipoArticulo.EscudoRacha, "escudo-racha"));
        Assert.Equal(0, personaje.EscudosRachaDisponibles);
    }

    [Fact]
    public void CargarDesdeHistorial_ReconstruyePistasYAp()
    {
        var original = ConAp(100);
        original.ComprarArticulo("pista", 15, TipoArticulo.Pista, "pista");
        original.ComprarArticulo("pista", 15, TipoArticulo.Pista, "pista");
        original.UsarPista(Guid.NewGuid(), 0);

        var reconstruido = Personaje.ParaReconstruccion();
        reconstruido.CargarDesdeHistorial(original.EventosNoConfirmados.ToList());

        Assert.Equal(1, reconstruido.PistasDisponibles);
        Assert.Equal(70, reconstruido.PuntosAccionAP);
    }

    [Fact]
    public void CatalogoBazar_AvataresOficiales_SonExactamenteSiete_SinDuplicados()
    {
        var avatares = CatalogoBazar.Todos.Where(a => a.Tipo == TipoArticulo.Avatar).ToList();

        // Exactamente 7 avatares oficiales (coincidentes 1:1 con la grilla de personalización)
        Assert.Equal(7, avatares.Count);

        // Sin duplicados de identificador ni de nombre
        var idsUnicos = avatares.Select(a => a.Id).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        var nombresUnicos = avatares.Select(a => a.Nombre).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        Assert.Equal(7, idsUnicos.Count);
        Assert.Equal(7, nombresUnicos.Count);

        // Ningún identificador antiguo/duplicado debe estar expuesto en el catálogo
        var idsProhibidos = new[] { "avatar_guerrero", "avatar-explorador", "avatar_mago", "mago_sideral" };
        foreach (var idProhibido in idsProhibidos)
        {
            Assert.DoesNotContain(avatares, a => string.Equals(a.Id, idProhibido, StringComparison.OrdinalIgnoreCase));
        }

        // Cada arquetipo oficial debe estar presente
        var idsEsperados = new[]
        {
            "erudito_arcano",
            "exploradora_reliquias",
            "alquimista_botanica",
            "avatar_arquera",
            "artifice_runico",
            "caballera_astral",
            "archimago_solar"
        };
        foreach (var idEsperado in idsEsperados)
        {
            Assert.Contains(avatares, a => string.Equals(a.Id, idEsperado, StringComparison.OrdinalIgnoreCase));
        }
    }

    [Fact]
    public void CatalogoBazar_MapeoDeAliasesHeredados_ResuelveArquetipoOficial()
    {
        // Aliases heredados resuelven a sus arquetipos oficiales y no colisionan
        Assert.Equal("exploradora_reliquias", CatalogoBazar.Buscar("avatar-explorador")?.Id);
        Assert.Equal("caballera_astral", CatalogoBazar.Buscar("avatar_guerrero")?.Id);
        Assert.Equal("erudito_arcano", CatalogoBazar.Buscar("avatar_mago")?.Id);
        Assert.Equal("archimago_solar", CatalogoBazar.Buscar("mago_sideral")?.Id);
        Assert.Equal("avatar_arquera", CatalogoBazar.Buscar("arquera_silvana")?.Id);
        Assert.Equal("avatar_arquera", CatalogoBazar.Buscar("arquera")?.Id);

        // Arquera y Alquimista son entidades estrictamente independientes
        var arquera = CatalogoBazar.Buscar("avatar_arquera");
        var alquimista = CatalogoBazar.Buscar("alquimista_botanica");
        Assert.NotNull(arquera);
        Assert.NotNull(alquimista);
        Assert.NotEqual(arquera.Id, alquimista.Id);
        Assert.Equal("Arquera Silvana", arquera.Nombre);
        Assert.Equal("Alquimista Botánica", alquimista.Nombre);
    }

    [Fact]
    public void CatalogoBazar_MascotasYConsumibles_CumplenEspecificacionOficial()
    {
        var mascotas = CatalogoBazar.Todos.Where(a => a.Tipo == TipoArticulo.Mascota).ToList();
        Assert.Equal(3, mascotas.Count);
        Assert.All(mascotas, m => Assert.Equal(250, m.CostoAp));
        Assert.Contains(mascotas, m => m.Id == "buho");
        Assert.Contains(mascotas, m => m.Id == "dragon");
        Assert.Contains(mascotas, m => m.Id == "gato");

        var consumibles = CatalogoBazar.Todos.Where(a => a.Tipo is TipoArticulo.Pista or TipoArticulo.EscudoRacha).ToList();
        Assert.Equal(2, consumibles.Count);
        Assert.Equal(15, CatalogoBazar.Buscar("pista")?.CostoAp);
        Assert.Equal(50, CatalogoBazar.Buscar("escudo-racha")?.CostoAp);
    }
}
