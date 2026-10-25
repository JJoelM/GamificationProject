using Core.Application.Personajes.Proyecciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class ResolucionRegistradaConfiguration : IEntityTypeConfiguration<ResolucionRegistrada>
{
    public void Configure(EntityTypeBuilder<ResolucionRegistrada> builder)
    {
        builder.ToTable("resoluciones_registradas");
        builder.HasKey(r => r.Id);
        builder.HasIndex(r => new { r.AulaId, r.MisionId });
        builder.HasIndex(r => new { r.PersonajeId, r.Fecha });
        // FeedbackJson como texto plano -- no necesita ser jsonb porque
        // nunca se consulta por campos internos, solo se devuelve completo.
        builder.Property(r => r.FeedbackJson).HasColumnType("text");
    }
}
