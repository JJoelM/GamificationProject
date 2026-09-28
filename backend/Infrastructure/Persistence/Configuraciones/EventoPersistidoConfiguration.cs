using Infrastructure.EventStore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class EventoPersistidoConfiguration : IEntityTypeConfiguration<EventoPersistido>
{
    public void Configure(EntityTypeBuilder<EventoPersistido> builder)
    {
        builder.ToTable("eventos_almacenados");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).UseIdentityAlwaysColumn(); // orden total, la app nunca lo asigna

        builder.Property(e => e.TipoAgregado).IsRequired().HasMaxLength(100);
        builder.Property(e => e.TipoEvento).IsRequired().HasMaxLength(150);
        builder.Property(e => e.Payload).HasColumnType("jsonb").IsRequired();

        // La restricción que sostiene todo el argumento de "registro confiable":
        // Postgres rechaza el segundo insert si dos comandos intentan escribir
        // la misma versión del mismo agregado a la vez (concurrencia optimista).
        builder.HasIndex(e => new { e.AggregateId, e.Version }).IsUnique();
    }
}
