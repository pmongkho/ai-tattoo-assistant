using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace dotnet_server.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserImage_AspNetUsers_UserId",
                table: "UserImage");

            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserImage",
                table: "UserImage");

            migrationBuilder.DropColumn(
                name: "ZipCode",
                table: "AspNetUsers");

            migrationBuilder.RenameTable(
                name: "UserImage",
                newName: "UserImages");

            migrationBuilder.RenameIndex(
                name: "IX_UserImage_UserId",
                table: "UserImages",
                newName: "IX_UserImages_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "AspNetUsers",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "UserImages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "UserImages",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "OriginalFileName",
                table: "UserImages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserImages",
                table: "UserImages",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ArtistProfiles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: false),
                    Styles = table.Column<string[]>(type: "text[]", nullable: false),
                    HourlyRate = table.Column<decimal>(type: "numeric", nullable: false),
                    InstagramUrl = table.Column<string>(type: "text", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArtistProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_ArtistProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Consultations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<string>(type: "text", nullable: false),
                    ArtistId = table.Column<string>(type: "text", nullable: false),
                    Style = table.Column<string>(type: "text", nullable: false),
                    BodyPart = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<string>(type: "text", nullable: false),
                    PriceExpectation = table.Column<string>(type: "text", nullable: false),
                    Availability = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChatHistory = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consultations", x => x.Id);
                    table.CheckConstraint("CK_Consultations_Status", "\"Status\" IN ('pending', 'approved', 'rejected')");
                    table.ForeignKey(
                        name: "FK_Consultations_AspNetUsers_ArtistId",
                        column: x => x.ArtistId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Consultations_AspNetUsers_ClientId",
                        column: x => x.ClientId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TattooJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedById = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Style = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    IsBooked = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TattooJobs", x => x.Id);
                    table.CheckConstraint("CK_TattooJobs_Type", "\"Type\" IN ('client_request', 'artist_offer')");
                    table.ForeignKey(
                        name: "FK_TattooJobs_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConsultationId = table.Column<Guid>(type: "uuid", nullable: true),
                    ClientId = table.Column<string>(type: "text", nullable: false),
                    ArtistId = table.Column<string>(type: "text", nullable: false),
                    ScheduledFor = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SquareEventId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.CheckConstraint("CK_Appointments_Status", "\"Status\" IN ('scheduled', 'completed', 'cancelled')");
                    table.ForeignKey(
                        name: "FK_Appointments_AspNetUsers_ArtistId",
                        column: x => x.ArtistId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_AspNetUsers_ClientId",
                        column: x => x.ClientId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Consultations_ConsultationId",
                        column: x => x.ConsultationId,
                        principalTable: "Consultations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Users_UserRole",
                table: "AspNetUsers",
                sql: "\"UserRole\" IN ('artist', 'client')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_UserImages_ImageType",
                table: "UserImages",
                sql: "\"ImageType\" IN ('Profile', 'Reference', 'Placement', 'Portfolio')");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ArtistId",
                table: "Appointments",
                column: "ArtistId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ClientId",
                table: "Appointments",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ConsultationId",
                table: "Appointments",
                column: "ConsultationId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_ArtistId",
                table: "Consultations",
                column: "ArtistId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_ClientId",
                table: "Consultations",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_TattooJobs_CreatedById",
                table: "TattooJobs",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_UserImages_AspNetUsers_UserId",
                table: "UserImages",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserImages_AspNetUsers_UserId",
                table: "UserImages");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "ArtistProfiles");

            migrationBuilder.DropTable(
                name: "TattooJobs");

            migrationBuilder.DropTable(
                name: "Consultations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Users_UserRole",
                table: "AspNetUsers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserImages",
                table: "UserImages");

            migrationBuilder.DropCheckConstraint(
                name: "CK_UserImages_ImageType",
                table: "UserImages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "UserImages");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "UserImages");

            migrationBuilder.DropColumn(
                name: "OriginalFileName",
                table: "UserImages");

            migrationBuilder.RenameTable(
                name: "UserImages",
                newName: "UserImage");

            migrationBuilder.RenameIndex(
                name: "IX_UserImages_UserId",
                table: "UserImage",
                newName: "IX_UserImage_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "AspNetUsers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "AspNetUsers",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AddColumn<string>(
                name: "ZipCode",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserImage",
                table: "UserImage",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AppointmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TattooDetails = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_UserImage_AspNetUsers_UserId",
                table: "UserImage",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
