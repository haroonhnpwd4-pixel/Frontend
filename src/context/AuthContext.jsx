import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import api from '../api/axios.js'
import AuthContext from './auth-context.js'

function readStoredUser() {
  const storedUser = localStorage.getItem('devnexus_user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('devnexus_user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('devnexus_token'))
  const [user, setUser] = useState(readStoredUser)
  const [initializing, setInitializing] = useState(Boolean(token))

  const persistSession = useCallback((authData) => {
    localStorage.setItem('devnexus_token', authData.access_token)
    localStorage.setItem('devnexus_user', JSON.stringify(authData.user))
    setToken(authData.access_token)
    setUser(authData.user)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('devnexus_token')
    localStorage.removeItem('devnexus_user')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const response = await api.get('/auth/me')
    localStorage.setItem('devnexus_user', JSON.stringify(response.data))
    setUser(response.data)
    return response.data
  }, [])

  const updateStoredUser = useCallback((nextUser) => {
    localStorage.setItem('devnexus_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  useEffect(() => {
    if (!token) {
      setInitializing(false)
      return
    }

    refreshUser()
      .catch(() => {
        clearSession()
      })
      .finally(() => {
        setInitializing(false)
      })
  }, [clearSession, refreshUser, token])

  const login = useCallback(
    async (payload) => {
      const response = await api.post('/auth/login', payload)
      persistSession(response.data)
      return response.data
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload) => {
      const response = await api.post('/auth/register', payload)
      persistSession(response.data)
      return response.data
    },
    [persistSession],
  )

  const value = useMemo(
    () => ({
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      logout: clearSession,
      refreshUser,
      register,
      token,
      updateStoredUser,
      user,
    }),
    [
      clearSession,
      initializing,
      login,
      refreshUser,
      register,
      token,
      updateStoredUser,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
