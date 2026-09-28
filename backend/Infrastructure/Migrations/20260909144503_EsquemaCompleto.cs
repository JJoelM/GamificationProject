using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EsquemaCompleto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "borradores_ia",
                columns: table => new
                {
                    mision_id = table.Column<Guid>(type: "uuid", nullable: false),
                    docente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    aula_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tema_curricular = table.Column<string>(type: "text", nullable: false),
                    narrativa = table.Column<string>(type: "text", nullable: false),
                    tipo_plantilla = table.Column<string>(type: "text", nullable: false),
                    payload_json = table.Column<string>(type: "jsonb", nullable: false),
                    nivel_confianza_ia = table.Column<int>(type: "integer", nullable: false),
                    recompensa_xp_sugerida = table.Column<int>(type: "integer", nullable: false),
                    estado_validacion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    motivo_rechazo = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_borradores_ia", x => x.mision_id);
                });

            migrationBuilder.CreateTable(
                name: "eventos_almacenados",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    aggregate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    tipo_agregado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    tipo_evento = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    ocurrido_en = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_eventos_almacenados", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "misiones_activas",
                columns: table => new
                {
                    mision_id = table.Column<Guid>(type: "uuid", nullable: false),
                    docente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    aula_id = table.Column<Guid>(type: "uuid", nullable: false),
                    narrativa = table.Column<string>(type: "text", nullable: false),
                    tipo_plantilla = table.Column<string>(type: "text", nullable: false),
                    payload_json = table.Column<string>(type: "jsonb", nullable: false),
                    recompensa_xp = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_misiones_activas", x => x.mision_id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    nombre_completo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    rol_id = table.Column<Guid>(type: "uuid", nullable: false),
                    password_hash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_nacimiento = table.Column<DateOnly>(type: "date", nullable: true),
                    email_tutor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    estado_cuenta = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuarios", x => x.id);
                    table.ForeignKey(
                        name: "fk_usuarios_roles_rol_id",
                        column: x => x.rol_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "aulas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    docente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo_invitacion = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_aulas", x => x.id);
                    table.ForeignKey(
                        name: "fk_aulas_usuarios_docente_id",
                        column: x => x.docente_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "inscripciones",
                columns: table => new
                {
                    aula_id = table.Column<Guid>(type: "uuid", nullable: false),
                    alumno_id = table.Column<Guid>(type: "uuid", nullable: false),
                    fecha_inscripcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inscripciones", x => new { x.aula_id, x.alumno_id });
                    table.ForeignKey(
                        name: "fk_inscripciones_aulas_aula_id",
                        column: x => x.aula_id,
                        principalTable: "aulas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_inscripciones_usuarios_alumno_id",
                        column: x => x.alumno_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_aulas_codigo_invitacion",
                table: "aulas",
                column: "codigo_invitacion",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_aulas_docente_id",
                table: "aulas",
                column: "docente_id");

            migrationBuilder.CreateIndex(
                name: "ix_eventos_almacenados_aggregate_id_version",
                table: "eventos_almacenados",
                columns: new[] { "aggregate_id", "version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_inscripciones_alumno_id",
                table: "inscripciones",
                column: "alumno_id");

            migrationBuilder.CreateIndex(
                name: "ix_roles_nombre",
                table: "roles",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_usuarios_email",
                table: "usuarios",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_usuarios_rol_id",
                table: "usuarios",
                column: "rol_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "borradores_ia");

            migrationBuilder.DropTable(
                name: "eventos_almacenados");

            migrationBuilder.DropTable(
                name: "inscripciones");

            migrationBuilder.DropTable(
                name: "misiones_activas");

            migrationBuilder.DropTable(
                name: "aulas");

            migrationBuilder.DropTable(
                name: "usuarios");

            migrationBuilder.DropTable(
                name: "roles");
        }
    }
}
