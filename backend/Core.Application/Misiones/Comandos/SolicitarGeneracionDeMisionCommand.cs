using System.Text.Json;
using Core.Application.Common;
using Core.Domain.Agregados.Misiones;
using MediatR;

namespace Core.Application.Misiones.Comandos;

public sealed record SolicitarGeneracionDeMisionCommand(
    Guid DocenteId, Guid AulaId, string TemaCurricular, string TextoFuente) : IRequest<Guid>;

public sealed class SolicitarGeneracionDeMisionCommandHandler
    : IRequestHandler<SolicitarGeneracionDeMisionCommand, Guid>
{
    // Gemini no devuelve un puntaje de confianza propio via structured output
    // -- fijo un valor provisorio en vez de fingir precisión que no existe.
    // El docente lo recalibra en la práctica al revisar (aprobar/editar/rechazar).
    private const int NivelConfianzaProvisorio = 70;

    // El payload se guarda como string en la BD y viaja opaco dentro del JSON
    // de la API -- System.Text.Json por defecto usa PascalCase, pero el
    // frontend (y Mision.Calificar con PropertyNameCaseInsensitive=true) espera
    // camelCase. Hay que pedirlo explícitamente aquí, en el único lugar donde
    // se genera el string que terminará en la BD.
    private static readonly JsonSerializerOptions OpcionesCamelCase = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly IGeneradorDeMisiones _generador;
    private readonly IRepositorioMisiones _repositorio;

    public SolicitarGeneracionDeMisionCommandHandler(
        IGeneradorDeMisiones generador, IRepositorioMisiones repositorio)
    {
        _generador = generador;
        _repositorio = repositorio;
    }

    public async Task<Guid> Handle(SolicitarGeneracionDeMisionCommand request, CancellationToken cancellationToken)
    {
        var contenido = await _generador.GenerarAsync(request.TemaCurricular, request.TextoFuente, cancellationToken);

        // Traduce del shape de Application (lo que devuelve el microservicio)
        // al shape que Mision.Calificar espera deserializar -- son tipos
        // distintos a propósito: el dominio no debería conocer el contrato
        // HTTP con Python, y Application no debería conocer los detalles de
        // cómo el dominio califica una OpcionMultiple.
        var payload = new ContenidoOpcionMultiple(
            contenido.Preguntas
                .Select(p => new PreguntaOpcionMultiple(p.Enunciado, p.Opciones, p.RespuestaCorrecta, p.Explicacion))
                .ToList());

        var payloadJson = JsonSerializer.Serialize(payload, OpcionesCamelCase);

        // 20 XP por pregunta generada: es una fórmula simple y determinística,
        // no un número mágico -- fácil de justificar y de recalibrar en la defensa.
        var recompensaXp = payload.Preguntas.Count * 20;

        var mision = Mision.Generar(
            request.DocenteId, request.AulaId, request.TemaCurricular, request.TextoFuente,
            contenido.Narrativa, "OpcionMultiple", payloadJson,
            NivelConfianzaProvisorio, recompensaXp);

        await _repositorio.GuardarAsync(mision, cancellationToken);

        return mision.Id;
    }
}
