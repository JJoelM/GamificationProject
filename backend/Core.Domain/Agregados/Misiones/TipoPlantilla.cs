namespace Core.Domain.Agregados.Misiones;

// Reemplaza los magic strings "OpcionMultiple", "BatallaDeJefe", "LineaTemporal"
// dispersos en Mision.cs, SolicitarGeneracionDeMisionCommand.cs y los tests.
// Al agregar un tipo nuevo, el compilador fuerza actualizar todos los switch
// exhaustivos -- sin esto, un typo en el string pasa silenciosamente.
public enum TipoPlantilla
{
    OpcionMultiple,
    BatallaDeJefe,
    LineaTemporal
}
