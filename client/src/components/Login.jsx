import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Login() {
  const app = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try {
      if (app && app.user && !app.loading) {
        navigate('/', { replace: true })
      }
    } catch (e) {
      console.error('Error in Login useEffect:', e)
    }
  }, [app, navigate])

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      setError('')
      if (!username.trim() || !password) {
        setError('Username and password are required')
        return
      }
      setBusy(true)
      const ok = await app.login(username.trim(), password)
      if (ok) {
        navigate('/', { replace: true })
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  try {
    return (
      <div
        className="modal-overlay open"
        style={{ position: 'fixed', display: 'flex', background: 'linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%)' }}
      >
        <div className="modal-card" style={{ width: 420, maxWidth: '90%' }}>
          <div className="modal-header" style={{ justifyContent: 'center' }}>
            <div className="modal-title-container" style={{ textAlign: 'center' }}>
              <h3>Welcome to SAMAYAM</h3>
              <span className="modal-sanskrit-sub">समय</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div style={{ color: 'var(--status-full)', fontSize: '0.85rem', marginBottom: 12, fontWeight: 600 }}>
                  {error}
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>
                  Username <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button type="submit" className="primary-action-btn" disabled={busy}>
                {busy ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  } catch (e) {
    console.error('Error in Login render:', e)
    return <div>Login page error</div>
  }
}
