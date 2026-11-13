using Core.Application.Common;
using Core.Application.Misiones.Proyecciones;
using Core.Domain.Agregados.Misiones;
using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Personajes.Comandos;

public sealed record ResolverMisionCommand(
    Guid MisionId,
    Guid AlumnoId,
    IReadOnlyList<RespuestaAlumno> Respuestas,
    DateOnly Fecha) : IRequest<ResultadoResolucion>;

public sealed record ResultadoResolucion(
    int PorcentajeCorrecto, int XpGanado, int ApGanado, bool EsRepaso, List<FeedbackPregunta> Feedback);

public sealed class ResolverMisionCommandHandler : IRequestHandler<ResolverMisionCommand, ResultadoResolucion>
{
    private readonly IRepositorioMisiones _repositorioMisiones;
    private readonly IRepositorioPersonajes _repositorioPersonajes;
    private readonly IApplicationDbContext _db;

    public ResolverMisionCommandHandler(
        IRepositorioMisiones repositorioMisiones, IRepositorioPersonajes repositorioPersonajes, IApplicationDbContext db)
    {
        _repositorioMisiones = repositorioMisiones;
        _repositorioPersonajes = repositorioPersonajes;
        _db = db;
    }

    public async Task<ResultadoResolucion> Handle(ResolverMisionCommand request, CancellationToken cancellationToken)
    {
        if (request.Respuestas.Count > 200)
            throw new ArgumentException("La cantidad de respuestas excede el máximo permitido.", nameof(request.Respuestas));

        var mision = await _repositorioMisiones.ObtenerPorIdAsync(request.MisionId, cancellationToken)
            ?? throw new AgregadoNoEncontradoException(nameof(Mision), request.MisionId);

        if (mision.Estado != EstadoMision.Validada)
            throw new TransicionDeEstadoInvalidaException(
                $"No se puede resolver una misión en estado '{mision.Estado}'. Solo las misiones Validadas están disponibles.");

        // La verificación que faltaba: sin esto, cualquier alumno autenticado
        // podía resolver una misión de un Aula a la que nunca fue invitado.
        var estaInscripto = await _db.Inscripciones
            .AnyAsync(i => i.AulaId == mision.AulaId && i.AlumnoId == request.AlumnoId, cancellationToken);
        if (!estaInscripto)
            throw new UnauthorizedAccessException("No estás inscripto en el Aula de esta misión.");

        var resultado = mision.Calificar(request.Respuestas);

        var personajeId = IdentidadCompuesta.Combinar(request.AlumnoId, mision.AulaId);
        var personaje = await _repositorioPersonajes.ObtenerPorIdAsync(personajeId, cancellationToken)
            ?? Personaje.Iniciar(request.AlumnoId, mision.AulaId);

        var recompensaApBase = Math.Max(25, mision.RecompensaXp / 4);
        personaje.RegistrarResolucionDeMision(
            mision.Id, mision.RecompensaXp, recompensaApBase, resultado.PorcentajeCorrecto, request.Fecha);

        var eventoGenerado = personaje.EventosNoConfirmados.OfType<ProgresoActualizado>().Last();

        // Actualizar proyección pre-agregada de fallos por pregunta (CQRS Read Model)
        var fallos = resultado.Feedback.Where(f => !f.EsCorrecta).ToList();
        if (fallos.Count > 0)
        {
            var metricasExistentes = await _db.MetricasPreguntas
                .Where(m => m.AulaId == mision.AulaId && m.MisionId == mision.Id)
                .ToListAsync(cancellationToken);

            foreach (var fb in fallos)
            {
                var respuesta = request.Respuestas.FirstOrDefault(r => r.IndicePregunta == fb.IndicePregunta);
                var opcionElegida = respuesta?.OpcionElegida ?? "(Sin respuesta)";
                if (opcionElegida.Length > 500) opcionElegida = opcionElegida[..500];

                var enunciado = mision.ObtenerEnunciadoPregunta(fb.IndicePregunta);
                if (enunciado.Length > 1000) enunciado = enunciado[..1000];

                var existente = metricasExistentes.FirstOrDefault(m =>
                    m.IndicePregunta == fb.IndicePregunta &&
                    string.Equals(m.OpcionElegida, opcionElegida, StringComparison.Ordinal));

                if (existente is not null)
                {
                    existente.RegistrarFallo();
                }
                else
                {
                    var nuevaMetrica = new MetricaPregunta(mision.AulaId, mision.Id, fb.IndicePregunta, enunciado, opcionElegida);
                    _db.Add(nuevaMetrica);
                    metricasExistentes.Add(nuevaMetrica);
                }
            }
        }

        await _repositorioPersonajes.GuardarAsync(personaje, cancellationToken);

        return new ResultadoResolucion(
            eventoGenerado.PorcentajeCorrecto, eventoGenerado.XpGanado, eventoGenerado.ApGanado,
            eventoGenerado.EsRepaso, resultado.Feedback);
    }
}