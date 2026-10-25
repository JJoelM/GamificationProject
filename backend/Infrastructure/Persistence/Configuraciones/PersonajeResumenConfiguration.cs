using Core.Application.Personajes.Proyecciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class PersonajeResumenConfiguration : IEntityTypeConfiguration<PersonajeResumen>
{
    public void Configure(EntityTypeBuilder<PersonajeResumen> builder)
    {
        builder.ToTable("personajes_resumen");
        builder.HasKey(p => p.PersonajeId);
        builder.HasIndex(p => p.AulaId);
        builder.HasIndex(p => new { p.AulaId, p.ExperienciaXP });
        builder.Property(p => p.AvatarEquipado).HasMaxLength(100);
        builder.Property(p => p.MarcoEquipado).HasMaxLength(100);
        builder.Property(p => p.MascotaEquipada).HasMaxLength(100);
        builder.Property(p => p.TituloEquipado).HasMaxLength(100);
    }
}
