import { Navigate, useLocation } from 'react-router-dom'
import LoadingScreen from '../components/common/LoadingScreen.jsx'
import { useAuth } from '../context/useAuth.js'

function ProtectedRoute({ children }) {
  const { initializing, isAuthenticated } = useAuth()
  const location = useLocation()

  if (initializing) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
