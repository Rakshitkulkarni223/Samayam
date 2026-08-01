import { useApp } from './context/AppContext.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Layout from './components/Layout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function ProtectedRoute({ children }) {
  const app = useApp()
  let result

  try {
    if (!app) result = null
    else if (app.loading) {
      result = (
        <div className="app-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="placeholder-view">
            <h3>Loading SAMAYAM...</h3>
          </div>
        </div>
      )
    } else if (!app.user) {
      result = <Navigate to="/login" replace />
    } else {
      result = children
    }
  } catch (e) {
    console.error('Error in ProtectedRoute:', e)
    result = <Navigate to="/login" replace />
  }

  return result
}

function LogoutRoute() {
  const app = useApp()

  try {
    if (app && app.logout) {
      app.logout()
    }
  } catch (e) {
    console.error('Error in LogoutRoute:', e)
  }

  return <Navigate to="/login" replace />
}

function AppRoutes() {
  let result

  try {
    result = (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<LogoutRoute />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  } catch (e) {
    console.error('Error in AppRoutes:', e)
    result = <div>Error loading routes</div>
  }

  return result
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}
