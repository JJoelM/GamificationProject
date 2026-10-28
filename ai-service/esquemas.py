"""
Modelos de pydantic.

*IA: lo que se le pide a Gemini (response_schema). Son datos puros y sin
restricciones a proposito: las reglas viven en contenido.py, donde se prueban.
*Generada: lo que este servicio le devuelve al backend de C#. Los nombres van en
snake_case y el backend los mapea a su propio modelo.
"""
from pydantic import BaseModel, Field


class GenerarRequest(BaseModel):
    tema_curricular: str = Field(min_length=1, max_length=200)
    texto_fuente: str = Field(min_length=1, max_length=20_000)


# ---------- Lo que se le pide a Gemini ----------

class PreguntaIA(BaseModel):
    enunciado: str
    opciones: list[str]
    respuesta_correcta: str
    explicacion: str


class OpcionMultipleIA(BaseModel):
    narrativa: str
    preguntas: list[PreguntaIA]


class FaseIA(BaseModel):
    enunciado: str
    opciones: list[str]
    respuesta_correcta: str
    explicacion: str
    penalizacion_fallo: str


class BatallaDeJefeIA(BaseModel):
    narrativa: str
    nombre_jefe: str
    fases: list[FaseIA]


class LineaTemporalIA(BaseModel):
    narrativa: str
    estado_erroneo_descripcion: str
    eventos_en_orden_correcto: list[str]
    indice_evento_culpable: int
    explicacion: str


# ---------- Lo que devuelve este servicio ----------

class PreguntaGenerada(BaseModel):
    enunciado: str
    opciones: list[str]
    respuesta_correcta: str
    explicacion: str


class OpcionMultipleGenerada(BaseModel):
    narrativa: str
    preguntas: list[PreguntaGenerada]


class FaseGenerada(BaseModel):
    enunciado: str
    opciones: list[str]
    respuesta_correcta: str
    explicacion: str
    danio_al_jefe: int
    penalizacion_fallo: str


class BatallaDeJefeGenerada(BaseModel):
    narrativa: str
    nombre_jefe: str
    hp_maximo: int
    fases: list[FaseGenerada]


class EventoGenerado(BaseModel):
    id: str
    descripcion: str
    orden_correcto: int


class LineaTemporalGenerada(BaseModel):
    narrativa: str
    estado_erroneo_descripcion: str
    eventos_desordenados: list[EventoGenerado]
    evento_culpable_id: str
    explicacion: str
