import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { register, clearError } from '../store/authSlice'
import type { AppDispatch, RootState } from '../store'
import { UserIcon, MailIcon, LockIcon, GoogleIcon, GithubIcon } from './Icons'

const API_URL = 'http://localhost:3333'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(register({ name, email, password }))
  }

  const handleSocialLogin = (provider: 'google' | 'github') => {
    window.location.href = `${API_URL}/auth/${provider}`
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {error && <div className="error" onClick={() => dispatch(clearError())}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <UserIcon />
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="input-group">
          <MailIcon />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <LockIcon />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
      <div className="divider"><span>or continue with</span></div>
      <div className="social-buttons">
        <button className="google-btn" onClick={() => handleSocialLogin('google')}><GoogleIcon /> Google</button>
        <button className="github-btn" onClick={() => handleSocialLogin('github')}><GithubIcon /> GitHub</button>
      </div>
      <p>Already have an account? <Link to="/login">Sign in</Link></p>
    </div>
  )
}
