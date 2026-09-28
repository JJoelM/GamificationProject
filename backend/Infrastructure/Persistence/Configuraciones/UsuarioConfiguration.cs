using Core.Domain.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.NombreCompleto).IsRequired().HasMaxLength(200);
        builder.Property(u => u.PasswordHash).HasMaxLength(500);
        builder.Property(u => u.EmailTutor).HasMaxLength(256);
        builder.Property(u => u.EstadoCuenta).HasConversion<string>().HasMaxLength(40);

        builder.HasOne(u => u.Rol)
               .WithMany()
               .HasForeignKey(u => u.RolId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}