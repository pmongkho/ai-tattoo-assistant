using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dotnet_server.Migrations
{
    public partial class CreateTenantsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    MetaPageId = table.Column<string>(type: "text", nullable: true),
                    InstagramAccountId = table.Column<string>(type: "text", nullable: true),
                    EncryptedPageAccessToken = table.Column<string>(type: "text", nullable: true),
                    EncryptedInstagramToken = table.Column<string>(type: "text", nullable: true),
                    Plan = table.Column<string>(type: "text", nullable: false, defaultValue: "trial"),
                    TrialEndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tenants");
        }
    }
}
