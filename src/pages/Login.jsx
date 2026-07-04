import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import LoadingScreen from '../components/common/LoadingScreen.jsx'
import { useAuth } from '../context/useAuth.js'

function getErrorMessage(error) {
  const detail = error.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(' ')
  }

  if (detail) {
    if (String(detail).includes('DEVNEXUS_DATABASE_URL')) {
      return 'Backend database is not configured. Add DEVNEXUS_DATABASE_URL to the backend .env file and restart FastAPI.'
    }

    return detail
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Cannot reach the backend. Make sure FastAPI is running on localhost:8001.'
  }

  return 'Login failed. Please try again.'
}

function Login() {
  const { initializing, isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  if (initializing) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <span className="eyebrow">Welcome back</span>
        <h1 id="login-title">Login</h1>
        <p>Access your AI chat board, files, RAG tools, and generators.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              className="form-control"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="user@example.com"
              required
              type="email"
              value={form.email}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className="form-control"
              id="password"
              minLength={1}
              name="password"
              onChange={handleChange}
              placeholder="password123"
              required
              type="password"
              value={form.password}
            />
          </div>

          <button className="btn btn-primary w-100" disabled={submitting} type="submit">
            <LogIn size={18} />
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New to DevNexus? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default Login
