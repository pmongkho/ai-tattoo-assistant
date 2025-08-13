using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnet_server.Migrations
{
    /// <inheritdoc />
    public partial class ConsultationSquareLinkage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ContactPhone",
                table: "Consultations",
                newName: "SquareCustomerId");

            migrationBuilder.RenameColumn(
                name: "ContactFullName",
                table: "Consultations",
                newName: "SquareAppointmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SquareCustomerId",
                table: "Consultations",
                newName: "ContactPhone");

            migrationBuilder.RenameColumn(
                name: "SquareAppointmentId",
                table: "Consultations",
                newName: "ContactFullName");
        }
    }
}
