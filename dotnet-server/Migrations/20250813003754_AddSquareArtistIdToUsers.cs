using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnet_server.Migrations
{
    /// <inheritdoc />
    public partial class AddSquareArtistIdToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationUserId",
                table: "Consultations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SquareArtistId",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_ApplicationUserId",
                table: "Consultations",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_SquareArtistId",
                table: "AspNetUsers",
                column: "SquareArtistId");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_AspNetUsers_ApplicationUserId",
                table: "Consultations",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_AspNetUsers_ApplicationUserId",
                table: "Consultations");

            migrationBuilder.DropIndex(
                name: "IX_Consultations_ApplicationUserId",
                table: "Consultations");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_SquareArtistId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "SquareArtistId",
                table: "AspNetUsers");
        }
    }
}
