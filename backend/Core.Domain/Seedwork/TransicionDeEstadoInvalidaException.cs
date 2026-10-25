namespace Core.Domain.SeedWork;

// Excepción propia para transiciones inválidas del dominio (máquina de estados,
// AP insuficientes, artículo ya comprado, etc.). Separa "conflicto de negocio"
// (409) de InvalidOperationException genérica de .NET (500), que puede venir
// de LINQ, DI, reflexión u otros errores técnicos.
public sealed class TransicionDeEstadoInvalidaException : Exception
{
    public TransicionDeEstadoInvalidaException(string mensaje) : base(mensaje) { }
}
