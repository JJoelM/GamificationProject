namespace Core.Application.Common;

// El servicio de IA no pudo producir contenido valido (o no respondio). Es un
// problema "de afuera": se responde 502 con un mensaje util para el docente, no un 500 opaco.
public sealed class GeneracionFallidaException : Exception
{
    public GeneracionFallidaException(string mensaje, Exception? causa = null) : base(mensaje, causa) { }
}
