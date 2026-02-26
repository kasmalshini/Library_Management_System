using System.Net;
using System.Net.Http.Json;
using LibraryManagement.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace LibraryManagement.Tests;

public class BooksControllerTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly ApiWebApplicationFactory _factory;

    public BooksControllerTests(ApiWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task ClearBooksAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LibraryManagement.Api.Data.LibraryDbContext>();
        db.Books.RemoveRange(await db.Books.ToListAsync());
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAll_Returns_Empty_List_When_No_Books()
    {
        await ClearBooksAsync();
        var response = await _client.GetAsync("/api/books");
        response.EnsureSuccessStatusCode();
        var books = await response.Content.ReadFromJsonAsync<BookResponse[]>();
        Assert.NotNull(books);
        Assert.Empty(books);
    }

    [Fact]
    public async Task Create_Returns_201_And_Book_With_Id()
    {
        await ClearBooksAsync();
        var request = new CreateBookRequest { Title = "Test Book", Author = "Test Author", Description = "A test." };
        var response = await _client.PostAsJsonAsync("/api/books", request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var book = await response.Content.ReadFromJsonAsync<BookResponse>();
        Assert.NotNull(book);
        Assert.True(book.Id > 0);
        Assert.Equal("Test Book", book.Title);
        Assert.Equal("Test Author", book.Author);
        Assert.Equal("A test.", book.Description);
    }

    [Fact]
    public async Task GetById_Returns_Book_After_Create()
    {
        await ClearBooksAsync();
        var request = new CreateBookRequest { Title = "Get Me", Author = "Author", Description = null };
        var createResponse = await _client.PostAsJsonAsync("/api/books", request);
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<BookResponse>();
        Assert.NotNull(created);

        var getResponse = await _client.GetAsync($"/api/books/{created.Id}");
        getResponse.EnsureSuccessStatusCode();
        var book = await getResponse.Content.ReadFromJsonAsync<BookResponse>();
        Assert.NotNull(book);
        Assert.Equal(created.Id, book.Id);
        Assert.Equal("Get Me", book.Title);
    }

    [Fact]
    public async Task GetById_Returns_404_For_Invalid_Id()
    {
        await ClearBooksAsync();
        var response = await _client.GetAsync("/api/books/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_Modifies_Book()
    {
        await ClearBooksAsync();
        var createRequest = new CreateBookRequest { Title = "Original", Author = "Author", Description = null };
        var createResponse = await _client.PostAsJsonAsync("/api/books", createRequest);
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<BookResponse>();
        Assert.NotNull(created);

        var updateRequest = new UpdateBookRequest { Title = "Updated Title", Author = "New Author", Description = "Updated desc" };
        var updateResponse = await _client.PutAsJsonAsync($"/api/books/{created.Id}", updateRequest);
        updateResponse.EnsureSuccessStatusCode();
        var updated = await updateResponse.Content.ReadFromJsonAsync<BookResponse>();
        Assert.NotNull(updated);
        Assert.Equal("Updated Title", updated.Title);
        Assert.Equal("New Author", updated.Author);
        Assert.Equal("Updated desc", updated.Description);
    }

    [Fact]
    public async Task Delete_Returns_204_And_Removes_Book()
    {
        await ClearBooksAsync();
        var createRequest = new CreateBookRequest { Title = "To Delete", Author = "Author", Description = null };
        var createResponse = await _client.PostAsJsonAsync("/api/books", createRequest);
        createResponse.EnsureSuccessStatusCode();
        var created = await createResponse.Content.ReadFromJsonAsync<BookResponse>();
        Assert.NotNull(created);

        var deleteResponse = await _client.DeleteAsync($"/api/books/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await _client.GetAsync($"/api/books/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }
}
