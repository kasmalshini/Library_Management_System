using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LibraryManagement.Api.Data;
using LibraryManagement.Api.Models;
using LibraryManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LibraryManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly LibraryDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(LibraryDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    /// <summary>
    /// Register a new user.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        if (request == null)
            return BadRequest(new { error = "Request body is required." });

        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (existing != null)
            return BadRequest(new { error = "An account with this email already exists." });

        var user = new Core.User
        {
            Email = email,
            PasswordHash = PasswordHasher.HashPassword(request.Password)
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        var token = GenerateJwt(user);
        return CreatedAtAction(nameof(Login), new AuthResponse { Token = token, Email = user.Email });
    }

    /// <summary>
    /// Log in and receive a JWT.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (request == null)
            return BadRequest(new { error = "Request body is required." });

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { error = "Invalid email or password." });

        var token = GenerateJwt(user);
        return Ok(new AuthResponse { Token = token, Email = user.Email });
    }

    private string GenerateJwt(Core.User user)
    {
        var key = _config["Jwt:Key"] ?? "LibraryManagementSecretKeyAtLeast32CharactersLong!";
        var issuer = _config["Jwt:Issuer"] ?? "LibraryManagement.Api";
        var audience = _config["Jwt:Audience"] ?? "LibraryManagement.App";
        var expiryMinutes = int.TryParse(_config["Jwt:ExpiryMinutes"], out var m) ? m : 60;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
