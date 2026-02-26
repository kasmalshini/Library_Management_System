using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace LibraryManagement.Api.Services;

/// <summary>
/// Hashes and verifies passwords using PBKDF2.
/// </summary>
public static class PasswordHasher
{
    private const int SaltSize = 16;
    private const int IterationCount = 100_000;
    private const int NumBytesRequested = 32;
    private const char Separator = '.';

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, IterationCount, NumBytesRequested);
        return $"{Convert.ToBase64String(salt)}{Separator}{Convert.ToBase64String(hash)}";
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split(Separator, 2);
        if (parts.Length != 2) return false;
        var salt = Convert.FromBase64String(parts[0]);
        var expectedHash = Convert.FromBase64String(parts[1]);
        var actualHash = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, IterationCount, NumBytesRequested);
        return CryptographicOperations.FixedTimeEquals(expectedHash, actualHash);
    }
}
