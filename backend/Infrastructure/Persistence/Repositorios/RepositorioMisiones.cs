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
    };

    private readonly ApplicationDbContext _db;

    public RepositorioMisiones(ApplicationDbContext db) => _db = db;

    public async Task<Mision?> ObtenerPorIdAsync(Guid misionId, CancellationToken ct = default)
    {
        var filas = await _db.EventosPersistidos
            .Where(e => e.AggregateId == misionId && e.TipoAgregado == TipoAgregado)
            .OrderBy(e => e.Version)
            .ToListAsync(ct);

        if (filas.Count == 0)
            return null;

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

            // Misma transaccion que el evento de arriba: si esto falla, el
            // SaveChangesAsync de abajo tampoco confirma el evento. No hay
            // ventana donde el Ledger tenga un hecho que la proyeccion no vio.
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
                var borradorEditado = await ObtenerBorradorOLanzar(e.MisionId, ct);
                borradorEditado.Actualizar(e.Narrativa, e.PayloadJson, e.RecompensaXp);
                break;

            case MisionValidada e:
                var borradorValidado = await ObtenerBorradorOLanzar(e.MisionId, ct);
                borradorValidado.MarcarComoValidado();
                _db.MisionesActivas.Add(new MisionActiva(
                    e.MisionId, borradorValidado.DocenteId, borradorValidado.AulaId,
                    borradorValidado.Narrativa, borradorValidado.TipoPlantilla,
                    borradorValidado.PayloadJson, borradorValidado.RecompensaXpSugerida));
                break;

            case MisionRechazada e:
                var borradorRechazado = await ObtenerBorradorOLanzar(e.MisionId, ct);
                borradorRechazado.MarcarComoRechazado(e.Motivo);
                break;

            default:
                throw new InvalidOperationException(
                    $"Evento no reconocido por el proyector de Mision: {evento.GetType().Name}");
        }
    }

    private async Task<BorradorIA> ObtenerBorradorOLanzar(Guid misionId, CancellationToken ct)
    {
        // find local primero: si este MISMO GuardarAsync ya agrego el borrador
        // en un evento anterior del lote (poco comun, pero posible), evita ir
        // a la base de datos por algo que ya esta trackeado en memoria.
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
