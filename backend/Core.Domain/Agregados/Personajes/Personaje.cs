using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Personajes;

// Antes "Alumno". Renombrado porque la identidad real ya no es "el alumno" --
// es "el alumno en esa Aula especifica". Un mismo AlumnoId tiene un Personaje
// (y un historial de eventos) distinto por cada Aula en la que este inscripto.
public sealed class Personaje : AgregadoRaiz
{
    public Guid AlumnoId { get; private set; }
    public Guid AulaId { get; private set; }
    public int ExperienciaXP { get; private set; }
    public int PuntosAccionAP { get; private set; }
    public int RachaDiasActivos { get; private set; }
    public DateOnly? UltimoDiaActivo { get; private set; }

    private readonly Dictionary<Guid, int> _intentosPorMision = new();

    private Personaje() { }

    public static Personaje ParaReconstruccion() => new();

    // El Id del agregado es la combinacion deterministica de AlumnoId +
    // AulaId (ver IdentidadCompuesta) -- no un Guid nuevo por separado.
    public static Personaje Iniciar(Guid alumnoId, Guid aulaId) => new()
    {
        Id = IdentidadCompuesta.Combinar(alumnoId, aulaId),
        AlumnoId = alumnoId,
        AulaId = aulaId,
    };

    public void RegistrarResolucionDeMision(
        Guid misionId, int recompensaXpBase, int recompensaApBase, int porcentajeCorrecto, DateOnly fecha)
    {
        if (recompensaXpBase < 0 || recompensaApBase < 0)
            throw new ArgumentOutOfRangeException(nameof(recompensaXpBase), "Las recompensas no pueden ser negativas.");

        if (porcentajeCorrecto is < 0 or > 100)
            throw new ArgumentOutOfRangeException(nameof(porcentajeCorrecto), "Debe estar entre 0 y 100.");

        if (UltimoDiaActivo is not null && fecha < UltimoDiaActivo)
            throw new InvalidOperationException(
                "No se puede registrar progreso con una fecha anterior a la última actividad registrada.");

        var numeroDeIntento = _intentosPorMision.GetValueOrDefault(misionId, 0) + 1;
        var multiplicadorCorreccion = ObtenerMultiplicadorPorCorreccion(porcentajeCorrecto);
        var multiplicadorRepeticion = ObtenerMultiplicadorPorRepeticion(numeroDeIntento);

        var xpGanado = (int)(recompensaXpBase * multiplicadorCorreccion * multiplicadorRepeticion);
        var apGanado = (int)(recompensaApBase * multiplicadorCorreccion * multiplicadorRepeticion);

        var nuevaRacha = UltimoDiaActivo is null ? 1
            : fecha == UltimoDiaActivo ? RachaDiasActivos
            : fecha == UltimoDiaActivo!.Value.AddDays(1) ? RachaDiasActivos + 1
            : 1;

        RegistrarEvento(new ProgresoActualizado(
            Id, AlumnoId, AulaId, misionId, numeroDeIntento, porcentajeCorrecto, numeroDeIntento > 1,
            xpGanado, apGanado, ExperienciaXP + xpGanado, PuntosAccionAP + apGanado,
            nuevaRacha, fecha, DateTime.UtcNow));
    }

    private static double ObtenerMultiplicadorPorCorreccion(int porcentajeCorrecto) => porcentajeCorrecto switch
    {
        100 => 1.0,
        >= 75 => 0.6,
        >= 50 => 0.4,
        >= 1 => 0.2,
        _ => 0.0,
    };

    private static double ObtenerMultiplicadorPorRepeticion(int numeroDeIntento) => numeroDeIntento switch
    {
        1 => 1.0,
        2 => 0.5,
        3 => 0.1,
        _ => 0.0,
    };

    protected override void Aplicar(IEventoDominio evento)
    {
        switch (evento)
        {
            case ProgresoActualizado e:
                Id = e.PersonajeId;
                AlumnoId = e.AlumnoId;
                AulaId = e.AulaId;
                _intentosPorMision[e.MisionId] = e.NumeroDeIntento;
                ExperienciaXP = e.ExperienciaTotal;
                PuntosAccionAP = e.PuntosAccionTotal;
                RachaDiasActivos = e.RachaDiasActivos;
                UltimoDiaActivo = e.Fecha;
                break;

            default:
                throw new InvalidOperationException(
                    $"Evento no reconocido por el agregado Personaje: {evento.GetType().Name}");
        }
    }
}
