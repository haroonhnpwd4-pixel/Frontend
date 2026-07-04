import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
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

  return 'Registration failed. Please try again.'
}

function Register() {
  const { initializing, isAuthenticated, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (caughtError) {
      setError(getErrorMessage(caughtError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <span className="eyebrow">Create account</span>
        <h1 id="register-title">Register</h1>
        <p>Create a secure account for your DevNexus AI workspace.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              autoComplete="name"
              className="form-control"
              id="name"
              maxLength={100}
              minLength={2}
              name="name"
              onChange={handleChange}
              placeholder="user"
              required
              type="text"
              value={form.name}
            />
          </div>

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
              autoComplete="new-password"
              className="form-control"
              id="password"
              maxLength={128}
              minLength={8}
              name="password"
              onChange={handleChange}
              placeholder="password123"
              required
              type="password"
              value={form.password}
            />
          </div>

          <button className="btn btn-primary w-100" disabled={submitting} type="submit">
            <UserPlus size={18} />
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register
