using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Library Management API", Version = "v1" });
});

// SQLite database – file stored in the application directory (skip in Testing; tests use InMemory).
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddDbContext<LibraryManagement.Api.Data.LibraryDbContext>(options =>
    {
        var fileName = builder.Configuration["Database:FileName"] ?? "library.db";
        var dbPath = Path.Combine(builder.Environment.ContentRootPath, fileName);
        options.UseSqlite($"Data Source={dbPath}");
    });
}

var jwtKey = builder.Configuration["Jwt:Key"] ?? "LibraryManagementSecretKeyAtLeast32CharactersLong!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LibraryManagement.Api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LibraryManagement.App";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Apply pending migrations on startup (skip when testing with InMemory).
if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
    var db = scope.ServiceProvider.GetRequiredService<LibraryManagement.Api.Data.LibraryDbContext>();
    db.Database.Migrate();

    // Verify the Books table exists (handles corrupted or out-of-sync migration history).
    try
    {
        await db.Books.FirstOrDefaultAsync();
    }
    catch (Exception ex)
    {
        var msg = (ex.InnerException?.Message ?? "") + ex.Message;
        if (msg.Contains("no such table", StringComparison.OrdinalIgnoreCase))
        {
            // Books table is missing but migration history thinks it's applied. Create the table directly so the app can run.
            await db.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""Books"" (
                    ""Id"" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    ""Title"" TEXT NOT NULL,
                    ""Author"" TEXT NOT NULL,
                    ""Description"" TEXT NULL
                );
            ");
            await db.Books.FirstOrDefaultAsync(); // verify
        }
        else
            throw;
    }

    // Ensure Users table exists (idempotent – safe if migration was skipped or DB was created manually).
    await db.Database.ExecuteSqlRawAsync(@"
        CREATE TABLE IF NOT EXISTS ""Users"" (
            ""Id"" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            ""Email"" TEXT NOT NULL,
            ""PasswordHash"" TEXT NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Users_Email"" ON ""Users"" (""Email"");
    ");
    }
}

// Configure the HTTP request pipeline.
app.UseMiddleware<LibraryManagement.Api.Middleware.ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Library Management API v1"));

app.UseCors();
app.UseAuthentication();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
