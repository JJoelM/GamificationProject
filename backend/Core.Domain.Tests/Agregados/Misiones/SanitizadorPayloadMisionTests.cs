using Core.Domain.Agregados.Misiones;
using Xunit;

namespace Core.Domain.Tests.Agregados.Misiones;

public class SanitizadorPayloadMisionTests
{
    [Fact]
    public void Sanitizar_OpcionMultiple_RemueveRespuestasCorrectasYExplicaciones()
    {
        const string payload = """
            {
                "preguntas": [
                    {
                        "enunciado": "¿Qué es la fotosíntesis?",
                        "opciones": ["Conversión de luz", "Digestión"],
                        "respuestaCorrecta": "Conversión de luz",
                        "explicacion": "Las plantas usan clorofila para procesar luz solar."
                    }
                ]
            }
            """;

        var resultado = SanitizadorPayloadMision.SanitizarParaAlumno("OpcionMultiple", payload);

        Assert.DoesNotContain("respuestaCorrecta", resultado);
        Assert.DoesNotContain("explicacion", resultado);
        Assert.DoesNotContain("Las plantas usan clorofila", resultado);
        Assert.Contains("¿Qué es la fotosíntesis?", resultado);
        Assert.Contains("Conversión de luz", resultado);
    }

    [Fact]
    public void Sanitizar_BatallaDeJefe_RemueveRespuestasCorrectasYExplicaciones()
    {
        const string payload = """
            {
                "nombreJefe": "Bug Gigante",
                "hpMaximo": 150,
                "fases": [
                    {
                        "enunciado": "¿Qué hace null pointer?",
                        "opciones": ["Apunta a nada", "Es un tipo"],
                        "respuestaCorrecta": "Apunta a nada",
                        "explicacion": "Null indica ausencia de referencia.",
                        "danioAlJefe": 50,
                        "penalizacionFallo": "temblor"
                    }
                ]
            }
            """;

        var resultado = SanitizadorPayloadMision.SanitizarParaAlumno("BatallaDeJefe", payload);

        Assert.DoesNotContain("respuestaCorrecta", resultado);
        Assert.DoesNotContain("explicacion", resultado);
        Assert.DoesNotContain("Null indica ausencia", resultado);
        Assert.Contains("Bug Gigante", resultado);
        Assert.Contains("danioAlJefe", resultado);
        Assert.Contains("temblor", resultado);
    }

    [Fact]
    public void Sanitizar_LineaTemporal_RemueveOrdenCorrectoCulpableYExplicacion()
    {
        const string payload = """
            {
                "estadoErroneoDescripcion": "La base de datos se cayó por deadlock.",
                "eventosDesordenados": [
                    { "id": "ev1", "descripcion": "Transacción 1 toma Lock A", "ordenCorrecto": 1 },
                    { "id": "ev2", "descripcion": "Transacción 2 toma Lock B", "ordenCorrecto": 2 },
                    { "id": "ev3", "descripcion": "Transacción 1 pide Lock B sin soltar A", "ordenCorrecto": 3 }
                ],
                "eventoCulpableId": "ev3",
                "explicacion": "El bloqueo cruzado causó el deadlock fatal."
            }
            """;

        var resultado = SanitizadorPayloadMision.SanitizarParaAlumno("LineaTemporal", payload);

        Assert.DoesNotContain("ordenCorrecto", resultado);
        Assert.DoesNotContain("eventoCulpableId", resultado);
        Assert.DoesNotContain("eventoCulpable", resultado);
        Assert.DoesNotContain("explicacion", resultado);
        Assert.DoesNotContain("bloqueo cruzado causó el deadlock", resultado);
        Assert.Contains("La base de datos se cayó por deadlock.", resultado);
        Assert.Contains("Transacción 1 toma Lock A", resultado);
        Assert.Contains("ev1", resultado);
        Assert.Contains("ev2", resultado);
        Assert.Contains("ev3", resultado);
    }
}
