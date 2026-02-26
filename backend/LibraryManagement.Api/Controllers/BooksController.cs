using LibraryManagement.Api.Data;
using LibraryManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.Api.Controllers;

/// <summary>
/// RESTful API for managing book records (Create, Read, Update, Delete).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class BooksController : ControllerBase
{
    private readonly LibraryDbContext _db;

    public BooksController(LibraryDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all books, optionally filtered by search term (title, author, description) and/or author.
    /// </summary>
    /// <param name="search">Optional. Filter by title, author, or description containing this term (case-insensitive).</param>
    /// <param name="author">Optional. Filter by author name containing this term (case-insensitive).</param>
    /// <response code="200">Returns the list of books.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BookResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BookResponse>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? author,
        CancellationToken cancellationToken)
    {
        var query = _db.Books.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(b =>
                EF.Functions.Like(b.Title ?? "", "%" + term + "%") ||
                EF.Functions.Like(b.Author ?? "", "%" + term + "%") ||
                EF.Functions.Like(b.Description ?? "", "%" + term + "%"));
        }

        if (!string.IsNullOrWhiteSpace(author))
        {
            var authorTerm = author.Trim();
            query = query.Where(b => b.Author != null && EF.Functions.Like(b.Author, "%" + authorTerm + "%"));
        }

        var books = await query
            .OrderBy(b => b.Title)
            .Select(b => new BookResponse
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                Description = b.Description
            })
            .ToListAsync(cancellationToken);
        return Ok(books);
    }

    /// <summary>
    /// Get a book by id.
    /// </summary>
    /// <param name="id">The book id.</param>
    /// <response code="200">Returns the book.</response>
    /// <response code="404">Book not found.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var book = await _db.Books.FindAsync([id], cancellationToken);
        if (book == null)
            return NotFound();
        return Ok(new BookResponse
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Description = book.Description
        });
    }

    /// <summary>
    /// Create a new book.
    /// </summary>
    /// <param name="request">The book data.</param>
    /// <response code="201">Returns the created book.</response>
    /// <response code="400">Validation failed.</response>
    [HttpPost]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BookResponse>> Create([FromBody] CreateBookRequest request, CancellationToken cancellationToken)
    {
        if (request == null)
            return BadRequest(new { error = "Request body is required." });

        var book = new Core.Book
        {
            Title = request.Title.Trim(),
            Author = request.Author.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim()
        };
        _db.Books.Add(book);
        await _db.SaveChangesAsync(cancellationToken);

        var response = new BookResponse
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Description = book.Description
        };
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, response);
    }

    /// <summary>
    /// Update an existing book.
    /// </summary>
    /// <param name="id">The book id.</param>
    /// <param name="request">The updated book data.</param>
    /// <response code="200">Returns the updated book.</response>
    /// <response code="400">Validation failed.</response>
    /// <response code="404">Book not found.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookResponse>> Update(int id, [FromBody] UpdateBookRequest request, CancellationToken cancellationToken)
    {
        if (request == null)
            return BadRequest(new { error = "Request body is required." });

        var book = await _db.Books.FindAsync([id], cancellationToken);
        if (book == null)
            return NotFound();

        book.Title = request.Title.Trim();
        book.Author = request.Author.Trim();
        book.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new BookResponse
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Description = book.Description
        });
    }

    /// <summary>
    /// Delete a book.
    /// </summary>
    /// <param name="id">The book id.</param>
    /// <response code="204">Book deleted.</response>
    /// <response code="404">Book not found.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var book = await _db.Books.FindAsync([id], cancellationToken);
        if (book == null)
            return NotFound();
        _db.Books.Remove(book);
        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
