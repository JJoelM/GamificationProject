using System.Text.Json;
using Core.Application.Misiones.Proyecciones;
using Core.Domain.Agregados.Misiones;
using Core.Domain.Agregados.Misiones.Eventos;
using Core.Domain.SeedWork;
using Infrastructure.EventStore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositorios;

public class RepositorioMisiones : IRepositorioMisiones
{
    private const string TipoAgregado = nameof(Mision);

    private static readonly Dictionary<string, Type> TiposDeEvento = new()
    {
        [nameof(MisionGenerada)] = typeof(MisionGenerada),
        [nameof(MisionEditada)] = typeof(MisionEditada),
        [nameof(MisionValidada)] = typeof(MisionValidada),
        [nameof(MisionRechazada)] = typeof(MisionRechazada),
        [nameof(MisionOcultada)] = typeof(MisionOcultada),
        [nameof(MisionRepublicada)] = typeof(MisionRepublicada),
        [nameof(MisionesSugeridasDefinidas)] = typeof(MisionesSugeridasDefinidas),
    };

    private readonly ApplicationDbContext _db;

    public RepositorioMisiones(ApplicationDbContext db) => _db = db;

    public async Task<Mision?> ObtenerPorIdAsync(Guid misionId, CancellationToken ct = default)
    {
        var filas = await _db.EventosPersistidos
            .Where(e => e.AggregateId == misionId && e.TipoAgregado == TipoAgregado)
            .OrderBy(e => e.Version)
            .ToListAsync(ct);

        if (filas.Count == 0) return null;

        var mision = Mision.ParaReconstruccion();
        mision.CargarDesdeHistorial(filas.Select(Deserializar));
        return mision;
    }

    public async Task GuardarAsync(Mision mision, CancellationToken ct = default)
    {
        var pendientes = mision.EventosNoConfirmados;
        if (pendientes.Count == 0) return;

        var version = mision.Version - pendientes.Count;

        foreach (var evento in pendientes)
        {
            version++;
            _db.EventosPersistidos.Add(new EventoPersistido(
                mision.Id, TipoAgregado, version, evento.GetType().Name,
                JsonSerializer.Serialize(evento, evento.GetType())));

            await AplicarAProyeccionAsync(evento, ct);
        }

        await _db.SaveChangesAsync(ct);
        mision.MarcarEventosComoConfirmados();
    }

    private async Task AplicarAProyeccionAsync(IEventoDominio evento, CancellationToken ct)
    {
        switch (evento)
        {
            case MisionGenerada e:
                _db.BorradoresIA.Add(new BorradorIA(
                    e.MisionId, e.DocenteId, e.AulaId, e.TemaCurricular, e.Narrativa,
                    e.TipoPlantilla, e.PayloadJson, e.NivelConfianzaIA, e.RecompensaXpSugerida));
                break;

            case MisionEditada e:
                var borrador = await ObtenerBorradorOLanzar(e.MisionId, ct);
                borrador.Actualizar(e.Narrativa, e.PayloadJson, e.RecompensaXp);

                var misionActivaEdicion = await _db.MisionesActivas
                    .FirstOrDefaultAsync(m => m.MisionId == e.MisionId, ct);
                if (misionActivaEdicion is not null)
                {
                    var payloadSeguro = SanitizadorPayloadMision.SanitizarParaAlumno(
                        borrador.TipoPlantilla, e.PayloadJson);
                    misionActivaEdicion.Actualizar(e.Narrativa, payloadSeguro, e.RecompensaXp);
                }
                break;

            case MisionValidada e:
                var borradorValidado = await ObtenerBorradorOLanzar(e.MisionId, ct);
                borradorValidado.MarcarComoValidado();

                var payloadAlumno = SanitizadorPayloadMision.SanitizarParaAlumno(
                    borradorValidado.TipoPlantilla, borradorValidado.PayloadJson);

                var existente = await _db.MisionesActivas
                    .FirstOrDefaultAsync(m => m.MisionId == e.MisionId, ct);

                if (existente is not null)
                {
                    existente.Actualizar(borradorValidado.Narrativa, payloadAlumno, borradorValidado.RecompensaXpSugerida);
                    existente.Republicar();
                }
                else
                {
                    _db.MisionesActivas.Add(new MisionActiva(
                        e.MisionId, borradorValidado.DocenteId, borradorValidado.AulaId,
                        borradorValidado.Narrativa, borradorValidado.TipoPlantilla,
                        payloadAlumno, borradorValidado.RecompensaXpSugerida));
                }

                // Generación automática de FichaGrimorio si no existe
                var fichaExistente = await _db.FichasGrimorio
                    .FirstOrDefaultAsync(f => f.MisionId == e.MisionId, ct);

                if (fichaExistente is null)
                {
                    var conceptos = ExtraerConceptosClave(
                        borradorValidado.TemaCurricular, borradorValidado.TipoPlantilla, borradorValidado.PayloadJson);
                    _db.FichasGrimorio.Add(new FichaGrimorio(
                        e.MisionId, borradorValidado.AulaId, borradorValidado.TemaCurricular,
                        borradorValidado.Narrativa, JsonSerializer.Serialize(conceptos)));
                }
                break;

            case MisionRechazada e:
                var borradorRechazado = await ObtenerBorradorOLanzar(e.MisionId, ct);
                borradorRechazado.MarcarComoRechazado(e.Motivo);
                break;

            case MisionOcultada e:
                var borradorOculto = await ObtenerBorradorOLanzar(e.MisionId, ct);
                borradorOculto.MarcarComoOculto();
                var activaOcultar = await _db.MisionesActivas
                    .FirstOrDefaultAsync(m => m.MisionId == e.MisionId, ct);
                activaOcultar?.Ocultar();
                break;

            case MisionRepublicada e:
                var borradorRepublicado = await ObtenerBorradorOLanzar(e.MisionId, ct);
                borradorRepublicado.MarcarComoValidado();
                var activaRepublicar = await _db.MisionesActivas
                    .FirstOrDefaultAsync(m => m.MisionId == e.MisionId, ct);
                activaRepublicar?.Republicar();
                break;

            case MisionesSugeridasDefinidas e:
                var origen = await ObtenerBorradorOLanzar(e.MisionId, ct);
                var actuales = await _db.ConexionesMision
                    .Where(c => c.MisionOrigenId == e.MisionId)
                    .ToListAsync(ct);

                // Se aplica la diferencia, no "borrar todo y reinsertar": EF no tolera
                // un Delete y un Add con la misma clave compuesta en un mismo SaveChanges.
                var nuevos = e.MisionesSugeridas.ToHashSet();
                foreach (var c in actuales.Where(c => !nuevos.Contains(c.MisionDestinoId)))
                    _db.ConexionesMision.Remove(c);

                var yaExisten = actuales.Select(c => c.MisionDestinoId).ToHashSet();
                foreach (var destino in nuevos.Where(d => !yaExisten.Contains(d)))
                    _db.ConexionesMision.Add(new ConexionMision(e.MisionId, destino, origen.AulaId));
                break;

            default:
                throw new InvalidOperationException(
                    $"Evento no reconocido por el proyector de Mision: {evento.GetType().Name}");
        }
    }

