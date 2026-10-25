using Core.Application.Misiones.Proyecciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class FichaGrimorioConfiguration : IEntityTypeConfiguration<FichaGrimorio>
{
    public void Configure(EntityTypeBuilder<FichaGrimorio> builder)
    {
        builder.ToTable("fichas_grimorio");
        builder.HasKey(f => f.FichaId);
        builder.HasIndex(f => f.AulaId);
        builder.HasIndex(f => f.MisionId).IsUnique(); // una ficha por mision
        builder.Property(f => f.TemaCurricular).HasMaxLength(200);
        builder.Property(f => f.ConceptosClave).HasColumnType("jsonb");
    }
}

public class FichaGrimorioDesbloqueadaConfiguration : IEntityTypeConfiguration<FichaGrimorioDesbloqueada>
{
    public void Configure(EntityTypeBuilder<FichaGrimorioDesbloqueada> builder)
    {
        builder.ToTable("fichas_grimorio_desbloqueadas");
        builder.HasKey(d => new { d.FichaId, d.AlumnoId });
    }
}
