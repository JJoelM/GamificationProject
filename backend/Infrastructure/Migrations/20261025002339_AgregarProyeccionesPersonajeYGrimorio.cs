using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregarProyeccionesPersonajeYGrimorio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "esta_visible",
                table: "misiones_activas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "fichas_grimorio",
                columns: table => new
                {
                    ficha_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mision_id = table.Column<Guid>(type: "uuid", nullable: false),
                    aula_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tema_curricular = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    narrativa = table.Column<string>(type: "text", nullable: false),
                    conceptos_clave = table.Column<string>(type: "jsonb", nullable: false),
                    creada_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_fichas_grimorio", x => x.ficha_id);
                });

            migrationBuilder.CreateTable(
                name: "fichas_grimorio_desbloqueadas",
                columns: table => new
                {
                    ficha_id = table.Column<Guid>(type: "uuid", nullable: false),
                    alumno_id = table.Column<Guid>(type: "uuid", nullable: false),
                    desbloqueda_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_fichas_grimorio_desbloqueadas", x => new { x.ficha_id, x.alumno_id });
                });

            migrationBuilder.CreateTable(
                name: "personajes_resumen",
                columns: table => new
                {
                    personaje_id = table.Column<Guid>(type: "uuid", nullable: false),
                    alumno_id = table.Column<Guid>(type: "uuid", nullable: false),
                    aula_id = table.Column<Guid>(type: "uuid", nullable: false),
                    experiencia_xp = table.Column<int>(type: "integer", nullable: false),
                    puntos_accion_ap = table.Column<int>(type: "integer", nullable: false),
                    racha_dias_activos = table.Column<int>(type: "integer", nullable: false),
                    misiones_completadas = table.Column<int>(type: "integer", nullable: false),
                    avatar_equipado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    marco_equipado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    mascota_equipada = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_personajes_resumen", x => x.personaje_id);
                });

            migrationBuilder.CreateTable(
                name: "resoluciones_registradas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    personaje_id = table.Column<Guid>(type: "uuid", nullable: false),
                    alumno_id = table.Column<Guid>(type: "uuid", nullable: false),
                    aula_id = table.Column<Guid>(type: "uuid", nullable: false),
                    mision_id = table.Column<Guid>(type: "uuid", nullable: false),
                    numero_de_intento = table.Column<int>(type: "integer", nullable: false),
                    porcentaje_correcto = table.Column<int>(type: "integer", nullable: false),
                    es_repaso = table.Column<bool>(type: "boolean", nullable: false),
                    feedback_json = table.Column<string>(type: "text", nullable: false),
                    fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    ocurrido_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_resoluciones_registradas", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_fichas_grimorio_aula_id",
                table: "fichas_grimorio",
                column: "aula_id");

            migrationBuilder.CreateIndex(
                name: "ix_fichas_grimorio_mision_id",
                table: "fichas_grimorio",
                column: "mision_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_personajes_resumen_aula_id",
                table: "personajes_resumen",
                column: "aula_id");

            migrationBuilder.CreateIndex(
                name: "ix_personajes_resumen_aula_id_experiencia_xp",
                table: "personajes_resumen",
                columns: new[] { "aula_id", "experiencia_xp" });

            migrationBuilder.CreateIndex(
                name: "ix_resoluciones_registradas_aula_id_mision_id",
                table: "resoluciones_registradas",
                columns: new[] { "aula_id", "mision_id" });

            migrationBuilder.CreateIndex(
                name: "ix_resoluciones_registradas_personaje_id_fecha",
                table: "resoluciones_registradas",
                columns: new[] { "personaje_id", "fecha" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "fichas_grimorio");

            migrationBuilder.DropTable(
                name: "fichas_grimorio_desbloqueadas");

            migrationBuilder.DropTable(
                name: "personajes_resumen");

            migrationBuilder.DropTable(
                name: "resoluciones_registradas");

            migrationBuilder.DropColumn(
                name: "esta_visible",
                table: "misiones_activas");
        }
    }
}
