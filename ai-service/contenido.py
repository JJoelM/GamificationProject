"""
Validacion y transformacion del contenido que devuelve la IA.

Solo usa la libreria estandar a proposito: se puede probar sin red, sin Gemini y
sin FastAPI. Recibe objetos con atributos (los modelos de esquemas.py) y devuelve
diccionarios listos para serializar.

Principio: la IA solo hace lo que sabe hacer (redactar). Todo lo mecanico lo
calcula el servicio: ids, orden, reparto de dano, HP, mezcla de opciones.
Asi la IA no puede producir una Linea Temporal con ids repetidos ni un jefe
imposible de derrotar.
"""
import random

PENALIZACIONES_VALIDAS = ("temblor", "destello", "enfriamiento")
PENALIZACION_POR_DEFECTO = "destello"

DANIO_TOTAL = 100
# Con 70 el jefe cae acertando ~70% de las fases. Decision de diseno: subirlo
# lo vuelve mas exigente (100 = hay que acertar todo).
PORCENTAJE_HP_PARA_DERROTA = 70

MAX_LONGITUD_NARRATIVA = 1800  # el backend C# rechaza narrativas de mas de 2000


class ContenidoInvalido(ValueError):
    """La IA devolvio algo que no cumple las reglas del tipo de mision."""


def _texto(valor, campo, max_len=1000):
    limpio = (valor or "").strip()
    if not limpio:
        raise ContenidoInvalido(f"'{campo}' viene vacio.")
    if len(limpio) > max_len:
        raise ContenidoInvalido(f"'{campo}' es demasiado largo ({len(limpio)} > {max_len}).")
    return limpio


def _pregunta_validada(p, rng):
    """Valida una pregunta de opcion multiple y devuelve (enunciado, opciones, correcta, explicacion)."""
    enunciado = _texto(p.enunciado, "enunciado")
    explicacion = _texto(p.explicacion, "explicacion")
    opciones = [_texto(o, "opcion", 300) for o in p.opciones]

    if not 3 <= len(opciones) <= 6:
        raise ContenidoInvalido(f"Se esperaban entre 3 y 6 opciones y llegaron {len(opciones)}.")

    claves = [o.casefold() for o in opciones]
    if len(set(claves)) != len(claves):
        raise ContenidoInvalido("Hay opciones repetidas.")

    correcta_cruda = _texto(p.respuesta_correcta, "respuesta_correcta", 300)
    try:
        # Se normaliza al texto EXACTO de la opcion: el backend compara sin tolerancia.
        correcta = opciones[claves.index(correcta_cruda.casefold())]
    except ValueError:
        raise ContenidoInvalido("La respuesta correcta no esta entre las opciones.") from None

    # La IA tiende a poner la correcta primera o segunda: se reparte al azar.
    rng.shuffle(opciones)
    return enunciado, opciones, correcta, explicacion


def procesar_opcion_multiple(ia, rng=None):
    rng = rng or random.Random()
    if not 1 <= len(ia.preguntas) <= 8:
        raise ContenidoInvalido(f"Se esperaban entre 1 y 8 preguntas y llegaron {len(ia.preguntas)}.")

    preguntas = []
    for p in ia.preguntas:
        enunciado, opciones, correcta, explicacion = _pregunta_validada(p, rng)
        preguntas.append({
            "enunciado": enunciado,
            "opciones": opciones,
            "respuesta_correcta": correcta,
            "explicacion": explicacion,
        })

    return {"narrativa": _texto(ia.narrativa, "narrativa", MAX_LONGITUD_NARRATIVA), "preguntas": preguntas}


def _repartir_danio(cantidad_fases, total=DANIO_TOTAL):
    """Reparte 'total' de dano entre las fases, sin que sobre ni falte nada."""
    base = total // cantidad_fases
    resto = total - base * cantidad_fases
    return [base + (1 if i < resto else 0) for i in range(cantidad_fases)]


def procesar_batalla_de_jefe(ia, rng=None):
    rng = rng or random.Random()
    if not 3 <= len(ia.fases) <= 6:
        raise ContenidoInvalido(f"Se esperaban entre 3 y 6 fases y llegaron {len(ia.fases)}.")

    danios = _repartir_danio(len(ia.fases))
    fases = []
    for fase, danio in zip(ia.fases, danios):
        enunciado, opciones, correcta, explicacion = _pregunta_validada(fase, rng)

        penalizacion = (fase.penalizacion_fallo or "").strip().lower()
        if penalizacion not in PENALIZACIONES_VALIDAS:
            penalizacion = PENALIZACION_POR_DEFECTO  # vocabulario cerrado: el frontend solo sabe animar estos

        fases.append({
            "enunciado": enunciado,
            "opciones": opciones,
            "respuesta_correcta": correcta,
            "explicacion": explicacion,
            "danio_al_jefe": danio,
            "penalizacion_fallo": penalizacion,
        })

    return {
        "narrativa": _texto(ia.narrativa, "narrativa", MAX_LONGITUD_NARRATIVA),
        "nombre_jefe": _texto(ia.nombre_jefe, "nombre_jefe", 100),
        "hp_maximo": round(DANIO_TOTAL * PORCENTAJE_HP_PARA_DERROTA / 100),
        "fases": fases,
    }


def _mezclar_distinto(elementos, rng):
    """Mezcla una copia de la lista procurando que no quede en el orden original."""
    mezclados = list(elementos)
    if len(mezclados) < 2:
        return mezclados
    for _ in range(20):
        rng.shuffle(mezclados)
        if mezclados != list(elementos):
            break
    return mezclados


def procesar_linea_temporal(ia, rng=None):
    rng = rng or random.Random()

    descripciones = [_texto(d, "evento", 400) for d in ia.eventos_en_orden_correcto]
    cantidad = len(descripciones)
    if not 4 <= cantidad <= 7:
        raise ContenidoInvalido(f"Se esperaban entre 4 y 7 eventos y llegaron {cantidad}.")

    claves = [d.casefold() for d in descripciones]
    if len(set(claves)) != cantidad:
        raise ContenidoInvalido("Hay eventos repetidos.")

    if not 1 <= ia.indice_evento_culpable <= cantidad:
        raise ContenidoInvalido("El indice del evento culpable esta fuera de rango.")

    # La IA entrega los eventos en el orden correcto; ids y orden los pone el servicio.
    eventos = [
        {"id": f"ev{i + 1}", "descripcion": d, "orden_correcto": i + 1}
        for i, d in enumerate(descripciones)
    ]

    return {
        "narrativa": _texto(ia.narrativa, "narrativa", MAX_LONGITUD_NARRATIVA),
        "estado_erroneo_descripcion": _texto(ia.estado_erroneo_descripcion, "estado_erroneo_descripcion", 600),
        "eventos_desordenados": _mezclar_distinto(eventos, rng),
        "evento_culpable_id": f"ev{ia.indice_evento_culpable}",
        "explicacion": _texto(ia.explicacion, "explicacion", 1000),
    }
