using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMetricasPreguntaYXpGanado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "xp_ganado",
                table: "resoluciones_registradas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "metricas_preguntas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    aula_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mision_id = table.Column<Guid>(type: "uuid", nullable: false),
                    indice_pregunta = table.Column<int>(type: "integer", nullable: false),
                    enunciado = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    opcion_elegida = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    cantidad_fallos = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_metricas_preguntas", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_metricas_preguntas_aula_id_cantidad_fallos",
                table: "metricas_preguntas",
                columns: new[] { "aula_id", "cantidad_fallos" });

            migrationBuilder.CreateIndex(
                name: "ix_metricas_preguntas_aula_id_mision_id_indice_pregunta_opcion",
                table: "metricas_preguntas",
                columns: new[] { "aula_id", "mision_id", "indice_pregunta", "opcion_elegida" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "metricas_preguntas");

            migrationBuilder.DropColumn(
                name: "xp_ganado",
                table: "resoluciones_registradas");
        }
    }
}
