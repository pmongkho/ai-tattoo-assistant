using System.Text;
using DotNet.Data;
using DotNet.Models;
using DotNet.Services;
using DotNet.Controllers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Resend;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Linq; // for result.Errors.Select(...)

using DotNetEnv;


var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
if (File.Exists(envPath))
{
    Env.Load(envPath);
}

var builder = WebApplication.CreateBuilder(args);

// Configure configuration sources
builder.ConfigureAppConfiguration();

// Configure services
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddAuthenticationServices(builder.Configuration);
builder.Services.AddFirebaseServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);
builder.Services.Configure<SquareOptions>(builder.Configuration.GetSection("Square"));
builder.Services.AddSingleton<ISquareAppointmentsService, SquareAppointmentsService>();
builder.Services.AddScoped<IConsultationService, ConsultationService>();
var azureStorageConnectionString =
    Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING") ??
    builder.Configuration["AzureStorage:ConnectionString"];

if (string.IsNullOrWhiteSpace(azureStorageConnectionString))
{
    Console.WriteLine("Azure storage connection string not found. Using NoOpStorageService.");
    builder.Services.AddScoped<IStorageService, NoOpStorageService>();
}
else
{
    builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();
}
builder.Services.AddScoped<IMessagingIntegrationService, MessagingIntegrationService>();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddHttpClient<ChatService>();
builder.Services.AddControllers()
    .AddJsonOptions(opts => opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true);

// Build the application
var app = builder.Build();

// Configure the HTTP request pipeline
app.ConfigureMiddleware(builder.Environment);

// Apply database migrations at startup
app.MigrateDatabase();

await app.SeedArtistsAsync();
await app.DumpArtistMappingsAsync();

// Log configuration values for debugging
app.LogConfigurationValues(builder.Configuration);

// Run the application
app.Run();



// Extension methods for cleaner organization
public static class ProgramExtensions
{
    public static void ConfigureAppConfiguration(this WebApplicationBuilder builder)
    {
        builder.Configuration
            // Make the base configuration file optional so deployments without
            // an `appsettings.json` do not crash. Environment-specific files
            // and environment variables will still be loaded if present.
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddEnvironmentVariables(prefix: "OpenAI__");
    }
    
    public static async Task DumpArtistMappingsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var um = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var mappings = await um.Users
            .Where(u => u.SquareArtistId != null)
            .Select(u => new { u.Id, u.Email, u.FullName, u.SquareArtistId })
            .ToListAsync();

