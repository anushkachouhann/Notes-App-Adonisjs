import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import type { AppDispatch, RootState } from '../store'
import { LogoutIcon } from './Icons'
import Notes from './Notes'
import Uploads from './Uploads'
import Contact from './Contact'
import NotificationManager from './NotificationManager'

type Tab = 'notes' | 'uploads' | 'contact' | 'notifications'

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user, loading } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState<Tab>('notes')

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          {user?.avatarUrl && <img src={user.avatarUrl} alt="Avatar" className="avatar" />}
          <div>
            <h2>Welcome, {user?.name}!</h2>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn" disabled={loading}>
          <LogoutIcon /> {loading ? 'Logging out...' : 'Logout'}
        </button>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes
        </button>
        <button
          className={`nav-tab ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
        >
          📁 Uploads
        </button>
        <button
          className={`nav-tab ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          ✉️ Contact
        </button>
        <button
          className={`nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'notes' && <Notes />}
        {activeTab === 'uploads' && <Uploads />}
        {activeTab === 'contact' && <Contact />}
        {activeTab === 'notifications' && <NotificationManager />}
      </main>
    </div>
  )
}
