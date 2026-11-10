using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMisionOrigenId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE misiones_activas ADD COLUMN IF NOT EXISTS mision_origen_id uuid;
                ALTER TABLE borradores_ia ADD COLUMN IF NOT EXISTS mision_origen_id uuid;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "mision_origen_id",
                table: "misiones_activas");

            migrationBuilder.DropColumn(
                name: "mision_origen_id",
                table: "borradores_ia");
        }
    }
}
