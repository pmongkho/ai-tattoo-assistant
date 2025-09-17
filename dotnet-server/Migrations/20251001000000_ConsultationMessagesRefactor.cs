using System;
using DotNet.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnet_server.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20251001000000_ConsultationMessagesRefactor")]
    public partial class ConsultationMessagesRefactor : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CurrentStep",
                table: "Consultations",
                type: "text",
                nullable: false,
                defaultValue: "subject");

            migrationBuilder.AddColumn<string>(
                name: "SquareSyncError",
                table: "Consultations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ArtistUserId",
                table: "Tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalHandle",
                table: "ClientProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ConsultationMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConsultationId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsultationMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsultationMessages_Consultations_ConsultationId",
                        column: x => x.ConsultationId,
                        principalTable: "Consultations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationMessages_ConsultationId_OrderIndex",
                table: "ConsultationMessages",
                columns: new[] { "ConsultationId", "OrderIndex" },
                unique: true);

            migrationBuilder.Sql(@"
                INSERT INTO ""ConsultationMessages"" (""Id"", ""ConsultationId"", ""OrderIndex"", ""Role"", ""Content"", ""ImageUrl"", ""CreatedAt"")
                SELECT md5(random()::text || clock_timestamp()::text)::uuid,
                       c.""Id"",
                       elem.ordinality - 1,
                       elem.value->>'role',
                       elem.value->>'content',
                       elem.value->>'image_url',
                       c.""SubmittedAt""
                FROM ""Consultations"" c
                CROSS JOIN LATERAL jsonb_array_elements(
                    CASE
                        WHEN NULLIF(trim(c.""ChatHistory""), '') IS NULL THEN '[]'::jsonb
                        ELSE c.""ChatHistory""::jsonb
                    END
                ) WITH ORDINALITY AS elem(value, ordinality);
            ");

            migrationBuilder.DropColumn(
                name: "ChatHistory",
                table: "Consultations");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChatHistory",
                table: "Consultations",
                type: "text",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.Sql(@"
                UPDATE ""Consultations"" c
                SET ""ChatHistory"" = COALESCE((
                    SELECT jsonb_agg(jsonb_build_object(
                        'role', m.""Role"",
                        'content', m.""Content"",
                        'image_url', m.""ImageUrl""
                    ) ORDER BY m.""OrderIndex"")
                    FROM ""ConsultationMessages"" m
                    WHERE m.""ConsultationId"" = c.""Id""
                ), '[]'::jsonb)::text;
            ");

            migrationBuilder.DropTable(
                name: "ConsultationMessages");

            migrationBuilder.DropColumn(
                name: "CurrentStep",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "SquareSyncError",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "ArtistUserId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ExternalHandle",
                table: "ClientProfiles");
        }
    }
}
