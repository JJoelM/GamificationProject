using Core.Domain.SeedWork;

namespace Core.Domain.Agregados.Misiones.Eventos;

// PayloadJson viaja como JSON crudo, igual que EventoPersistido.Payload en
// Infrastructure -- misma decision de diseno en las dos capas: la forma del
// contenido de una mision varia segun TipoPlantilla, y no vale la pena tipar
// cada variante todavia (ver Backlog_Mecanicas_RPG.md).
//
// AulaId existe para que el lado de lectura pueda agrupar misiones por curso
// ("campana"/compendio) sin necesidad de un agregado de escritura nuevo --
// ver la discusion de la sesion anterior.
public sealed record MisionGenerada(
    Guid MisionId,
    Guid DocenteId,
    Guid AulaId,
    string TemaCurricular,
    string TextoFuente,
    string Narrativa,
    string TipoPlantilla,
    string PayloadJson,
    int NivelConfianzaIA,
    int RecompensaXpSugerida,
    DateTime OcurridoEn) : IEventoDominio;

// Se dispara cada vez que el docente guarda un cambio sobre una mision todavia
// pendiente de revision. Es intencional que sea un evento propio y no parte de
// MisionValidada: separar "edito" de "aprobo" deja en el Ledger cuanto interviene
// realmente el docente antes de aprobar, no solo si aprobo.
public sealed record MisionEditada(
    Guid MisionId,
    Guid DocenteId,
    string Narrativa,
    string PayloadJson,
    int RecompensaXp,
    DateTime OcurridoEn) : IEventoDominio;

public sealed record MisionValidada(
    Guid MisionId,
    Guid DocenteId,
    DateTime OcurridoEn) : IEventoDominio;

public sealed record MisionRechazada(
    Guid MisionId,
    Guid DocenteId,
    string Motivo,
    DateTime OcurridoEn) : IEventoDominio;
