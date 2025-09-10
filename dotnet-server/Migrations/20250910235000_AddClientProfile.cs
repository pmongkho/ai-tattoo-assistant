using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace dotnet_server.Migrations
{
    /// <inheritdoc />
    public partial class AddClientProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClientProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientProfiles", x => x.Id);
                });

            migrationBuilder.AddColumn<Guid>(
                name: "ClientProfileId",
                table: "Consultations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_ClientProfileId",
                table: "Consultations",
                column: "ClientProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_ClientProfiles_ClientProfileId",
                table: "Consultations",
                column: "ClientProfileId",
                principalTable: "ClientProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_ClientProfiles_ClientProfileId",
                table: "Consultations");

            migrationBuilder.DropIndex(
                name: "IX_Consultations_ClientProfileId",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "ClientProfileId",
                table: "Consultations");

            migrationBuilder.DropTable(
                name: "ClientProfiles");
        }
    }
}

