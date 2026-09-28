using System.Text.Json;
using Core.Domain.Agregados.Personajes;
using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;
using Infrastructure.EventStore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Repositorios;

public class RepositorioPersonajes : IRepositorioPersonajes
{
    private const string TipoAgregado = nameof(Personaje);

    private static readonly Dictionary<string, Type> TiposDeEvento = new()
    {
        [nameof(ProgresoActualizado)] = typeof(ProgresoActualizado),
    };

    private readonly ApplicationDbContext _db;

    public RepositorioPersonajes(ApplicationDbContext db) => _db = db;

    public async Task<Personaje?> ObtenerPorIdAsync(Guid personajeId, CancellationToken ct = default)
    {
        var filas = await _db.EventosPersistidos
            .Where(e => e.AggregateId == personajeId && e.TipoAgregado == TipoAgregado)
            .OrderBy(e => e.Version)
            .ToListAsync(ct);

        if (filas.Count == 0) return null;

        var personaje = Personaje.ParaReconstruccion();
        personaje.CargarDesdeHistorial(filas.Select(Deserializar));
        return personaje;
    }

    public async Task GuardarAsync(Personaje personaje, CancellationToken ct = default)
    {
        var pendientes = personaje.EventosNoConfirmados;
        if (pendientes.Count == 0) return;

        var version = personaje.Version - pendientes.Count;

        foreach (var evento in pendientes)
        {
            version++;
            _db.EventosPersistidos.Add(new EventoPersistido(
                personaje.Id, TipoAgregado, version, evento.GetType().Name,
                JsonSerializer.Serialize(evento, evento.GetType())));
        }

        await _db.SaveChangesAsync(ct);
        personaje.MarcarEventosComoConfirmados();
    }

    private static IEventoDominio Deserializar(EventoPersistido fila)
    {
        if (!TiposDeEvento.TryGetValue(fila.TipoEvento, out var tipo))
            throw new InvalidOperationException($"Tipo de evento desconocido en el Ledger: {fila.TipoEvento}");
        return (IEventoDominio)JsonSerializer.Deserialize(fila.Payload, tipo)!;
    }
}