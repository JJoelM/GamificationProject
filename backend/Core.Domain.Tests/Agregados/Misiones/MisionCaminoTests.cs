using Core.Domain.Agregados.Misiones;
using Core.Domain.SeedWork;
using Xunit;

namespace Core.Domain.Tests.Agregados.Misiones;

public class MisionCaminoTests
{
    private const string PayloadOpcionMultiple =
        """{"preguntas":[{"enunciado":"q","opciones":["A","B","C","D"],"respuestaCorrecta":"A","explicacion":"e"}]}""";

    private static readonly Guid Docente = Guid.NewGuid();

    private static Mision CrearMision(string tipo = "OpcionMultiple", string? payload = null) =>
        Mision.Generar(Docente, Guid.NewGuid(), "Tema", "Texto", "Narrativa", tipo,
            payload ?? PayloadOpcionMultiple, 80, 60);

    // ----- Pistas -----

    [Fact]
    public void ObtenerOpcionADescartar_NuncaDevuelveLaCorrecta()
    {
        var mision = CrearMision();

        var opcion = mision.ObtenerOpcionADescartar(0, Array.Empty<string>());

        Assert.NotEqual("A", opcion);
        Assert.Contains(opcion, new[] { "B", "C", "D" });
    }

    [Fact]
    public void ObtenerOpcionADescartar_NoDejaMenosDeDosOpciones()
    {
        var mision = CrearMision();

        var primera = mision.ObtenerOpcionADescartar(0, Array.Empty<string>());
        var segunda = mision.ObtenerOpcionADescartar(0, new[] { primera });

        Assert.NotEqual(primera, segunda);
        Assert.NotEqual("A", segunda);
        Assert.Throws<TransicionDeEstadoInvalidaException>(() =>
            mision.ObtenerOpcionADescartar(0, new[] { primera, segunda }));
    }

    [Fact]
    public void ObtenerOpcionADescartar_PreguntaInexistente_Lanza()
    {
        var mision = CrearMision();

        Assert.Throws<ArgumentOutOfRangeException>(() => mision.ObtenerOpcionADescartar(5, Array.Empty<string>()));
    }

    [Fact]
    public void ObtenerOpcionADescartar_LineaTemporalNoAdmitePistas()
    {
        var mision = CrearMision("LineaTemporal", "{}");

        Assert.Throws<TransicionDeEstadoInvalidaException>(() =>
            mision.ObtenerOpcionADescartar(0, Array.Empty<string>()));
    }

    // ----- Ocultar / republicar / editar -----

    [Fact]
    public void Ocultar_SoloDesdeValidada()
    {
        var mision = CrearMision();

        Assert.Throws<TransicionDeEstadoInvalidaException>(() => mision.Ocultar(Docente));

        mision.Validar(Docente);
        mision.Ocultar(Docente);
        Assert.Equal(EstadoMision.Oculta, mision.Estado);
    }

    [Fact]
    public void Republicar_SoloDesdeOculta()
    {
        var mision = CrearMision();
        mision.Validar(Docente);

        Assert.Throws<TransicionDeEstadoInvalidaException>(() => mision.Republicar(Docente));

        mision.Ocultar(Docente);
        mision.Republicar(Docente);
        Assert.Equal(EstadoMision.Validada, mision.Estado);
    }

    [Fact]
    public void Editar_UnaMisionYaValidada_EsValido()
    {
        var mision = CrearMision();
        mision.Validar(Docente);

        mision.Editar(Docente, "Narrativa nueva", PayloadOpcionMultiple, 30);

        Assert.Equal(EstadoMision.Validada, mision.Estado);
        Assert.Equal("Narrativa nueva", mision.Narrativa);
    }

    [Fact]
    public void Editar_UnaMisionRechazada_Lanza()
    {
        var mision = CrearMision();
        mision.Rechazar(Docente, "No sirve");

        Assert.Throws<TransicionDeEstadoInvalidaException>(() =>
            mision.Editar(Docente, "Narrativa nueva", PayloadOpcionMultiple, 30));
    }

