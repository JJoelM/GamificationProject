using Core.Domain.Agregados.Misiones;

namespace Core.Application.Common;

// PayloadJson ya viene en el formato del dominio (camelCase, OpcionesJsonMision).
// CantidadDeElementos = preguntas / fases / eventos, sirve para calcular la recompensa.
public sealed record ContenidoGeneradoPorIA(string Narrativa, string PayloadJson, int CantidadDeElementos);

public interface IGeneradorDeMisiones
{
    Task<ContenidoGeneradoPorIA> GenerarAsync(
        TipoPlantilla tipo, string temaCurricular, string textoFuente, CancellationToken ct = default);
}
