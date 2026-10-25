using System.Text.Encodings.Web;
using System.Text.Json;

namespace Core.Domain.SeedWork;

// Fuente unica de verdad para (de)serializar payloads de Mision. Escribe
// siempre en camelCase (consistente con lo que espera el frontend y con lo
// que ya produce ASP.NET Core para el resto de la API), y lee sin distinguir
// mayusculas de minusculas -- defensa extra contra cualquier JSON que no haya
// pasado por esta clase (fixtures de test, el endpoint de prueba donde el
// payload lo escribe una persona a mano, etc.).
public static class OpcionesJsonMision
{
    public static readonly JsonSerializerOptions Instancia = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };
}