    [Fact]
    public void Validar_UnaMisionYaValidada_Lanza()
    {
        var mision = CrearMision();
        mision.Validar(Docente);

        Assert.Throws<TransicionDeEstadoInvalidaException>(() => mision.Validar(Docente));
    }

    // ----- Misiones sugeridas -----

    [Fact]
    public void DefinirMisionesSugeridas_NoPuedeSugerirseASiMisma()
    {
        var mision = CrearMision();

        Assert.Throws<ArgumentException>(() =>
            mision.DefinirMisionesSugeridas(Docente, new[] { mision.Id }));
    }

    [Fact]
    public void DefinirMisionesSugeridas_NormalizaDuplicados()
    {
        var mision = CrearMision();
        var destino = Guid.NewGuid();

        mision.DefinirMisionesSugeridas(Docente, new[] { destino, destino });

        Assert.Single(mision.MisionesSugeridas);
    }

    [Fact]
    public void DefinirMisionesSugeridas_RespetaElMaximo()
    {
        var mision = CrearMision();
        var demasiadas = Enumerable.Range(0, Mision.MaxMisionesSugeridas + 1).Select(_ => Guid.NewGuid());

        Assert.Throws<ArgumentException>(() => mision.DefinirMisionesSugeridas(Docente, demasiadas));
    }

    [Fact]
    public void DefinirMisionesSugeridas_SinCambios_NoEmiteEventoNuevo()
    {
        var mision = CrearMision();
        var destino = Guid.NewGuid();
        mision.DefinirMisionesSugeridas(Docente, new[] { destino });
        var cantidad = mision.EventosNoConfirmados.Count;

        mision.DefinirMisionesSugeridas(Docente, new[] { destino });

        Assert.Equal(cantidad, mision.EventosNoConfirmados.Count);
    }

    [Fact]
    public void CargarDesdeHistorial_ReconstruyeEstadoOcultoYSugerencias()
    {
        var original = CrearMision();
        var destino = Guid.NewGuid();
        original.Validar(Docente);
        original.DefinirMisionesSugeridas(Docente, new[] { destino });
        original.Ocultar(Docente);

        var reconstruida = Mision.ParaReconstruccion();
        reconstruida.CargarDesdeHistorial(original.EventosNoConfirmados.ToList());

        Assert.Equal(EstadoMision.Oculta, reconstruida.Estado);
        Assert.Equal(destino, Assert.Single(reconstruida.MisionesSugeridas));
    }
}

public class CaminoGrafoTests
{
    private static readonly Guid A = Guid.NewGuid();
    private static readonly Guid B = Guid.NewGuid();
    private static readonly Guid C = Guid.NewGuid();
    private static readonly Guid D = Guid.NewGuid();

    [Fact]
    public void CalcularNiveles_Cadena()
    {
        var niveles = CaminoGrafo.CalcularNiveles(new[] { A, B, C }, new[] { (A, B), (B, C) });

        Assert.Equal(0, niveles[A]);
        Assert.Equal(1, niveles[B]);
        Assert.Equal(2, niveles[C]);
    }

    [Fact]
    public void CalcularNiveles_Diamante_UsaElCaminoMasLargo()
    {
        var niveles = CaminoGrafo.CalcularNiveles(
            new[] { A, B, C, D }, new[] { (A, B), (A, C), (B, D), (C, D) });

        Assert.Equal(2, niveles[D]);
    }

    [Fact]
    public void CalcularNiveles_NodoSuelto_EsNivelCero()
    {
        var niveles = CaminoGrafo.CalcularNiveles(new[] { A, B }, Array.Empty<(Guid, Guid)>());

        Assert.Equal(0, niveles[A]);
        Assert.Equal(0, niveles[B]);
    }

    [Fact]
    public void GeneraCiclo_DetectaElCierreDelCamino()
    {
        // B -> C -> A existe; definir A -> B cierra el ciclo.
        Assert.True(CaminoGrafo.GeneraCiclo(A, new[] { B }, new[] { (B, C), (C, A) }));
    }

    [Fact]
    public void GeneraCiclo_SinCamino_DevuelveFalse()
    {
        Assert.False(CaminoGrafo.GeneraCiclo(A, new[] { D }, new[] { (B, C) }));
    }
}
