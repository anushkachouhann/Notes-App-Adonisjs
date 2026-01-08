import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from './store/authSlice'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import SocialCallback from './components/SocialCallback'
import type { AppDispatch, RootState } from './store'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    dispatch(fetchCurrentUser()).finally(() => setInitializing(false))
  }, [dispatch])

  if (initializing) {
    return <div className="app"><div className="loading">Loading...</div></div>
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/auth/callback" element={<SocialCallback />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
