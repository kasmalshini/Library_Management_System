using LibraryManagement.Api.Services;
using Xunit;

namespace LibraryManagement.Tests;

public class PasswordHasherTests
{
    [Fact]
    public void HashPassword_Returns_NonEmpty_String()
    {
        var hash = PasswordHasher.HashPassword("password123");
        Assert.False(string.IsNullOrWhiteSpace(hash));
        Assert.Contains(".", hash);
    }

    [Fact]
    public void HashPassword_Produces_Different_Salts_Each_Time()
    {
        var hash1 = PasswordHasher.HashPassword("same");
        var hash2 = PasswordHasher.HashPassword("same");
        Assert.NotEqual(hash1, hash2);
    }

    [Fact]
    public void VerifyPassword_Returns_True_When_Password_Matches()
    {
        const string password = "MySecretPassword!";
        var storedHash = PasswordHasher.HashPassword(password);
        Assert.True(PasswordHasher.VerifyPassword(password, storedHash));
    }

    [Fact]
    public void VerifyPassword_Returns_False_When_Password_Does_Not_Match()
    {
        var storedHash = PasswordHasher.HashPassword("correct");
        Assert.False(PasswordHasher.VerifyPassword("wrong", storedHash));
    }

    [Fact]
    public void VerifyPassword_Returns_False_For_Invalid_StoredHash()
    {
        Assert.False(PasswordHasher.VerifyPassword("any", "onlyOnePart"));
        Assert.False(PasswordHasher.VerifyPassword("any", ""));
        // Valid base64 but not a real hash - should not match
        Assert.False(PasswordHasher.VerifyPassword("any", "YQ==.YQ=="));
    }

    [Fact]
    public void VerifyPassword_Empty_Password_Can_Be_Hashed_And_Verified()
    {
        var storedHash = PasswordHasher.HashPassword("");
        Assert.True(PasswordHasher.VerifyPassword("", storedHash));
        Assert.False(PasswordHasher.VerifyPassword("x", storedHash));
    }
}
