namespace Core.Application.Common;

// Vive en Application, igual que IRepositorioMisiones vive en Domain: es un
// contrato que Application necesita, sin saber que la implementación real
// hace una llamada HTTP a un servicio en Python.
public interface IGeneradorDeMisiones
{
    Task<ContenidoGeneradoPorIA> GenerarAsync(string temaCurricular, string textoFuente, CancellationToken ct = default);
}

public sealed record PreguntaGenerada(string Enunciado, List<string> Opciones, string RespuestaCorrecta, string Explicacion);

public sealed record ContenidoGeneradoPorIA(string Narrativa, List<PreguntaGenerada> Preguntas);
