import { Camera, KeyRound, MailQuestion, Save, UserRound } from 'lucide-react'
import { useState } from 'react'
import {
  changePassword,
  requestPasswordReset,
  updateProfile,
} from '../api/profile.js'
import { useAuth } from '../context/useAuth.js'

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(' ')
  }

  return detail || fallback
}

function Profile() {
  const { updateStoredUser, user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(() => localStorage.getItem('devnexus_avatar') || '')
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
  })
  const [resetEmail, setResetEmail] = useState(user?.email || '')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)

  const handleNameSubmit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    setSavingName(true)

    try {
      const updatedUser = await updateProfile({ name: name.trim() })
      updateStoredUser(updatedUser)
      setStatus('Username updated successfully.')
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not update username.'))
    } finally {
      setSavingName(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    setSavingPassword(true)

    try {
      const response = await changePassword(passwords)
      setPasswords({
        current_password: '',
        new_password: '',
      })
      setStatus(response.message)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not update password.'))
    } finally {
      setSavingPassword(false)
    }
  }

  const handleResetSubmit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    setSendingReset(true)

    try {
      const response = await requestPasswordReset({ email: resetEmail })
      setStatus(response.message)
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, 'Could not request password reset.'))
    } finally {
      setSendingReset(false)
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      localStorage.setItem('devnexus_avatar', result)
      setAvatar(result)
      window.dispatchEvent(new Event('devnexus-avatar'))
      setStatus('Profile picture updated on this device.')
      setError('')
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="page-stack profile-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Profile settings</h1>
          <p>Manage your account details, password options, and profile picture.</p>
        </div>
      </div>

      {status && <div className="alert alert-success">{status}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="profile-grid">
        <article className="profile-card profile-summary">
          <div className="profile-avatar-large">
            {avatar ? (
              <img alt="" src={avatar} />
            ) : (
              <span>{user?.name?.charAt(0)?.toUpperCase() || 'D'}</span>
            )}
          </div>
          <div>
            <h2>{user?.name || 'DevNexus user'}</h2>
            <p>{user?.email || 'Signed in'}</p>
          </div>
        </article>

        <form className="profile-card" onSubmit={handleNameSubmit}>
          <div className="profile-card-heading">
            <UserRound size={22} />
            <div>
              <h2>Change username</h2>
              <p>Update the display name shown in your workspace.</p>
            </div>
          </div>
          <label className="form-label" htmlFor="profile-name">
            Username
          </label>
          <input
            className="form-control"
            id="profile-name"
            maxLength={100}
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <button
            className="btn btn-primary"
            disabled={savingName || name.trim() === user?.name}
            type="submit"
          >
            <Save size={18} />
            {savingName ? 'Saving...' : 'Save username'}
          </button>
        </form>

        <form className="profile-card" onSubmit={handlePasswordSubmit}>
          <div className="profile-card-heading">
            <KeyRound size={22} />
            <div>
              <h2>Change password</h2>
              <p>Create a new password for this account.</p>
            </div>
          </div>
          <input
            className="form-control"
            minLength={1}
            onChange={(event) =>
              setPasswords((current) => ({
                ...current,
                current_password: event.target.value,
              }))
            }
            placeholder="Current password"
            required
            type="password"
            value={passwords.current_password}
          />
          <input
            className="form-control"
            maxLength={128}
            minLength={8}
            onChange={(event) =>
              setPasswords((current) => ({
                ...current,
                new_password: event.target.value,
              }))
            }
            placeholder="New password"
            required
            type="password"
            value={passwords.new_password}
          />
          <button className="btn btn-primary" disabled={savingPassword} type="submit">
            <KeyRound size={18} />
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <form className="profile-card" onSubmit={handleResetSubmit}>
          <div className="profile-card-heading">
            <MailQuestion size={22} />
            <div>
              <h2>Forgot password</h2>
              <p>Send a reset link to your registered email address.</p>
            </div>
          </div>
          <input
            className="form-control"
            onChange={(event) => setResetEmail(event.target.value)}
            required
            type="email"
            value={resetEmail}
          />
          <button className="btn btn-outline-primary" disabled={sendingReset} type="submit">
            <MailQuestion size={18} />
            {sendingReset ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <article className="profile-card">
          <div className="profile-card-heading">
            <Camera size={22} />
            <div>
              <h2>Profile picture</h2>
              <p>Upload a new image for your account avatar.</p>
            </div>
          </div>
          <input
            accept="image/*"
            className="form-control"
            onChange={handleAvatarChange}
            type="file"
          />
          {avatar && (
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                localStorage.removeItem('devnexus_avatar')
                setAvatar('')
                window.dispatchEvent(new Event('devnexus-avatar'))
                setStatus('Profile picture removed from this device.')
                setError('')
              }}
              type="button"
            >
              <Camera size={18} />
              Remove picture
            </button>
          )}
        </article>
      </div>
    </section>
  )
}

export default Profile
