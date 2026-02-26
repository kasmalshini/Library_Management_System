import { Routes, Route, Navigate } from 'react-router-dom'
import BookListPage from './pages/BookListPage'
import CreateBookPage from './pages/CreateBookPage'
import EditBookPage from './pages/EditBookPage'
import CategoriesPage from './pages/CategoriesPage'
import MembersPage from './pages/MembersPage'
import TransactionsPage from './pages/TransactionsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BookListPage />} />
        <Route path="books/new" element={<CreateBookPage />} />
        <Route path="books/:id/edit" element={<EditBookPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
