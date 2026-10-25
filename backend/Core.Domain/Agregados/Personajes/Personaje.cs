using Core.Domain.SeedWork;
using Core.Domain.Agregados.Personajes.Eventos;

namespace Core.Domain.Agregados.Personajes;

public sealed class Personaje : AgregadoRaiz
{
    public Guid AlumnoId { get; private set; }
    public Guid AulaId { get; private set; }
    public int ExperienciaXP { get; private set; }
    public int PuntosAccionAP { get; private set; }
    public int RachaDiasActivos { get; private set; }
    public DateOnly? UltimoDiaActivo { get; private set; }
    public int EscudosRachaDisponibles { get; private set; }
    public string? AvatarEquipado { get; private set; }
    public string? MarcoEquipado { get; private set; }
    public string? MascotaEquipada { get; private set; }
    public string? TituloEquipado { get; private set; }

    private readonly HashSet<string> _cosmeticosComprados = new();
    public IReadOnlyCollection<string> CosmeticosComprados => _cosmeticosComprados;

    private readonly Dictionary<Guid, int> _intentosPorMision = new();
    private int _misionesCompletadas;

    private Personaje() { }

    public static Personaje ParaReconstruccion() => new();

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
            throw new TransicionDeEstadoInvalidaException("No se puede registrar progreso con una fecha anterior a la última actividad registrada.");

        var numeroDeIntento = _intentosPorMision.GetValueOrDefault(misionId, 0) + 1;
        var multiplicadorCorreccion = ObtenerMultiplicadorPorCorreccion(porcentajeCorrecto);
        var multiplicadorRepeticion = ObtenerMultiplicadorPorRepeticion(numeroDeIntento);

        var xpGanado = (int)(recompensaXpBase * multiplicadorCorreccion * multiplicadorRepeticion);
        var apGanado = (int)(recompensaApBase * multiplicadorCorreccion * multiplicadorRepeticion);

        var hayBrechaDeUnDia = UltimoDiaActivo is not null && fecha > UltimoDiaActivo.Value.AddDays(1);
        var escudosConsumidos = hayBrechaDeUnDia && EscudosRachaDisponibles > 0 ? 1 : 0;

        int nuevaRacha;
        if (UltimoDiaActivo is null) nuevaRacha = 1;
        else if (fecha == UltimoDiaActivo) nuevaRacha = RachaDiasActivos;
        else if (fecha == UltimoDiaActivo.Value.AddDays(1)) nuevaRacha = RachaDiasActivos + 1;
        else if (escudosConsumidos > 0) nuevaRacha = RachaDiasActivos; // escudo absorbió la brecha
        else nuevaRacha = 1;

        var nuevasMisionesCompletadas = _misionesCompletadas + (numeroDeIntento == 1 && porcentajeCorrecto > 0 ? 1 : 0);

        RegistrarEvento(new ProgresoActualizado(
            Id, AlumnoId, AulaId, misionId, numeroDeIntento, porcentajeCorrecto, numeroDeIntento > 1,
            xpGanado, apGanado, ExperienciaXP + xpGanado, PuntosAccionAP + apGanado,
            nuevaRacha, EscudosRachaDisponibles - escudosConsumidos, nuevasMisionesCompletadas,
            fecha, DateTime.UtcNow));
    }

    public void ComprarArticulo(string articuloId, int costoAp, TipoArticulo tipo, string valor)
    {
        if (PuntosAccionAP < costoAp)
            throw new TransicionDeEstadoInvalidaException(
                $"AP insuficientes: tenés {PuntosAccionAP}, el artículo cuesta {costoAp}.");
        if (_cosmeticosComprados.Contains(articuloId))
            throw new TransicionDeEstadoInvalidaException("Ya compraste este artículo.");

        RegistrarEvento(new ArticuloComprado(Id, articuloId, tipo, valor, costoAp, PuntosAccionAP - costoAp, DateTime.UtcNow));
    }

    // Equipar no cuesta AP y no requiere que el artículo no exista previamente
    // -- solo requiere que ya haya sido comprado.
    public void EquiparArticulo(string articuloId, TipoArticulo tipo, string valor)
    {
        if (tipo != TipoArticulo.EscudoRacha && !_cosmeticosComprados.Contains(articuloId))
            throw new TransicionDeEstadoInvalidaException(
                $"No podés equipar '{articuloId}' porque no lo compraste todavía.");

        RegistrarEvento(new ArticuloEquipado(Id, articuloId, tipo, valor, DateTime.UtcNow));
    }

    private static double ObtenerMultiplicadorPorCorreccion(int p) => p switch
    {
        100 => 1.0, >= 75 => 0.6, >= 50 => 0.4, >= 1 => 0.2, _ => 0.0
    };

    private static double ObtenerMultiplicadorPorRepeticion(int n) => n switch
    {
        1 => 1.0, 2 => 0.5, 3 => 0.1, _ => 0.0
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
                EscudosRachaDisponibles = e.EscudosRachaRestantes;
                UltimoDiaActivo = e.Fecha;
                _misionesCompletadas = e.MisionesCompletadas;
                break;

            case ArticuloComprado e:
                _cosmeticosComprados.Add(e.ArticuloId);
                PuntosAccionAP = e.PuntosAccionRestantes;
                AplicarArticulo(e.Tipo, e.Valor);
                // Comprar equipa automáticamente si es la primera vez
                break;

            case ArticuloEquipado e:
                AplicarArticulo(e.Tipo, e.Valor);
                break;

            default:
                throw new TransicionDeEstadoInvalidaException(
                    $"Evento no reconocido por el agregado Personaje: {evento.GetType().Name}");
        }
    }

    private void AplicarArticulo(TipoArticulo tipo, string valor)
    {
        switch (tipo)
        {
            case TipoArticulo.Avatar: AvatarEquipado = valor; break;
            case TipoArticulo.Marco: MarcoEquipado = valor; break;
            case TipoArticulo.Mascota: MascotaEquipada = valor; break;
            case TipoArticulo.Titulo: TituloEquipado = valor; break;
            case TipoArticulo.EscudoRacha: EscudosRachaDisponibles += 1; break;
        }
    }
}
