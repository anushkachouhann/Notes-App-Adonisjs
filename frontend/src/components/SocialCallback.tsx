import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchCurrentUser } from '../store/authSlice'
import type { AppDispatch } from '../store'

export default function SocialCallback() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchCurrentUser())
      .unwrap()
      .then(() => {
        window.location.href = '/dashboard'
      })
      .catch(() => {
        window.location.href = '/login'
      })
  }, [dispatch])

  return (
    <div className="callback-loading">
      <p>Completing authentication...</p>
    </div>
  )
}
