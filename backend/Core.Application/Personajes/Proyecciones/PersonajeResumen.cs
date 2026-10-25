namespace Core.Application.Personajes.Proyecciones;

// Proyeccion de lectura del Personaje: existe para que el ranking y las
// metricas del docente puedan consultar XP/racha sin reconstruir el agregado
// completo desde el Ledger por cada alumno del aula. El mismo patron que
// BorradorIA/MisionActiva -- escribe el RepositorioPersonajes al guardar,
// lee IApplicationDbContext desde los query handlers.
public class PersonajeResumen
{
    public Guid PersonajeId { get; private set; }
    public Guid AlumnoId { get; private set; }
    public Guid AulaId { get; private set; }
    public int ExperienciaXP { get; private set; }
    public int PuntosAccionAP { get; private set; }
    public int RachaDiasActivos { get; private set; }
    public int MisionesCompletadas { get; private set; }
    public string? AvatarEquipado { get; private set; }
    public string? MarcoEquipado { get; private set; }
    public string? MascotaEquipada { get; private set; }

    private PersonajeResumen() { }

    public PersonajeResumen(Guid personajeId, Guid alumnoId, Guid aulaId)
    {
        PersonajeId = personajeId;
        AlumnoId = alumnoId;
        AulaId = aulaId;
    }

    public void ActualizarProgreso(int xp, int ap, int racha, int misionesCompletadas)
    {
        ExperienciaXP = xp;
        PuntosAccionAP = ap;
        RachaDiasActivos = racha;
        MisionesCompletadas = misionesCompletadas;
    }

    public void ActualizarPersonalizacion(string? avatar, string? marco, string? mascota)
    {
        AvatarEquipado = avatar;
        MarcoEquipado = marco;
        MascotaEquipada = mascota;
    }
}
