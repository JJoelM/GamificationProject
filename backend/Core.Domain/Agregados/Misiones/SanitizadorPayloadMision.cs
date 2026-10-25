using System.Text.Json;
using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Misiones;

/// <summary>
/// Previene trampas y exploits eliminando respuestas correctas, soluciones y explicaciones
/// de los payloads antes de que sean servidos a los alumnos.
/// </summary>
public static class SanitizadorPayloadMision
{
    public static string SanitizarParaAlumno(string tipoPlantilla, string payloadJson)
    {
        if (string.IsNullOrWhiteSpace(payloadJson))
            return "{}";

        try
        {
            return tipoPlantilla switch
            {
                "OpcionMultiple" => SanitizarOpcionMultiple(payloadJson),
                "BatallaDeJefe" => SanitizarBatallaDeJefe(payloadJson),
                "LineaTemporal" => SanitizarLineaTemporal(payloadJson),
                _ => payloadJson,
            };
        }
        catch
        {
            return payloadJson;
        }
    }

    private static string SanitizarOpcionMultiple(string payloadJson)
    {
        var contenido = JsonSerializer.Deserialize<ContenidoOpcionMultiple>(payloadJson, OpcionesJsonMision.Instancia);
        if (contenido?.Preguntas is null)
            return payloadJson;

        var preguntasSanitizadas = contenido.Preguntas.Select(p => new
        {
            enunciado = p.Enunciado,
            opciones = p.Opciones
        });

        return JsonSerializer.Serialize(new { preguntas = preguntasSanitizadas }, OpcionesJsonMision.Instancia);
    }

    private static string SanitizarBatallaDeJefe(string payloadJson)
    {
        var contenido = JsonSerializer.Deserialize<ContenidoBatallaDeJefe>(payloadJson, OpcionesJsonMision.Instancia);
        if (contenido?.Fases is null)
            return payloadJson;

        var fasesSanitizadas = contenido.Fases.Select(f => new
        {
            enunciado = f.Enunciado,
            opciones = f.Opciones,
            danioAlJefe = f.DanioAlJefe,
            penalizacionFallo = f.PenalizacionFallo
        });

        return JsonSerializer.Serialize(new
        {
            nombreJefe = contenido.NombreJefe,
            hpMaximo = contenido.HpMaximo,
            fases = fasesSanitizadas
        }, OpcionesJsonMision.Instancia);
    }

    private static string SanitizarLineaTemporal(string payloadJson)
    {
        var contenido = JsonSerializer.Deserialize<ContenidoLineaTemporal>(payloadJson, OpcionesJsonMision.Instancia);
        if (contenido?.EventosDesordenados is null)
            return payloadJson;

        // Desordenar aleatoriamente para evitar que el orden original del array filtre la solucion
        var eventosSanitizados = contenido.EventosDesordenados
            .OrderBy(_ => Random.Shared.Next())
            .Select(e => new
            {
                id = e.Id,
                descripcion = e.Descripcion
            });

        return JsonSerializer.Serialize(new
        {
            estadoErroneoDescripcion = contenido.EstadoErroneoDescripcion,
            eventosDesordenados = eventosSanitizados
        }, OpcionesJsonMision.Instancia);
    }
}
