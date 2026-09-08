import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Login from './pages/Login.jsx'
import Library from './pages/Library.jsx'
import Editor from './pages/Editor.jsx'
import Player from './pages/Player.jsx'

function RequireAuth({ children }) {
  const { user, loading, configured } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-paper-faint text-sm">
        Loading…
      </div>
    )
  }
  if (configured && !user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Library />
          </RequireAuth>
        }
      />
      <Route
        path="/song/:id"
        element={
          <RequireAuth>
            <Editor />
          </RequireAuth>
        }
      />
      <Route
        path="/play/:id"
        element={
          <RequireAuth>
            <Player />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
