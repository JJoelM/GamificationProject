using Core.Application.Misiones.Proyecciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class ConexionMisionConfiguration : IEntityTypeConfiguration<ConexionMision>
{
    public void Configure(EntityTypeBuilder<ConexionMision> builder)
    {
        builder.ToTable("conexiones_mision");
        builder.HasKey(c => new { c.MisionOrigenId, c.MisionDestinoId });

        builder.Property(c => c.AulaId).IsRequired();
    }
}