    private static List<string> ExtraerConceptosClave(string temaCurricular, string tipoPlantilla, string payloadJson)
    {
        var conceptos = new List<string> { temaCurricular };
        try
        {
            using var doc = JsonDocument.Parse(payloadJson);
            var root = doc.RootElement;
            if (root.TryGetProperty("preguntas", out var preguntas) && preguntas.ValueKind == JsonValueKind.Array)
            {
                foreach (var p in preguntas.EnumerateArray())
                {
                    if (p.TryGetProperty("explicacion", out var exp) && !string.IsNullOrWhiteSpace(exp.GetString()))
                    {
                        conceptos.Add(exp.GetString()!);
                    }
                }
            }
            else if (root.TryGetProperty("fases", out var fases) && fases.ValueKind == JsonValueKind.Array)
            {
                foreach (var f in fases.EnumerateArray())
                {
                    if (f.TryGetProperty("explicacion", out var exp) && !string.IsNullOrWhiteSpace(exp.GetString()))
                    {
                        conceptos.Add(exp.GetString()!);
                    }
                }
            }
            else if (root.TryGetProperty("explicacion", out var expGeneral) && !string.IsNullOrWhiteSpace(expGeneral.GetString()))
            {
                conceptos.Add(expGeneral.GetString()!);
            }
        }
        catch
        {
            // Si el JSON falla en parsear, retornamos al menos el tema curricular
        }

        return conceptos.Distinct().Take(5).ToList();
    }

    private async Task<BorradorIA> ObtenerBorradorOLanzar(Guid misionId, CancellationToken ct)
    {
        return _db.ChangeTracker.Entries<BorradorIA>()
                .Select(e => e.Entity)
                .FirstOrDefault(b => b.MisionId == misionId)
            ?? await _db.BorradoresIA.FirstOrDefaultAsync(b => b.MisionId == misionId, ct)
            ?? throw new InvalidOperationException(
                $"Proyeccion inconsistente: no existe BorradorIA para la mision {misionId}.");
    }

    private static IEventoDominio Deserializar(EventoPersistido fila)
    {
        if (!TiposDeEvento.TryGetValue(fila.TipoEvento, out var tipo))
            throw new InvalidOperationException($"Tipo de evento desconocido en el Ledger: {fila.TipoEvento}");
        return (IEventoDominio)JsonSerializer.Deserialize(fila.Payload, tipo)!;
    }
}
