namespace Core.Domain.Agregados.Misiones;

// -- OpcionMultiple --
// Explicacion es el feedback inmediato de por qué una respuesta
// es correcta, la pieza que sostiene el pilar de "competencia" de SDT
public sealed record PreguntaOpcionMultiple(
    string Enunciado, List<string> Opciones, string RespuestaCorrecta, string Explicacion);

public sealed record ContenidoOpcionMultiple(List<PreguntaOpcionMultiple> Preguntas);

// -- BatallaDeJefe: misma mecanica de respuesta que OpcionMultiple (por eso
// reutiliza RespuestaAlumno), la narrativa y el daño son puramente de
// presentacion -- el frontend calcula el daño visual a partir de DanioAlJefe
// por fase y de cual Feedback vino marcado como correcto. El dominio no
// necesita saber nada de barras de HP.
public sealed record FaseDeBatalla(
    string Enunciado, List<string> Opciones, string RespuestaCorrecta, string Explicacion,
    int DanioAlJefe, string? PenalizacionFallo);

public sealed record ContenidoBatallaDeJefe(string NombreJefe, int HpMaximo, List<FaseDeBatalla> Fases);

// -- LineaTemporal: forma de respuesta genuinamente distinta (un orden, no
// una lista de respuestas por indice), por eso tiene su propio metodo y su
// propio tipo de resultado en vez de forzarla dentro de ResultadoCalificacion.
public sealed record EventoDesordenado(string Id, string Descripcion, int OrdenCorrecto);

public sealed record ContenidoLineaTemporal(
    string EstadoErroneoDescripcion, List<EventoDesordenado> EventosDesordenados,
    string EventoCulpableId, string Explicacion);

public sealed record RespuestaOrdenTemporal(List<string> OrdenPropuesto, string EventoCulpableElegido);

// Entrega la solucion legitimamente DESPUES de haber calificado en el servidor,
// permitiendo que el frontend anime la transicion de reordenamiento y muestre el culpable
// sin haber expuesto las respuestas previamente al alumno.
public sealed record ResultadoOrdenTemporal(
    int PorcentajeCorrecto,
    bool CulpableIdentificadoCorrectamente,
    string ExplicacionCorrecta,
    List<string> OrdenCorrecto,
    string EventoCulpableId);

// -- Comunes a OpcionMultiple y BatallaDeJefe --
public sealed record RespuestaAlumno(int IndicePregunta, string OpcionElegida);

public sealed record FeedbackPregunta(int IndicePregunta, bool EsCorrecta, string RespuestaCorrecta, string Explicacion);

public sealed record ResultadoCalificacion(
    int PorcentajeCorrecto, int RespuestasCorrectas, int TotalPreguntas, List<FeedbackPregunta> Feedback);
