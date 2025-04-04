using System.Text;
using DotNet.Data;
using DotNet.Models;
using DotNet.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Resend;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// Configure configuration sources
builder.ConfigureAppConfiguration();

// Configure services
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddAuthenticationServices(builder.Configuration);
builder.Services.AddFirebaseServices(builder.Configuration);
builder.Services.AddApiServices();

// Build the application
var app = builder.Build();

// Configure the HTTP request pipeline
app.ConfigureMiddleware(builder.Environment);

// Apply database migrations at startup
app.MigrateDatabase();

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
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddEnvironmentVariables(prefix: "OpenAI__");
    }

    public static void AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure database
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Configure Identity
        services.AddIdentity<ApplicationUser, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        // Configure Services
        services.AddHttpClient<ChatService>(client =>
        {
            client.BaseAddress = new Uri("https://api.openai.com/");
        });

        // Auth Service
        services.AddScoped<IAuthService, AuthService>();

        // Configure Resend Email Service
        services.AddOptions();
        services.Configure<ResendClientOptions>(o =>
        {
            o.ApiToken = Environment.GetEnvironmentVariable("ResendApiToken")!;
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
                options.DefaultScheme = "Cookies";
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = "Google";
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
                // Get the bucket name from environment variable or configuration
                string bucketName = Environment.GetEnvironmentVariable("FIREBASE_STORAGE_BUCKET") ?? 
                                    configuration["Firebase:StorageBucket"] ?? 
                                    "ai-tattoo-assistant.firebasestorage.app";
                
                // Initialize Firebase with just the credential
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile(filePath)
                });
                
                // Store the bucket name in configuration for the FirebaseStorageService to use
                configuration["Firebase:StorageBucket"] = bucketName;
                
                Console.WriteLine($"Firebase Admin SDK initialized successfully with bucket: {bucketName}");
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


    public static void AddApiServices(this IServiceCollection services)
    {
        // Configure API
        services.AddControllers();
        services.AddSwaggerServices();

        // Configure CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowClients", policy =>
            {
                policy.WithOrigins(
                        "http://localhost:4200", 
                        "http://localhost:5000",
                        "http://localhost:80",
                        "http://frontend",
                        "http://backend:5000"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
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
                context.Database.Migrate();
                Console.WriteLine("Database migrations applied successfully.");
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
        Console.WriteLine($"ConnectionStrings:DefaultConnection: {configuration.GetConnectionString("DefaultConnection")}");
        Console.WriteLine($"JWT_SECRET_KEY exists: {!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("JWT_SECRET_KEY"))}");
        Console.WriteLine($"JWT_ISSUER: {Environment.GetEnvironmentVariable("JWT_ISSUER")}");
        Console.WriteLine($"JWT_AUDIENCE: {Environment.GetEnvironmentVariable("JWT_AUDIENCE")}");
    }
}
