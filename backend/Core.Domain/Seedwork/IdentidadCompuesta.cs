using System.Security.Cryptography;

namespace Core.Domain.SeedWork;

// Deriva un Guid deterministico a partir de dos Guids -- el mismo par de
// entrada siempre da el mismo resultado, via SHA-256 (no XOR: XOR es
// conmutativo, mas facil de razonar mal). No hace falta guardar el mapeo en
// ningun lado, ni tocar el esquema de EventoPersistido -- sigue siendo un
// solo Guid como AggregateId.
public static class IdentidadCompuesta
{
    public static Guid Combinar(Guid a, Guid b)
    {
        var bytes = new byte[32];
        a.TryWriteBytes(bytes.AsSpan(0, 16));
        b.TryWriteBytes(bytes.AsSpan(16, 16));

        var hash = SHA256.HashData(bytes);
        return new Guid(hash[..16]);
    }
}
