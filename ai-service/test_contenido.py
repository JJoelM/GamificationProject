"""Pruebas de contenido.py. Corren con la libreria estandar: python -m unittest -v"""
import random
import unittest
from types import SimpleNamespace as NS

import contenido as c


def pregunta(opciones=("A", "B", "C", "D"), correcta="A", **extra):
    return NS(enunciado="Que es X?", opciones=list(opciones), respuesta_correcta=correcta,
              explicacion="Porque si.", **extra)


def fase(**kw):
    return pregunta(penalizacion_fallo=kw.pop("penalizacion_fallo", "temblor"), **kw)


def linea(eventos=("uno", "dos", "tres", "cuatro", "cinco"), culpable=3):
    return NS(narrativa="n", estado_erroneo_descripcion="Salio mal", eventos_en_orden_correcto=list(eventos),
              indice_evento_culpable=culpable, explicacion="Por el paso 3")


class OpcionMultiple(unittest.TestCase):
    def test_normaliza_la_respuesta_al_texto_exacto_de_la_opcion(self):
        ia = NS(narrativa="n", preguntas=[pregunta(opciones=("Alfa", "Beta", "Gamma"), correcta="  beta ")])
        r = c.procesar_opcion_multiple(ia, random.Random(1))
        self.assertEqual("Beta", r["preguntas"][0]["respuesta_correcta"])

    def test_la_correcta_sigue_estando_entre_las_opciones_tras_mezclar(self):
        ia = NS(narrativa="n", preguntas=[pregunta()])
        for semilla in range(30):
            p = c.procesar_opcion_multiple(ia, random.Random(semilla))["preguntas"][0]
            self.assertIn(p["respuesta_correcta"], p["opciones"])
            self.assertEqual(["A", "B", "C", "D"], sorted(p["opciones"]))

    def test_la_posicion_de_la_correcta_no_queda_fija(self):
        ia = NS(narrativa="n", preguntas=[pregunta()])
        posiciones = {c.procesar_opcion_multiple(ia, random.Random(s))["preguntas"][0]["opciones"].index("A")
                      for s in range(40)}
        self.assertGreater(len(posiciones), 1)

    def test_rechaza_respuesta_que_no_esta_en_las_opciones(self):
        with self.assertRaises(c.ContenidoInvalido):
            c.procesar_opcion_multiple(NS(narrativa="n", preguntas=[pregunta(correcta="Z")]))

    def test_rechaza_opciones_repetidas_sin_importar_mayusculas(self):
        with self.assertRaises(c.ContenidoInvalido):
            c.procesar_opcion_multiple(NS(narrativa="n", preguntas=[pregunta(opciones=("A", "a", "B"))]))

    def test_rechaza_menos_de_tres_opciones(self):
        with self.assertRaises(c.ContenidoInvalido):
            c.procesar_opcion_multiple(NS(narrativa="n", preguntas=[pregunta(opciones=("A", "B"))]))

    def test_rechaza_narrativa_vacia_y_sin_preguntas(self):
        with self.assertRaises(c.ContenidoInvalido):
            c.procesar_opcion_multiple(NS(narrativa="  ", preguntas=[pregunta()]))
        with self.assertRaises(c.ContenidoInvalido):
            c.procesar_opcion_multiple(NS(narrativa="n", preguntas=[]))


class BatallaDeJefe(unittest.TestCase):
    def test_el_danio_siempre_suma_exactamente_100(self):
        for n in (3, 4, 5, 6):
            ia = NS(narrativa="n", nombre_jefe="El Bug", fases=[fase() for _ in range(n)])
            r = c.procesar_batalla_de_jefe(ia, random.Random(1))
            self.assertEqual(100, sum(f["danio_al_jefe"] for f in r["fases"]))

    def test_el_hp_permite_derrotar_al_jefe_sin_acertar_todo(self):
        ia = NS(narrativa="n", nombre_jefe="El Bug", fases=[fase() for _ in range(5)])
        r = c.procesar_batalla_de_jefe(ia, random.Random(1))
        self.assertEqual(70, r["hp_maximo"])
        self.assertLessEqual(r["hp_maximo"], sum(f["danio_al_jefe"] for f in r["fases"]))

    def test_penalizacion_desconocida_cae_al_default(self):
        ia = NS(narrativa="n", nombre_jefe="J",
                fases=[fase(penalizacion_fallo="Ceguera_UI"), fase(penalizacion_fallo=" DESTELLO "), fase(penalizacion_fallo="temblor")])
        pens = [f["penalizacion_fallo"] for f in c.procesar_batalla_de_jefe(ia, random.Random(1))["fases"]]
        self.assertEqual(["destello", "destello", "temblor"], pens)

    def test_rechaza_cantidad_de_fases_fuera_de_rango(self):
        for n in (2, 7):
            with self.assertRaises(c.ContenidoInvalido):
                c.procesar_batalla_de_jefe(NS(narrativa="n", nombre_jefe="J", fases=[fase() for _ in range(n)]))


class LineaTemporal(unittest.TestCase):
    def test_el_servicio_asigna_ids_y_orden_correcto(self):
        r = c.procesar_linea_temporal(linea(), random.Random(3))
        por_id = {e["id"]: e for e in r["eventos_desordenados"]}
        self.assertEqual({"ev1", "ev2", "ev3", "ev4", "ev5"}, set(por_id))
        self.assertEqual("tres", por_id["ev3"]["descripcion"])
        self.assertEqual([1, 2, 3, 4, 5], sorted(e["orden_correcto"] for e in r["eventos_desordenados"]))

    def test_el_culpable_apunta_al_evento_correcto(self):
        r = c.procesar_linea_temporal(linea(culpable=2), random.Random(3))
        self.assertEqual("ev2", r["evento_culpable_id"])

    def test_nunca_devuelve_los_eventos_en_el_orden_correcto(self):
        for semilla in range(50):
            r = c.procesar_linea_temporal(linea(), random.Random(semilla))
            self.assertNotEqual([1, 2, 3, 4, 5], [e["orden_correcto"] for e in r["eventos_desordenados"]])

    def test_rechaza_culpable_fuera_de_rango(self):
        for indice in (0, 6):
            with self.assertRaises(c.ContenidoInvalido):
                c.procesar_linea_temporal(linea(culpable=indice))

    def test_rechaza_eventos_repetidos_y_cantidad_invalida(self):
        with self.assertRaises(c.ContenidoInvalido):
            c.procesar_linea_temporal(linea(eventos=("uno", "UNO", "tres", "cuatro")))
        with self.assertRaises(c.ContenidoInvalido):
            c.procesar_linea_temporal(linea(eventos=("uno", "dos", "tres"), culpable=1))
        with self.assertRaises(c.ContenidoInvalido):
            c.procesar_linea_temporal(linea(eventos=tuple(f"e{i}" for i in range(8)), culpable=1))


if __name__ == "__main__":
    unittest.main()
