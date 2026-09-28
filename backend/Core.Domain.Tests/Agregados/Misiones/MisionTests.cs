using Core.Domain.Agregados.Misiones;
using Core.Domain.Agregados.Misiones.Eventos;
using Xunit;

namespace Core.Domain.Tests.Agregados.Misiones;

public class MisionTests
{
    private static Mision CrearMisionValida() =>
        Mision.Generar(
            docenteId: Guid.NewGuid(),
            aulaId: Guid.NewGuid(),
            temaCurricular: "Fotosíntesis",
            textoFuente: "Las plantas convierten luz solar en glucosa y oxígeno...",
            narrativa: "Un explorador botánico debe identificar el proceso vital de una planta misteriosa.",
            tipoPlantilla: "OpcionMultiple",
            payloadJson: """{"preguntas":[]}""",
            nivelConfianzaIA: 85,
            recompensaXpSugerida: 50);

    [Fact]
    public void Generar_CreaLaMisionEnEstadoGenerada()
    {
        var mision = CrearMisionValida();

        Assert.Equal(EstadoMision.Generada, mision.Estado);
        Assert.Equal(0, mision.Version);
        Assert.Single(mision.EventosNoConfirmados);
        Assert.IsType<MisionGenerada>(mision.EventosNoConfirmados[0]);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public void Generar_ConNivelDeConfianzaFueraDeRango_Lanza(int nivelInvalido)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            Mision.Generar(Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa",
                "OpcionMultiple", "{}", nivelInvalido, 50));
    }

    [Fact]
    public void Editar_MientrasEstaGenerada_ActualizaElContenidoSinCambiarElEstado()
    {
        var mision = CrearMisionValida();

        mision.Editar(Guid.NewGuid(), "Narrativa corregida", """{"preguntas":["nueva"]}""", 75);

        Assert.Equal("Narrativa corregida", mision.Narrativa);
        Assert.Equal(75, mision.RecompensaXp);
        Assert.Equal(EstadoMision.Generada, mision.Estado);
    }

    [Fact]
    public void Editar_ConNarrativaVacia_Lanza()
    {
        var mision = CrearMisionValida();

        Assert.Throws<ArgumentException>(() =>
            mision.Editar(Guid.NewGuid(), narrativa: "   ", payloadJson: "{}", recompensaXp: 50));
    }

    [Fact]
    public void Editar_UnaMisionYaValidada_Lanza()
    {
        var mision = CrearMisionValida();
        mision.Validar(Guid.NewGuid());

        Assert.Throws<InvalidOperationException>(() =>
            mision.Editar(Guid.NewGuid(), "Otra narrativa", "{}", 50));
    }

    [Fact]
    public void Validar_UnaMisionYaValidada_Lanza()
    {
        var mision = CrearMisionValida();
        mision.Validar(Guid.NewGuid());

        Assert.Throws<InvalidOperationException>(() => mision.Validar(Guid.NewGuid()));
    }

    [Fact]
    public void Rechazar_SinMotivo_Lanza()
    {
        var mision = CrearMisionValida();

        Assert.Throws<ArgumentException>(() => mision.Rechazar(Guid.NewGuid(), motivo: ""));
    }

    [Fact]
    public void Rechazar_ConMotivo_CambiaEstadoYQuedaElMotivoAuditado()
    {
        var mision = CrearMisionValida();
        const string motivo = "El contenido generado no coincide con el material fuente.";

        mision.Rechazar(Guid.NewGuid(), motivo);

        Assert.Equal(EstadoMision.Rechazada, mision.Estado);
        var evento = Assert.IsType<MisionRechazada>(mision.EventosNoConfirmados[^1]);
        Assert.Equal(motivo, evento.Motivo);
    }

    [Fact]
    public void Calificar_ConTodasLasRespuestasCorrectas_Da100PorCiento()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "OpcionMultiple",
            payloadJson: """{"preguntas":[{"enunciado":"1+1","opciones":["1","2"],"respuestaCorrecta":"2","explicacion":"1+1 es 2."},{"enunciado":"2+2","opciones":["3","4"],"respuestaCorrecta":"4","explicacion":"2+2 es 4."}]}""",
            nivelConfianzaIA: 90, recompensaXpSugerida: 100);
        mision.Validar(Guid.NewGuid());

        var respuestas = new List<RespuestaAlumno> { new(0, "2"), new(1, "4") };

        var resultado = mision.Calificar(respuestas);

        Assert.Equal(100, resultado.PorcentajeCorrecto);
        Assert.Equal(2, resultado.RespuestasCorrectas);
        Assert.Equal(2, resultado.TotalPreguntas);
    }

    [Fact]
    public void Calificar_ConUnaDeDosCorrectas_Da50PorCiento()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "OpcionMultiple",
            payloadJson: """{"preguntas":[{"enunciado":"1+1","opciones":["1","2"],"respuestaCorrecta":"2","explicacion":"1+1 es 2."},{"enunciado":"2+2","opciones":["3","4"],"respuestaCorrecta":"4","explicacion":"2+2 es 4."}]}""",
            nivelConfianzaIA: 90, recompensaXpSugerida: 100);

        var respuestas = new List<RespuestaAlumno> { new(0, "2"), new(1, "3") };

        var resultado = mision.Calificar(respuestas);

        Assert.Equal(50, resultado.PorcentajeCorrecto);
    }

    [Fact]
    public void Calificar_DevuelveLaExplicacionDeCadaPreguntaEnElFeedback()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "OpcionMultiple",
            payloadJson: """{"preguntas":[{"enunciado":"1+1","opciones":["1","2"],"respuestaCorrecta":"2","explicacion":"Porque 1+1 es 2."}]}""",
            nivelConfianzaIA: 90, recompensaXpSugerida: 100);

        var resultado = mision.Calificar(new List<RespuestaAlumno> { new(0, "1") }); // respuesta incorrecta

        var feedback = Assert.Single(resultado.Feedback);
        Assert.False(feedback.EsCorrecta);
        Assert.Equal("2", feedback.RespuestaCorrecta);
        Assert.Equal("Porque 1+1 es 2.", feedback.Explicacion); // el feedback llega aunque la respuesta esté mal
    }

    [Fact]
    public void Calificar_UnTipoDePlantillaNoSoportado_Lanza()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "TipoFuturoSinImplementar",
            payloadJson: "{}", nivelConfianzaIA: 90, recompensaXpSugerida: 100);

        Assert.Throws<NotSupportedException>(() => mision.Calificar(new List<RespuestaAlumno>()));
    }

    [Fact]
    public void FlujoCompleto_GenerarEditarDosVecesYValidar_PreservaTodoElHistorial()
    {
        var mision = CrearMisionValida();

        mision.Editar(Guid.NewGuid(), "Primera corrección", """{"v":1}""", 60);
        mision.Editar(Guid.NewGuid(), "Segunda corrección", """{"v":2}""", 70);
        mision.Validar(Guid.NewGuid());

        // El estado final refleja la ÚLTIMA edición, no lo que generó la IA originalmente.
        Assert.Equal("Segunda corrección", mision.Narrativa);
        Assert.Equal(70, mision.RecompensaXp);
        Assert.Equal(EstadoMision.Validada, mision.Estado);

        // Las tres intervenciones humanas (2 ediciones + 1 validación) quedan
        // como hechos separados, no colapsadas en un único estado final --
        // esto es lo que se muestra en la defensa como evidencia de HITL real.
        Assert.Equal(4, mision.EventosNoConfirmados.Count); // Generada + 2×Editada + Validada
        Assert.Equal(3, mision.Version);
    }

    [Fact]
    public void CargarDesdeHistorial_ReconstruyeElMismoEstadoSinPasarPorLosComandos()
    {
        var original = CrearMisionValida();
        original.Editar(Guid.NewGuid(), "Corrección", """{"v":1}""", 65);
        original.Validar(Guid.NewGuid());

        var historial = original.EventosNoConfirmados.ToList();

        var reconstruida = Mision.ParaReconstruccion();
        reconstruida.CargarDesdeHistorial(historial);

        Assert.Equal(original.Id, reconstruida.Id);
        Assert.Equal(original.Estado, reconstruida.Estado);
        Assert.Equal(original.Narrativa, reconstruida.Narrativa);
        Assert.Equal(original.RecompensaXp, reconstruida.RecompensaXp);
        Assert.Equal(original.Version, reconstruida.Version);
        Assert.Empty(reconstruida.EventosNoConfirmados); // reconstruir no genera eventos nuevos
    }
}
