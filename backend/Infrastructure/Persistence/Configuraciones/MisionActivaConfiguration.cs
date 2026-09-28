using Core.Application.Misiones.Proyecciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class MisionActivaConfiguration : IEntityTypeConfiguration<MisionActiva>
{
    public void Configure(EntityTypeBuilder<MisionActiva> builder)
    {
        builder.ToTable("misiones_activas");
        builder.HasKey(m => m.MisionId);
        builder.Property(m => m.PayloadJson).HasColumnType("jsonb");
    }
}
