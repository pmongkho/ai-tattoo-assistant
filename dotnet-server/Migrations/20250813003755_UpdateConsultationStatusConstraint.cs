using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnet_server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateConsultationStatusConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Consultations_Status",
                table: "Consultations");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Consultations_Status",
                table: "Consultations",
                sql: "\"Status\" IN ('draft', 'awaiting-review', 'submitted-to-square', 'approved', 'rejected')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Consultations_Status",
                table: "Consultations");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Consultations_Status",
                table: "Consultations",
                sql: "\"Status\" IN ('pending', 'approved', 'rejected')");
        }
    }
}
