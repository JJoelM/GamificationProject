using Core.Domain.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class InscripcionConfiguration : IEntityTypeConfiguration<Inscripcion>
{
    public void Configure(EntityTypeBuilder<Inscripcion> builder)
    {
        builder.ToTable("inscripciones");
        builder.HasKey(i => new { i.AulaId, i.AlumnoId }); // clave compuesta, no un Id sintético

        builder.HasOne(i => i.Aula)
               .WithMany(a => a.Inscripciones)
               .HasForeignKey(i => i.AulaId)
               .OnDelete(DeleteBehavior.Cascade); // si se borra el aula, sus inscripciones también

        builder.HasOne(i => i.Alumno)
               .WithMany()
               .HasForeignKey(i => i.AlumnoId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