        Console.WriteLine("=== Known artist mappings (Id | Email | Name | SquareArtistId) ===");
        foreach (var m in mappings)
            Console.WriteLine($"{m.Id} | {m.Email} | {m.FullName} | {m.SquareArtistId}");
    }


    public static void AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure database
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // Some hosting providers supply the connection string in URL format (e.g. postgres://).
        // Npgsql expects standard key=value pairs, so convert if necessary.
        if (!string.IsNullOrWhiteSpace(connectionString) && connectionString.Contains("://"))
        {
            try
            {
                var uri = new Uri(connectionString);
                var userInfo = uri.UserInfo.Split(':', 2);
                var port = uri.Port > 0 ? uri.Port : 5432;
                connectionString =
                    $"Host={uri.Host};Port={port};Database={uri.LocalPath.TrimStart('/')};" +
                    $"Username={userInfo[0]};Password={userInfo.ElementAtOrDefault(1)};" +
                    "Pooling=true;SSL Mode=Require;Trust Server Certificate=true";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Invalid connection string format: {ex.Message}");
            }
        }

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                options.UseInMemoryDatabase("InMemoryDb");
                Console.WriteLine("No connection string found. Using in-memory database.");
            }
            else
            {
                options.UseNpgsql(connectionString);
            }
        });

        // Configure Identity
        services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        // Auth Service
        services.AddScoped<IAuthService, AuthService>();

        // Configure Resend Email Service
        services.AddOptions();
        services.Configure<ResendClientOptions>(o =>
        {
            o.ApiToken = Environment.GetEnvironmentVariable("ResendApiToken")!; // Change back to this casing
        });
        services.AddHttpClient<ResendClient>();
        services.AddTransient<IResend, ResendClient>();

        // Configure Logging
        services.AddLogging(logging =>
        {
            logging.AddConsole();
            logging.AddDebug();
        });
    }

    public static void AddAuthenticationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme             = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                // Get JWT settings from environment variables or configuration
                string secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? 
                                   configuration["JwtSettings:SecretKey"] ??
                                   "DefaultDevSecretKey_ThisShouldBeChangedInProduction_12345";
        
                string issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? 
                                configuration["JwtSettings:Issuer"] ??
                                "DefaultIssuer";
        
                string audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? 
                                  configuration["JwtSettings:Audience"] ??
                                  "DefaultAudience";

                // Log the values being used
                Console.WriteLine($"JWT Configuration - Using Issuer: {issuer}, Audience: {audience}, Secret Key: {(string.IsNullOrEmpty(secretKey) ? "NOT SET" : "SET")}");

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                };
            });

        services.AddAuthorization();
    }

    public static void AddFirebaseServices(this IServiceCollection services, IConfiguration configuration)
    {
        try
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "firebase-adminsdk.json");
            if (File.Exists(filePath))
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile(filePath)
                });

                Console.WriteLine("Firebase Admin SDK initialized successfully.");
            }
            else
            {
                Console.WriteLine($"Firebase service account file not found at: {filePath}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error initializing Firebase Admin SDK: {ex.Message}");
        }
    }
    
    // Add this to your ProgramExtensions class
    public static void AddSwaggerServices(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Tattoo API", Version = "v1" });
        
            // Add JWT authentication to Swagger
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
    }


    public static void AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure API
        services.AddControllers();
        services.AddScoped<TattooController>();
        services.AddSwaggerServices();

        // Configure CORS
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[]
            {
                "http://localhost:4200",
                "https://ai-tattoo-assistant.vercel.app"
            };

        allowedOrigins = allowedOrigins
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Select(origin => origin.TrimEnd('/'))
            .Distinct()
            .ToArray();

        if (allowedOrigins.Length == 0)
        {
            allowedOrigins = new[] { "http://localhost:4200",
                "https://ai-tattoo-assistant.vercel.app" };
        }

        services.AddCors(options =>
        {
            options.AddPolicy("AllowClients", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }
    
    public static async Task SeedArtistsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // TODO: replace with your real artist email + Square ID
        var email = "artist@example.com";
        var squareId = "TM5aja5TzIaHzSZl";

        var artist = await userManager.FindByEmailAsync(email);
        if (artist == null)
        {
            artist = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = "Seeded Artist",
                SquareArtistId = squareId
            };

            var result = await userManager.CreateAsync(artist); // no password -> external login only
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    "Failed to seed artist user: " +
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else if (artist.SquareArtistId != squareId)
        {
            artist.SquareArtistId = squareId;
            await userManager.UpdateAsync(artist);
        }
    }


    public static void ConfigureMiddleware(this WebApplication app, IHostEnvironment env)
    {
        // Configure the HTTP request pipeline
        if (env.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        else
        {
            app.UseHttpsRedirection();
        }

        // Configure middleware (order matters)
        app.UseCors("AllowClients");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
    }

    public static void MigrateDatabase(this WebApplication app)
    {
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            try
            {
                var context = services.GetRequiredService<ApplicationDbContext>();
                if (context.Database.IsRelational())
                {
                    context.Database.Migrate();
                    Console.WriteLine("Database migrations applied successfully.");
                }
                else
                {
                    Console.WriteLine("In-memory database detected; skipping migrations.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while applying migrations: {ex.Message}");
            }
        }
    }

    public static void LogConfigurationValues(this WebApplication app, IConfiguration configuration)
    {
        Console.WriteLine($"OpenAI:ApiKey exists: {!string.IsNullOrEmpty(configuration["OpenAI:ApiKey"])}");
        Console.WriteLine($"Environment Variable OPENAI_API_KEY: {!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("OPENAI_API_KEY"))}");

        Console.WriteLine($"ConnectionStrings:DefaultConnection: {configuration.GetConnectionString("DefaultConnection")}");
        Console.WriteLine($"JWT_SECRET_KEY exists: {!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("JWT_SECRET_KEY"))}");
        Console.WriteLine($"JWT_ISSUER: {Environment.GetEnvironmentVariable("JWT_ISSUER")}");
        Console.WriteLine($"JWT_AUDIENCE: {Environment.GetEnvironmentVariable("JWT_AUDIENCE")}");
    }
}
