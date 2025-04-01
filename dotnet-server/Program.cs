
using System.Text;
using DotNet.Configurations;
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



var builder = WebApplication.CreateBuilder(args);

// ✅ Configure the DBContext to use PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables(); // This enables ALL environment variables

// Log configuration values for debugging
Console.WriteLine($"OpenAI:ApiKey exists: {!string.IsNullOrEmpty(builder.Configuration["OpenAI:ApiKey"])}");
Console.WriteLine($"ConnectionStrings:DefaultConnection: {builder.Configuration.GetConnectionString("DefaultConnection")}");


// Add this before you build the app
try
{
    // Path to your service account file
    string filePath = Path.Combine(Directory.GetCurrentDirectory(), "firebase-adminsdk.json");
    
    if (File.Exists(filePath))
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(filePath)
        });
        
        Console.WriteLine("Firebase Admin SDK initialized successfully");
    }
    else
    {
        Console.WriteLine($"Firebase service account file not found at: {filePath}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Error initializing Firebase Admin SDK: {ex.Message}");
    // Continue without Firebase - your app can still run
}

// ✅ Configure Identity services
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// ✅ Configure Authentication (Google + JWT)
builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = "Cookies"; // Required for Google authentication
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = "Google"; // Set Google as challenge scheme
    })
// 🔹 Add JWT Authentication
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        // Try to get JWT settings from environment variables first, then from configuration
        string secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? 
                           builder.Configuration["JwtSettings:SecretKey"];
    
        string issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? 
                        builder.Configuration["JwtSettings:Issuer"];
    
        string audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? 
                          builder.Configuration["JwtSettings:Audience"];

        // Log JWT settings for debugging
        Console.WriteLine($"JWT_SECRET_KEY exists: {!string.IsNullOrEmpty(secretKey)}");
        Console.WriteLine($"JWT_ISSUER: {issuer}");
        Console.WriteLine($"JWT_AUDIENCE: {audience}");

        if (string.IsNullOrEmpty(secretKey))
            throw new InvalidOperationException("JWT secret key is not configured");
    
        if (string.IsNullOrEmpty(issuer))
            throw new InvalidOperationException("JWT issuer is not configured");
    
        if (string.IsNullOrEmpty(audience))
            throw new InvalidOperationException("JWT audience is not configured");

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


// ✅ Register Other Services
builder.Services.AddHttpClient<ChatService>(client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/");
});

// Add logging configuration
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
});

// Add configuration explicitly
builder.Configuration.AddEnvironmentVariables(prefix: "OpenAI__");
builder.Services.AddAuthorization();

builder.Services.AddControllers();

// Resend
builder.Services.AddOptions();
builder.Services.Configure<ResendClientOptions>( o =>
{
    o.ApiToken = Environment.GetEnvironmentVariable( "ResendApiToken" )!;
} );
builder.Services.AddHttpClient<ResendClient>();
builder.Services.AddTransient<IResend, ResendClient>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClients", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200", 
                "http://localhost:5000",  // Make sure this matches your backend port
                "http://localhost:80",
                "http://frontend",
                "http://backend:5000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ✅ Add Swagger (Ensure `SwaggerConfig` Exists)
builder.Services.AddSwaggerServices();

// ✅ Build Application
var app = builder.Build();

// ✅ Configure Middleware (Order Matters!)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Configure Middleware (Order Matters!)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowClients");
app.UseAuthentication();  // ✅ Authentication first
app.UseAuthorization();   // ✅ Authorization after authentication
app.MapControllers();

// Apply migrations at startup
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
app.Run();
