using Core.Application.Misiones.Proyecciones;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configuraciones;

public class BorradorIAConfiguration : IEntityTypeConfiguration<BorradorIA>
{
    public void Configure(EntityTypeBuilder<BorradorIA> builder)
    {
        builder.ToTable("borradores_ia");
        builder.HasKey(b => b.MisionId);

        builder.Property(b => b.PayloadJson).HasColumnType("jsonb");
        builder.Property(b => b.EstadoValidacion).HasMaxLength(20);

        // Sin FK hacia usuarios/aulas a propósito: es una proyección de
        // lectura, se reconstruye a partir del Ledger, no participa del
        // modelo relacional normalizado de las tablas de referencia.
    }
}
