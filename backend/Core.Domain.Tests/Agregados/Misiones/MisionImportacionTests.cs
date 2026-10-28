using Core.Domain.Agregados.Misiones;
using Xunit;

namespace Core.Domain.Tests.Agregados.Misiones;

public class MisionImportacionTests
{
    private const string PayloadValido =
        """{"preguntas":[{"enunciado":"¿Pregunta?","opciones":["A","B","C","D"],"respuestaCorrecta":"A","explicacion":"Exp"}]}""";

    [Fact]
    public void MisionCopiada_EntraComoGeneradaYPreservaReferenciaAlOrigen()
    {
        var docenteId = Guid.NewGuid();
        var aulaOrigenId = Guid.NewGuid();
        var aulaDestinoId = Guid.NewGuid();
        var originalId = Guid.NewGuid();
        var nuevoId = Guid.NewGuid();

        var original = Mision.Generar(
            docenteId, aulaOrigenId, "Historia Argentina", "Texto fuente original",
            "Narrativa épica", "OpcionMultiple", PayloadValido, 90, 100, originalId);

        original.Validar(docenteId);
        Assert.Equal(EstadoMision.Validada, original.Estado);

        // Copia hacia el aula de destino
        var copia = Mision.Generar(
            docenteId, aulaDestinoId, original.TemaCurricular, "",
            original.Narrativa, original.TipoPlantilla, original.PayloadJson,
            original.NivelConfianzaIA, original.RecompensaXp,
            misionId: nuevoId, misionOrigenId: original.Id);

        // La copia nace independiente en estado Generada (Pendiente de validación)
        Assert.Equal(EstadoMision.Generada, copia.Estado);
        Assert.Equal(nuevoId, copia.Id);
        Assert.Equal(aulaDestinoId, copia.AulaId);
        Assert.Equal(original.Id, copia.MisionOrigenId);

        // Editar la copia no altera la original
        copia.Editar(docenteId, "Nueva narrativa editada en el aula de destino", PayloadValido, 120);
        Assert.Equal("Nueva narrativa editada en el aula de destino", copia.Narrativa);
        Assert.Equal("Narrativa épica", original.Narrativa);
        Assert.Equal(120, copia.RecompensaXp);
        Assert.Equal(100, original.RecompensaXp);
    }

    [Fact]
    public void RemapeoDeConexiones_PreservaAristasInternasYDescartaExternas()
    {
        var docenteId = Guid.NewGuid();
        var aulaOrigenId = Guid.NewGuid();
        var aulaDestinoId = Guid.NewGuid();

        // 3 misiones en origen con dependencias: M1 -> M2 -> M3
        var idM1 = Guid.NewGuid();
        var idM2 = Guid.NewGuid();
        var idM3 = Guid.NewGuid();

        var idNuevo1 = Guid.NewGuid();
        var idNuevo2 = Guid.NewGuid();
        // Solo se importan M1 y M2 (M3 queda afuera)
        var mapping = new Dictionary<Guid, Guid>
        {
            [idM1] = idNuevo1,
            [idM2] = idNuevo2,
        };

        var origConexionesM1 = new List<Guid> { idM2, idM3 };

        // Al remapear: M2 está en el lote (pasa a idNuevo2), pero M3 no está (se descarta)
        var remapeadasM1 = origConexionesM1
            .Where(dest => mapping.ContainsKey(dest))
            .Select(dest => mapping[dest])
            .ToList();

        Assert.Single(remapeadasM1);
        Assert.Equal(idNuevo2, remapeadasM1[0]);

        var nuevaM1 = Mision.Generar(
            docenteId, aulaDestinoId, "Tema 1", "", "Narrativa 1", "OpcionMultiple",
            PayloadValido, 90, 80, idNuevo1, idM1);

        nuevaM1.DefinirMisionesSugeridas(docenteId, remapeadasM1);

        Assert.Single(nuevaM1.MisionesSugeridas);
        Assert.Equal(idNuevo2, nuevaM1.MisionesSugeridas[0]);
    }
}
