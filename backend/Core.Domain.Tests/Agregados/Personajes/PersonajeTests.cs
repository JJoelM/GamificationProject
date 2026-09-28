using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;
using Xunit;

namespace Core.Domain.Tests.Agregados.Personajes;

public class PersonajeTests
{
    private static readonly Guid MisionId = Guid.NewGuid();
    private static readonly DateOnly Hoy = new(2026, 8, 28);

    [Fact]
    public void Iniciar_ConElMismoAlumnoYAula_DaSiempreElMismoId()
    {
        var alumnoId = Guid.NewGuid();
        var aulaId = Guid.NewGuid();

        var p1 = Personaje.Iniciar(alumnoId, aulaId);
        var p2 = Personaje.Iniciar(alumnoId, aulaId);

        Assert.Equal(p1.Id, p2.Id);
    }

    [Fact]
    public void Iniciar_MismoAlumnoEnDosAulasDistintas_DaIdsDistintos()
    {
        var alumnoId = Guid.NewGuid();

        var enAulaA = Personaje.Iniciar(alumnoId, Guid.NewGuid());
        var enAulaB = Personaje.Iniciar(alumnoId, Guid.NewGuid());

        Assert.NotEqual(enAulaA.Id, enAulaB.Id);
    }

    [Fact]
    public void PrimeraResolucion_ConCienPorCientoCorrecto_DaLaRecompensaCompleta()
    {
        var personaje = Personaje.Iniciar(Guid.NewGuid(), Guid.NewGuid());

        personaje.RegistrarResolucionDeMision(MisionId, 100, 0, 100, Hoy);

        Assert.Equal(100, personaje.ExperienciaXP);
        Assert.Equal(1, personaje.RachaDiasActivos);
    }

    [Fact]
    public void ResolverDiezMisionesDistintasElMismoDia_NingunaPenalizaALasOtras()
    {
        var personaje = Personaje.Iniciar(Guid.NewGuid(), Guid.NewGuid());

        for (var i = 0; i < 10; i++)
            personaje.RegistrarResolucionDeMision(Guid.NewGuid(), 100, 0, 100, Hoy);

        Assert.Equal(1000, personaje.ExperienciaXP);
    }

    [Fact]
    public void RepetirLaMismaMision_AplicaElMultiplicadorDeRepeticion_SinImportarElDia()
    {
        var personaje = Personaje.Iniciar(Guid.NewGuid(), Guid.NewGuid());

        personaje.RegistrarResolucionDeMision(MisionId, 100, 0, 100, Hoy);
        personaje.RegistrarResolucionDeMision(MisionId, 100, 0, 100, Hoy.AddDays(5));
        personaje.RegistrarResolucionDeMision(MisionId, 100, 0, 100, Hoy.AddDays(10));
        personaje.RegistrarResolucionDeMision(MisionId, 100, 0, 100, Hoy.AddDays(15));

        Assert.Equal(100 + 50 + 10 + 0, personaje.ExperienciaXP);
    }

    [Fact]
    public void RachaDiasActivos_SeCortaSiHayUnSaltoDeMasDeUnDia()
    {
        var personaje = Personaje.Iniciar(Guid.NewGuid(), Guid.NewGuid());
        personaje.RegistrarResolucionDeMision(Guid.NewGuid(), 100, 0, 100, Hoy);
        personaje.RegistrarResolucionDeMision(Guid.NewGuid(), 100, 0, 100, Hoy.AddDays(1));
        Assert.Equal(2, personaje.RachaDiasActivos);

        personaje.RegistrarResolucionDeMision(Guid.NewGuid(), 100, 0, 100, Hoy.AddDays(4));

        Assert.Equal(1, personaje.RachaDiasActivos);
    }

    [Fact]
    public void CargarDesdeHistorial_ReconstruyeIdAlumnoIdYAulaId()
    {
        var alumnoId = Guid.NewGuid();
        var aulaId = Guid.NewGuid();
        var original = Personaje.Iniciar(alumnoId, aulaId);
        original.RegistrarResolucionDeMision(MisionId, 100, 0, 100, Hoy);

        var reconstruido = Personaje.ParaReconstruccion();
        reconstruido.CargarDesdeHistorial(original.EventosNoConfirmados.ToList());

        Assert.Equal(original.Id, reconstruido.Id);
        Assert.Equal(alumnoId, reconstruido.AlumnoId);
        Assert.Equal(aulaId, reconstruido.AulaId);
        Assert.Equal(IdentidadCompuesta.Combinar(alumnoId, aulaId), reconstruido.Id);
    }
}