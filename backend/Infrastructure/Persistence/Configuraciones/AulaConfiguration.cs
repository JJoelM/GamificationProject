using Core.Domain.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class AulaConfiguration : IEntityTypeConfiguration<Aula>
{
    public void Configure(EntityTypeBuilder<Aula> builder)
    {
        builder.ToTable("aulas");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Nombre).IsRequired().HasMaxLength(200);

        builder.Property(a => a.CodigoInvitacion).IsRequired().HasMaxLength(16);
        builder.HasIndex(a => a.CodigoInvitacion).IsUnique();

        builder.HasOne(a => a.Docente)
               .WithMany()
               .HasForeignKey(a => a.DocenteId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}