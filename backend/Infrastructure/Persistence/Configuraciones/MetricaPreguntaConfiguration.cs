using Core.Application.Misiones.Proyecciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class MetricaPreguntaConfiguration : IEntityTypeConfiguration<MetricaPregunta>
{
    public void Configure(EntityTypeBuilder<MetricaPregunta> builder)
    {
        builder.ToTable("metricas_preguntas");
        builder.HasKey(m => m.Id);
        builder.HasIndex(m => new { m.AulaId, m.MisionId, m.IndicePregunta, m.OpcionElegida }).IsUnique();
        builder.HasIndex(m => new { m.AulaId, m.CantidadFallos });
        builder.Property(m => m.Enunciado).HasMaxLength(1000).IsRequired();
        builder.Property(m => m.OpcionElegida).HasMaxLength(500).IsRequired();
    }
}
