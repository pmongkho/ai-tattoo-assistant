using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnet_server.Migrations
{
    public partial class MakeConsultationClientIdNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_AspNetUsers_ClientId",
                table: "Consultations");

            migrationBuilder.AlterColumn<string>(
                name: "ClientId",
                table: "Consultations",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_AspNetUsers_ClientId",
                table: "Consultations",
                column: "ClientId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_AspNetUsers_ClientId",
                table: "Consultations");

            migrationBuilder.AlterColumn<string>(
                name: "ClientId",
                table: "Consultations",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_AspNetUsers_ClientId",
                table: "Consultations",
                column: "ClientId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
