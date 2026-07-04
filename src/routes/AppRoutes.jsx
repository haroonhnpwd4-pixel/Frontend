import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import ChatBoard from '../pages/ChatBoard.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import FilesPage from '../pages/FilesPage.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Profile from '../pages/Profile.jsx'
import RagChat from '../pages/RagChat.jsx'
import Register from '../pages/Register.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatBoard />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/rag" element={<RagChat />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
