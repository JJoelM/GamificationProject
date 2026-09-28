namespace Core.Domain.Agregados.Misiones;

// Forma concreta del PayloadJson SOLO para TipoPlantilla == "OpcionMultiple".
// Explicacion es el feedback inmediato de por qué una respuesta
// es correcta, la pieza que sostiene el pilar de "competencia" de SDT 
public sealed record PreguntaOpcionMultiple(
    string Enunciado, List<string> Opciones, string RespuestaCorrecta, string Explicacion);

public sealed record ContenidoOpcionMultiple(List<PreguntaOpcionMultiple> Preguntas);

public sealed record RespuestaAlumno(int IndicePregunta, string OpcionElegida);

public sealed record FeedbackPregunta(int IndicePregunta, bool EsCorrecta, string RespuestaCorrecta, string Explicacion);

public sealed record ResultadoCalificacion(
    int PorcentajeCorrecto, int RespuestasCorrectas, int TotalPreguntas, List<FeedbackPregunta> Feedback);
