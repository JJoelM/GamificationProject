using System.Text.Json.Serialization;

namespace Core.Domain.Entidades;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EstadoCuenta
{
    Activa,
    PendienteDeAprobacion,
    Suspendida,
    Eliminada
}
