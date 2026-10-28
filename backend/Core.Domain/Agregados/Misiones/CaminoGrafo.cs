namespace Core.Domain.Agregados.Misiones;

// Logica pura sobre el grafo de misiones sugeridas. Vive en Domain para poder
// testearse sin base de datos y para que Application no reimplemente reglas.
public static class CaminoGrafo
{
    // true si al definir origen -> destinos aparece un ciclo. 'aristas' NO debe
    // incluir las aristas salientes actuales de 'origen' (se van a reemplazar).
    public static bool GeneraCiclo(
        Guid origen, IEnumerable<Guid> destinos, IEnumerable<(Guid Origen, Guid Destino)> aristas)
    {
        var adyacencia = aristas
            .GroupBy(a => a.Origen)
            .ToDictionary(g => g.Key, g => g.Select(a => a.Destino).ToList());

        var visitados = new HashSet<Guid>();
        var pila = new Stack<Guid>(destinos);

        while (pila.Count > 0)
        {
            var actual = pila.Pop();
            if (actual == origen) return true;
            if (!visitados.Add(actual)) continue;
            if (adyacencia.TryGetValue(actual, out var siguientes))
                foreach (var s in siguientes) pila.Push(s);
        }
        return false;
    }

    // Nivel = camino mas largo desde una raiz (0 = sin misiones previas sugeridas).
    // Se calcula en el servidor para que el frontend solo tenga que dibujar columnas.
    public static Dictionary<Guid, int> CalcularNiveles(
        IEnumerable<Guid> nodos, IEnumerable<(Guid Origen, Guid Destino)> aristas)
    {
        var lista = nodos.ToList();
        var conjunto = lista.ToHashSet();
        var validas = aristas
            .Where(a => conjunto.Contains(a.Origen) && conjunto.Contains(a.Destino))
            .Distinct()
            .ToList();

        var entrantes = lista.ToDictionary(n => n, _ => 0);
        foreach (var a in validas) entrantes[a.Destino]++;

        var niveles = lista.ToDictionary(n => n, _ => 0);
        var salientes = validas
            .GroupBy(a => a.Origen)
            .ToDictionary(g => g.Key, g => g.Select(a => a.Destino).ToList());

        var cola = new Queue<Guid>(lista.Where(n => entrantes[n] == 0));
        while (cola.Count > 0)
        {
            var actual = cola.Dequeue();
            if (!salientes.TryGetValue(actual, out var destinos)) continue;
            foreach (var d in destinos)
            {
                niveles[d] = Math.Max(niveles[d], niveles[actual] + 1);
                if (--entrantes[d] == 0) cola.Enqueue(d);
            }
        }
        return niveles;
    }
}
