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
}
