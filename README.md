# Library Management System

A full-stack Library Management System with a C# .NET Web API backend and a React + TypeScript frontend. Supports full CRUD operations for books (Title, Author, Description).

## Prerequisites

- **.NET 8 SDK** (or .NET 9) – [Download](https://dotnet.microsoft.com/download)
- **Node.js 18+** – [Download](https://nodejs.org/)

## Project structure

```
Library_Management_System/
├── backend/                    # .NET Web API
│   ├── LibraryManagement.Api/  # API project (controllers, DTOs, DbContext)
│   ├── LibraryManagement.Core/ # Core entities (Book)
│   └── LibraryManagement.sln
├── frontend/                   # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── README.md
```

## Running locally

### 1. Backend (API)

From the repository root:

```bash
cd backend
dotnet run --project LibraryManagement.Api
```

Or run from the API project directory:

```bash
cd backend/LibraryManagement.Api
dotnet run
```

The API runs at **http://localhost:5170** (see `Properties/launchSettings.json`). The SQLite database file `library.db` is created in the API project directory. Migrations are applied automatically on startup.

- **Swagger UI:** Open **http://localhost:5170/swagger** to explore and test the API.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:5173**. Set `VITE_API_URL` if your API uses a different URL (e.g. in `.env`: `VITE_API_URL=http://localhost:5170`).

### 3. Using the app

- **Log in / Register:** Go to `/login` or `/register` to create an account or sign in. The book API requires authentication.
- **List books:** `/` – view all books, add, edit, or delete (after logging in).
- **Add book:** Click “Add Book” or go to `/books/new`.
- **Edit book:** Click “Edit” on a book or go to `/books/:id/edit`.
- **Log out:** Click “Log out” in the header.

## API endpoints

### Auth (no token required)

| Method | Endpoint               | Description        |
| ------ | ---------------------- | ------------------ |
| POST   | `/api/auth/register`   | Register (email, password) |
| POST   | `/api/auth/login`      | Log in (email, password); returns JWT |

### Books (require `Authorization: Bearer <token>`)

| Method   | Endpoint           | Description    |
| -------- | ------------------ | -------------- |
| GET     | `/api/books`       | List all books |
| GET     | `/api/books/{id}`  | Get book by id |
| POST    | `/api/books`       | Create book    |
| PUT     | `/api/books/{id}`  | Update book    |
| DELETE  | `/api/books/{id}`  | Delete book    |

## Configuration

- **Backend:** Connection string, JWT settings, and logging are in `backend/LibraryManagement.Api/appsettings.json`. JWT key, issuer, audience, and expiry can be set there. Default token expiry is 60 minutes.
- **Frontend:** API base URL is set via `VITE_API_URL` (default: `http://localhost:5170`). The JWT is stored in `localStorage` after login/register.

## Optional: run database migrations manually

If you prefer to apply migrations yourself instead of on startup:

```bash
cd backend/LibraryManagement.Api
dotnet ef database update
```

## Building for production

- **Backend:** `cd backend && dotnet publish -c Release`
- **Frontend:** `cd frontend && npm run build` (output in `frontend/dist/`)

## Testing

### Backend (xUnit)

From the backend directory:

```bash
cd backend
dotnet test
```

**Note:** Stop the API first (Ctrl+C in the terminal where it’s running). If the API is running, the build can lock `LibraryManagement.Core.dll` and tests will fail with “file is being used by another process”.

This runs the **LibraryManagement.Tests** project:
- **Unit tests:** `PasswordHasher` (hash/verify, invalid input).
- **API controller tests:** `BooksController` (GET empty list, POST create, GET by id, 404, PUT update, DELETE). Uses in-memory EF Core and test auth; run `dotnet restore` first if packages are missing.

### Frontend (Vitest)

From the frontend directory:

```bash
cd frontend
npm install
npm run test:run
```

Or watch mode: `npm run test`. Tests cover:
- **Auth** (`src/types/auth.test.ts`): `getStoredToken`, `setStoredAuth`, `isAuthenticated`, etc.
- **Theme** (`src/theme.test.ts`): `getStoredTheme`, `applyTheme`, `setTheme`.
- **BookListPage** (`src/pages/BookListPage.test.tsx`): loading state, empty list, table with books, Edit/Delete links, metrics.
