
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
        var config = builder.Configuration.GetRequiredSection("JwtSettings");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["Issuer"] ?? throw new InvalidOperationException("JWT Issuer is missing!"),
            ValidAudience = config["Audience"] ?? throw new InvalidOperationException("JWT Audience is missing!"),
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["SecretKey"] ??
                                       throw new InvalidOperationException("JWT SecretKey is missing!"))
            )
        };
    });
// 🔹 Add Google Authentication
    // .AddCookie() // Required for Google Authentication
    // .AddGoogle("Google", options =>
    // {
    //     options.ClientId = builder.Configuration["Authentication:Google:ClientId"]
    //                        ?? throw new InvalidOperationException("Google ClientId is missing!");
    //     options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
    //                            ?? throw new InvalidOperationException("Google ClientSecret is missing!");
    // });


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
                "http://localhost:5096",
                "http://localhost:80",
                "http://frontend",
                "http://localhost:5000",
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
