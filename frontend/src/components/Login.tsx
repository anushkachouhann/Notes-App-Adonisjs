import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { login, clearError } from '../store/authSlice'
import type { AppDispatch, RootState } from '../store'
import { MailIcon, LockIcon, GoogleIcon, GithubIcon } from './Icons'

const API_URL = 'http://localhost:3333'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  const handleSocialLogin = (provider: 'google' | 'github') => {
    window.location.href = `${API_URL}/auth/${provider}`
  }

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      {error && <div className="error" onClick={() => dispatch(clearError())}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <MailIcon />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <LockIcon />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <div className="divider"><span>or continue with</span></div>
      <div className="social-buttons">
        <button className="google-btn" onClick={() => handleSocialLogin('google')}><GoogleIcon /> Google</button>
        <button className="github-btn" onClick={() => handleSocialLogin('github')}><GithubIcon /> GitHub</button>
      </div>
      <p>Don't have an account? <Link to="/register">Sign up</Link></p>
    </div>
  )
}
