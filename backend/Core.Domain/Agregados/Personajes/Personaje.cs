using Core.Domain.Agregados.Personajes.Eventos;
using Core.Domain.SeedWork;

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
    public int PistasDisponibles { get; private set; }
    public string? AvatarEquipado { get; private set; }
    public string? MarcoEquipado { get; private set; }
    public string? MascotaEquipada { get; private set; }
    public string? TituloEquipado { get; private set; }

    // Solo cosmeticos (se compran una vez). Escudos y pistas son consumibles:
    // se pueden volver a comprar y no figuran aca.
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
            throw new TransicionDeEstadoInvalidaException(
                "No se puede registrar progreso con una fecha anterior a la última actividad registrada.");

        var numeroDeIntento = _intentosPorMision.GetValueOrDefault(misionId, 0) + 1;
        var multiplicadorCorreccion = ObtenerMultiplicadorPorCorreccion(porcentajeCorrecto);
        var multiplicadorRepeticion = ObtenerMultiplicadorPorRepeticion(numeroDeIntento);

        var xpGanado = (int)(recompensaXpBase * multiplicadorCorreccion * multiplicadorRepeticion);
        var apGanado = (int)(recompensaApBase * multiplicadorCorreccion * multiplicadorRepeticion);

        var hayBrecha = UltimoDiaActivo is not null && fecha > UltimoDiaActivo.Value.AddDays(1);
        var escudosConsumidos = hayBrecha && EscudosRachaDisponibles > 0 ? 1 : 0;

        int nuevaRacha;
        if (UltimoDiaActivo is null) nuevaRacha = 1;
        else if (fecha == UltimoDiaActivo) nuevaRacha = RachaDiasActivos;
        else if (fecha == UltimoDiaActivo.Value.AddDays(1)) nuevaRacha = RachaDiasActivos + 1;
        else if (escudosConsumidos > 0) nuevaRacha = RachaDiasActivos;
        else nuevaRacha = 1;

        var misionesCompletadas = _misionesCompletadas + (numeroDeIntento == 1 && porcentajeCorrecto > 0 ? 1 : 0);

        RegistrarEvento(new ProgresoActualizado(
            Id, AlumnoId, AulaId, misionId, numeroDeIntento, porcentajeCorrecto, numeroDeIntento > 1,
            xpGanado, apGanado, ExperienciaXP + xpGanado, PuntosAccionAP + apGanado,
            nuevaRacha, EscudosRachaDisponibles - escudosConsumidos, misionesCompletadas,
            fecha, DateTime.UtcNow));
    }

    public void ComprarArticulo(string articuloId, int costoAp, TipoArticulo tipo, string valor)
    {
        if (costoAp < 0)
            throw new ArgumentOutOfRangeException(nameof(costoAp), "El costo no puede ser negativo.");

        var esConsumible = tipo is TipoArticulo.EscudoRacha or TipoArticulo.Pista;

        if (PuntosAccionAP < costoAp)
            throw new TransicionDeEstadoInvalidaException(
                $"AP insuficientes: tenés {PuntosAccionAP}, el artículo cuesta {costoAp}.");
        if (!esConsumible && _cosmeticosComprados.Contains(articuloId))
            throw new TransicionDeEstadoInvalidaException("Ya compraste este artículo.");

        RegistrarEvento(new ArticuloComprado(
            Id, articuloId, tipo, valor, costoAp, PuntosAccionAP - costoAp, DateTime.UtcNow));
    }

    private static readonly HashSet<string> TitulosDeNivel = new(StringComparer.OrdinalIgnoreCase)
    {
        "Iniciado del Saber",
        "Buscador de Respuestas",
        "Explorador Curioso",
        "Erudito de las Runas",
        "Maestro Alquimista",
        "Centinela del Saber",
        "Erudito Arcano"
    };

    private static readonly HashSet<string> ArticulosBase = new(StringComparer.OrdinalIgnoreCase)
    {
        "avatar-explorador",
        "erudito_arcano",
        "exploradora_reliquias",
        "marco-pergamino",
        "scroll",
        "parchment",
        "default"
    };

    public bool EsArticuloDesbloqueado(string articuloId, TipoArticulo tipo)
    {
        if (_cosmeticosComprados.Contains(articuloId)) return true;
        if (ArticulosBase.Contains(articuloId)) return true;
        if (tipo == TipoArticulo.Titulo && TitulosDeNivel.Contains(articuloId)) return true;

        var articulo = CatalogoBazar.Buscar(articuloId);
        if (articulo != null && _cosmeticosComprados.Contains(articulo.Id)) return true;

        var porNombre = CatalogoBazar.Todos.FirstOrDefault(a =>
            string.Equals(a.Nombre, articuloId, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(a.Id, articuloId, StringComparison.OrdinalIgnoreCase));
        if (porNombre != null && _cosmeticosComprados.Contains(porNombre.Id)) return true;

        return false;
    }

    // Solo cosmeticos ya comprados o desbloqueados. Equipar un escudo o una pista no tiene sentido
    public void EquiparArticulo(string articuloId, TipoArticulo tipo, string valor)
    {
        if (tipo is not (TipoArticulo.Avatar or TipoArticulo.Marco or TipoArticulo.Mascota or TipoArticulo.Titulo))
            throw new ArgumentException("Solo se pueden equipar avatares, marcos, mascotas y títulos.");
        if (!EsArticuloDesbloqueado(articuloId, tipo))
            throw new TransicionDeEstadoInvalidaException($"No podés equipar '{articuloId}' porque no lo compraste todavía.");

        RegistrarEvento(new ArticuloEquipado(Id, articuloId, tipo, valor, DateTime.UtcNow));
    }

    public void UsarPista(Guid misionId, int indicePregunta)
    {
        if (PistasDisponibles <= 0)
            throw new TransicionDeEstadoInvalidaException("No tenés pistas disponibles. Podés comprarlas en el Bazar.");

        RegistrarEvento(new PistaUsada(Id, misionId, indicePregunta, PistasDisponibles - 1, DateTime.UtcNow));
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
                PuntosAccionAP = e.PuntosAccionRestantes;
                switch (e.Tipo)
                {
                    case TipoArticulo.EscudoRacha: EscudosRachaDisponibles++; break;
                    case TipoArticulo.Pista: PistasDisponibles++; break;
                    default:
                        _cosmeticosComprados.Add(e.ArticuloId);
                        AplicarCosmetico(e.Tipo, e.Valor);
                        break;
                }
                break;

            case ArticuloEquipado e:
                AplicarCosmetico(e.Tipo, e.Valor);
                break;

            case PistaUsada e:
                PistasDisponibles = e.PistasRestantes;
                break;

            default:
                throw new TransicionDeEstadoInvalidaException(
                    $"Evento no reconocido por el agregado Personaje: {evento.GetType().Name}");
        }
    }

    private void AplicarCosmetico(TipoArticulo tipo, string valor)
    {
        switch (tipo)
        {
            case TipoArticulo.Avatar: AvatarEquipado = valor; break;
            case TipoArticulo.Marco: MarcoEquipado = valor; break;
            case TipoArticulo.Mascota: MascotaEquipada = valor; break;
            case TipoArticulo.Titulo: TituloEquipado = valor; break;
        }
    }
}
