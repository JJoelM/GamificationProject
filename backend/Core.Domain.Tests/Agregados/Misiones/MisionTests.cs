using Core.Domain.Agregados.Misiones;
using Core.Domain.Agregados.Misiones.Eventos;
using Core.Domain.SeedWork;
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
    public void Editar_UnaMisionRechazada_Lanza()
    {
        var mision = CrearMisionValida();
        mision.Rechazar(Guid.NewGuid(), "No cumple requisitos");

        Assert.Throws<TransicionDeEstadoInvalidaException>(() =>
            mision.Editar(Guid.NewGuid(), "Otra narrativa", "{}", 50));
    }

    [Fact]
    public void Validar_UnaMisionYaValidada_Lanza()
    {
        var mision = CrearMisionValida();
        mision.Validar(Guid.NewGuid());

        Assert.Throws<TransicionDeEstadoInvalidaException>(() => mision.Validar(Guid.NewGuid()));
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

    [Fact]
    public void Calificar_BatallaDeJefe_ReutilizaLaMismaLogicaQueOpcionMultiple()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "BatallaDeJefe",
            payloadJson: """
                {"nombreJefe":"El Bug Ancestral","hpMaximo":100,"fases":[
                    {"enunciado":"¿Qué es un JOIN?","opciones":["Union de tablas","Un tipo de dato"],"respuestaCorrecta":"Union de tablas","explicacion":"Combina filas de dos tablas.","danioAlJefe":50,"penalizacionFallo":"temblor"},
                    {"enunciado":"¿Qué es una FK?","opciones":["Clave foránea","Una funcion"],"respuestaCorrecta":"Clave foránea","explicacion":"Referencia a otra tabla.","danioAlJefe":50,"penalizacionFallo":"destello"}
                ]}
                """,
            nivelConfianzaIA: 85, recompensaXpSugerida: 100);
        mision.Validar(Guid.NewGuid());

        var resultado = mision.Calificar(new List<RespuestaAlumno> { new(0, "Union de tablas"), new(1, "Clave foránea") });

        Assert.Equal(100, resultado.PorcentajeCorrecto);
        Assert.Equal(2, resultado.TotalPreguntas);
    }

    [Fact]
    public void CalificarOrdenTemporal_ConOrdenYCulpableCorrectos_Da100PorCiento()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "LineaTemporal",
            payloadJson: """
                {"estadoErroneoDescripcion":"El saldo del usuario quedó negativo.",
                 "eventosDesordenados":[
                    {"id":"ev1","descripcion":"Se crea la cuenta","ordenCorrecto":1},
                    {"id":"ev2","descripcion":"Se deposita dinero","ordenCorrecto":2},
                    {"id":"ev3","descripcion":"Se retira sin validar saldo","ordenCorrecto":3}
                 ],
                 "eventoCulpableId":"ev3",
                 "explicacion":"Faltó validar el saldo antes de retirar."}
                """,
            nivelConfianzaIA: 85, recompensaXpSugerida: 100);
        mision.Validar(Guid.NewGuid());

        var resultado = mision.CalificarOrdenTemporal(
            new RespuestaOrdenTemporal(new List<string> { "ev1", "ev2", "ev3" }, "ev3"));

        Assert.Equal(100, resultado.PorcentajeCorrecto);
        Assert.True(resultado.CulpableIdentificadoCorrectamente);
        Assert.Equal(new List<string> { "ev1", "ev2", "ev3" }, resultado.OrdenCorrecto);
        Assert.Equal("ev3", resultado.EventoCulpableId);
    }

    [Fact]
    public void CalificarOrdenTemporal_ConOrdenCorrectoPeroCulpableEquivocado_PierdeSoloElTreintaPorCiento()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "LineaTemporal",
            payloadJson: """
                {"estadoErroneoDescripcion":"desc",
                 "eventosDesordenados":[
                    {"id":"ev1","descripcion":"a","ordenCorrecto":1},
                    {"id":"ev2","descripcion":"b","ordenCorrecto":2}
                 ],
                 "eventoCulpableId":"ev2",
                 "explicacion":"exp"}
                """,
            nivelConfianzaIA: 85, recompensaXpSugerida: 100);

        var resultado = mision.CalificarOrdenTemporal(
            new RespuestaOrdenTemporal(new List<string> { "ev1", "ev2" }, "ev1")); // culpable mal elegido

        Assert.Equal(70, resultado.PorcentajeCorrecto); // 100% de orden * 0.7, sin el bonus de 30
        Assert.False(resultado.CulpableIdentificadoCorrectamente);
    }

    [Fact]
    public void CalificarOrdenTemporal_ConIdsRepetidos_NoSumaDosVeces()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "LineaTemporal",
            payloadJson: """
                {"estadoErroneoDescripcion":"desc",
                 "eventosDesordenados":[
                    {"id":"ev1","descripcion":"a","ordenCorrecto":1},
                    {"id":"ev2","descripcion":"b","ordenCorrecto":2}
                 ],
                 "eventoCulpableId":"ev2",
                 "explicacion":"exp"}
                """,
            nivelConfianzaIA: 85, recompensaXpSugerida: 100);

        var resultado = mision.CalificarOrdenTemporal(
            new RespuestaOrdenTemporal(new List<string> { "ev1", "ev1" }, "ev1"));

        Assert.Equal(35, resultado.PorcentajeCorrecto); // 1 de 2 posiciones (50%) * 0.7, sin culpable
    }

    [Fact]
    public void Calificar_UnaMisionLineaTemporal_NoSePuedeCalificarConElMetodoDeOpcionMultiple()
    {
        var mision = Mision.Generar(
            Guid.NewGuid(), Guid.NewGuid(), "Tema", "Texto", "Narrativa", "LineaTemporal",
            payloadJson: "{}", nivelConfianzaIA: 85, recompensaXpSugerida: 100);

        Assert.Throws<NotSupportedException>(() => mision.Calificar(new List<RespuestaAlumno>()));
    }

    [Fact]
    public void CalificarOrdenTemporal_EnUnaMisionDeOtroTipo_Lanza()
    {
        var mision = CrearMisionValida(); // OpcionMultiple

        Assert.Throws<NotSupportedException>(() =>
            mision.CalificarOrdenTemporal(new RespuestaOrdenTemporal(new List<string>(), "ev1")));
    }

    [Fact]
    public void OcultarYRepublicar_CambianElEstadoCorrectamente()
    {
        var mision = CrearMisionValida();
        var docenteId = Guid.NewGuid();
        mision.Validar(docenteId);
        Assert.Equal(EstadoMision.Validada, mision.Estado);

        mision.Ocultar(docenteId);
        Assert.Equal(EstadoMision.Oculta, mision.Estado);

        mision.Republicar(docenteId);
        Assert.Equal(EstadoMision.Validada, mision.Estado);
    }

    [Fact]
    public void Ocultar_UnaMisionNoValidada_LanzaInvalidOperationException()
    {
        var mision = CrearMisionValida(); // Generada
        Assert.Throws<TransicionDeEstadoInvalidaException>(() => mision.Ocultar(Guid.NewGuid()));
    }
}
