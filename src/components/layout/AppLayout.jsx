import {
  Bot,
  FileQuestion,
  Files,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.js'

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
  },
  {
    label: 'AI Chat',
    path: '/chat',
    icon: MessageSquareText,
  },
  {
    label: 'Files',
    path: '/files',
    icon: Files,
  },
  {
    label: 'Document Q&A',
    path: '/rag',
    icon: FileQuestion,
  },
  {
    label: 'Settings',
    path: '/profile',
    icon: Settings,
  },
]

function AppLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [avatar, setAvatar] = useState(() => localStorage.getItem('devnexus_avatar') || '')
  const currentPage =
    navItems.find((item) => item.path === location.pathname)?.label ||
    (location.pathname === '/profile' ? 'Profile' : 'Workspace')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const closeMobileNav = () => {
    setMobileNavOpen(false)
  }

  useEffect(() => {
    const syncAvatar = () => {
      setAvatar(localStorage.getItem('devnexus_avatar') || '')
    }

    window.addEventListener('devnexus-avatar', syncAvatar)
    window.addEventListener('storage', syncAvatar)

    return () => {
      window.removeEventListener('devnexus-avatar', syncAvatar)
      window.removeEventListener('storage', syncAvatar)
    }
  }, [])

  return (
    <div className="workspace-layout">
      <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Bot size={22} />
          </div>
          <div>
            <strong>DevNexus</strong>
            <span>AI Chat Board</span>
          </div>
        </div>

        <label className="sidebar-search">
          <Search size={17} />
          <input placeholder="Search..." type="search" />
        </label>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/dashboard'}
                key={item.path}
                onClick={closeMobileNav}
                to={item.path}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-account"
            onClick={() => {
              closeMobileNav()
              navigate('/profile')
            }}
            type="button"
          >
            <div className="user-pill">
              {avatar ? (
                <img alt="" src={avatar} />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase() || 'D'}</span>
              )}
            </div>
            <div className="user-meta">
              <strong>{user?.name || 'DevNexus user'}</strong>
              <span>{user?.email || 'Signed in'}</span>
            </div>
          </button>
          <button className="btn btn-outline-light w-100" onClick={handleLogout} type="button">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-backdrop"
          onClick={closeMobileNav}
          type="button"
        />
      )}

      <div className="workspace-main">
        <header className="topbar">
          <button
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            className="icon-button mobile-menu-button"
            onClick={() => setMobileNavOpen((current) => !current)}
            type="button"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="topbar-title">
            <span className="eyebrow">Workspace</span>
            <strong>{currentPage}</strong>
          </div>

        </header>

        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
