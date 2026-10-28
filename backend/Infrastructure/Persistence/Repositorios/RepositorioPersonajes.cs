using System.Text.Json;
using Core.Application.Misiones.Proyecciones;
using Core.Application.Personajes.Proyecciones;
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
        [nameof(ArticuloComprado)] = typeof(ArticuloComprado),
        [nameof(ArticuloEquipado)] = typeof(ArticuloEquipado),
        [nameof(PistaUsada)] = typeof(PistaUsada),
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

            await AplicarAProyeccionAsync(personaje, evento, ct);
        }

        await _db.SaveChangesAsync(ct);
        personaje.MarcarEventosComoConfirmados();
    }

    private async Task AplicarAProyeccionAsync(Personaje personaje, IEventoDominio evento, CancellationToken ct)
    {
        switch (evento)
        {
            case ProgresoActualizado e:
                // Proyección de resumen (para ranking y métricas del docente)
                var resumen = await _db.PersonajesResumen
                    .FirstOrDefaultAsync(p => p.PersonajeId == e.PersonajeId, ct);

                if (resumen is null)
                {
                    resumen = new PersonajeResumen(e.PersonajeId, e.AlumnoId, e.AulaId);
                    _db.PersonajesResumen.Add(resumen);
                }

                resumen.ActualizarProgreso(e.ExperienciaTotal, e.PuntosAccionTotal, e.RachaDiasActivos, e.MisionesCompletadas);

                // Proyección de resolución individual (para métricas granulares)
                _db.ResolucionesRegistradas.Add(new ResolucionRegistrada(
                    e.PersonajeId, e.AlumnoId, e.AulaId, e.MisionId, e.NumeroDeIntento,
                    e.PorcentajeCorrecto, e.EsRepaso,
                    JsonSerializer.Serialize(new { e.PorcentajeCorrecto }),
                    e.Fecha, e.OcurridoEn));

                // Si aprobó la misión (>= 50%), desbloquear la ficha del Grimorio si existe
                if (e.PorcentajeCorrecto >= 50)
                {
                    var ficha = await _db.FichasGrimorio
                        .FirstOrDefaultAsync(f => f.MisionId == e.MisionId, ct);

                    if (ficha is not null)
                    {
                        var yaDesbloqueada = await _db.FichasGrimorioDesbloqueadas
                            .AnyAsync(d => d.FichaId == ficha.FichaId && d.AlumnoId == e.AlumnoId, ct);

                        if (!yaDesbloqueada)
                        {
                            _db.FichasGrimorioDesbloqueadas.Add(
                                new FichaGrimorioDesbloqueada(ficha.FichaId, e.AlumnoId));
                        }
                    }
                }
                break;

            case ArticuloComprado:
            case ArticuloEquipado:
                var resumenBazar = await _db.PersonajesResumen
                    .FirstOrDefaultAsync(p => p.PersonajeId == personaje.Id, ct);
                if (resumenBazar is not null)
                {
                    resumenBazar.ActualizarProgreso(
                        personaje.ExperienciaXP,
                        personaje.PuntosAccionAP,
                        personaje.RachaDiasActivos,
                        personaje.MisionesCompletadas);
                    resumenBazar.ActualizarPersonalizacion(
                        personaje.AvatarEquipado,
                        personaje.MarcoEquipado,
                        personaje.MascotaEquipada,
                        personaje.TituloEquipado);
                }
                break;
        }
    }

    private static IEventoDominio Deserializar(EventoPersistido fila)
    {
        if (!TiposDeEvento.TryGetValue(fila.TipoEvento, out var tipo))
            throw new InvalidOperationException($"Tipo de evento desconocido en el Ledger: {fila.TipoEvento}");
        return (IEventoDominio)JsonSerializer.Deserialize(fila.Payload, tipo)!;
    }
}
