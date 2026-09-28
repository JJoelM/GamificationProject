namespace WebApi.Endpoints.Misiones;

// DocenteId no viaja en ningun request: sale del claim usuarioId del JWT.
public sealed record GenerarMisionRequest(
    Guid AulaId, string TemaCurricular, string TextoFuente, string Narrativa,
    string TipoPlantilla, string PayloadJson, int NivelConfianzaIA, int RecompensaXpSugerida);

public sealed record EditarMisionRequest(string Narrativa, string PayloadJson, int RecompensaXp);

public sealed record RechazarMisionRequest(string Motivo);

public sealed record SolicitarGeneracionRequest(Guid AulaId, string TemaCurricular, string TextoFuente);
