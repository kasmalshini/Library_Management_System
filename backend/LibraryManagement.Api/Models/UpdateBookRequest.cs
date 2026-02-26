using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.Api.Models;

/// <summary>
/// Request DTO for updating an existing book.
/// </summary>
public class UpdateBookRequest
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(500, ErrorMessage = "Title must not exceed 500 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Author is required.")]
    [StringLength(300, ErrorMessage = "Author must not exceed 300 characters.")]
    public string Author { get; set; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Description must not exceed 2000 characters.")]
    public string? Description { get; set; }
}
