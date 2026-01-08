import { useEffect, useState, useCallback } from 'react'
import {
  requestNotificationPermission,
  getCurrentToken,
  deleteTokenFromBackend,
  isFirebaseConfigured,
  initializeAndListenForMessages,
  refreshToken,
} from '../services/firebase'

interface Notification {
  id: string
  title: string
  body: string
  timestamp: Date
}

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(true)
  const [initializing, setInitializing] = useState(true)

  const handleNewNotification = useCallback((payload: any) => {
    const title = payload.notification?.title || 'New Notification'
    const body = payload.notification?.body || ''

    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      body,
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev].slice(0, 10))

    // Show system notification for foreground messages
    // (Service worker only handles background messages)
    if (window.Notification.permission === 'granted') {
      new window.Notification(title, {
        body,
        icon: '/vite.svg',
        tag: payload.messageId || Date.now().toString(), // Prevent duplicate notifications
      })
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      // Check if Firebase is configured
      if (!isFirebaseConfigured()) {
        setConfigured(false)
        setInitializing(false)
        return
      }

      // Check current permission status
      if ('Notification' in window) {
        setPermission(Notification.permission)
      }

      // Get existing token if permission already granted
      if (Notification.permission === 'granted') {
        const token = await getCurrentToken()
        setFcmToken(token)

        // Initialize messaging and listen for foreground messages
        await initializeAndListenForMessages(handleNewNotification)
      }

      setInitializing(false)
    }

    init()

    // Refresh token when user comes back to the app (handles token expiry)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && Notification.permission === 'granted') {
        const newToken = await refreshToken()
        if (newToken) {
          setFcmToken(newToken)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleNewNotification])

  const handleEnableNotifications = async () => {
    setLoading(true)
    try {
      const token = await requestNotificationPermission()
      if (token) {
        setFcmToken(token)
        setPermission('granted')
        // Start listening for messages after enabling
        await initializeAndListenForMessages(handleNewNotification)
      } else {
        setPermission(Notification.permission)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    if (fcmToken) {
      setLoading(true)
      try {
        await deleteTokenFromBackend(fcmToken)
        setFcmToken(null)
      } finally {
        setLoading(false)
      }
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Show loading state during initialization
  if (initializing) {
    return (
      <div className="notification-manager">
        <div className="notification-header">
          <h3>🔔 Push Notifications</h3>
        </div>
        <p>Loading...</p>
      </div>
    )
  }

  // Show configuration message if Firebase is not set up
  if (!configured) {
    return (
      <div className="notification-manager">
        <div className="notification-header">
          <h3>🔔 Push Notifications</h3>
        </div>
        <div className="permission-denied-msg" style={{ background: '#fff3cd', color: '#856404' }}>
          <strong>Firebase not configured.</strong>
          <p style={{ margin: '8px 0 0', textAlign: 'left' }}>
            To enable push notifications, add your Firebase configuration to the .env file:
          </p>
          <ul style={{ textAlign: 'left', margin: '8px 0', paddingLeft: '20px' }}>
            <li>VITE_FIREBASE_API_KEY</li>
            <li>VITE_FIREBASE_PROJECT_ID</li>
            <li>VITE_FIREBASE_VAPID_KEY</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="notification-manager">
      <div className="notification-header">
        <h3>🔔 Push Notifications</h3>
        <div className="notification-status">
          {permission === 'granted' ? (
            <span className="status-enabled">✓ Enabled</span>
          ) : permission === 'denied' ? (
            <span className="status-denied">✗ Blocked</span>
          ) : (
            <span className="status-default">Not enabled</span>
          )}
        </div>
      </div>

      <div className="notification-controls">
        {permission === 'default' && (
          <button onClick={handleEnableNotifications} disabled={loading} className="btn-enable">
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </button>
        )}

        {permission === 'granted' && !fcmToken && (
          <button onClick={handleEnableNotifications} disabled={loading} className="btn-enable">
            {loading ? 'Activating...' : 'Activate Notifications'}
          </button>
        )}

        {permission === 'granted' && fcmToken && (
          <>
            <button onClick={handleDisableNotifications} disabled={loading} className="btn-disable">
              {loading ? 'Disabling...' : 'Disable Notifications'}
            </button>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Token: {fcmToken.substring(0, 20)}...
            </p>
          </>
        )}

        {permission === 'denied' && (
          <p className="permission-denied-msg">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notification-list">
          <div className="notification-list-header">
            <h4>Recent Notifications</h4>
            <button onClick={clearNotifications} className="btn-clear">
              Clear All
            </button>
          </div>
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-item">
              <div className="notification-content">
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
                <small>{notification.timestamp.toLocaleTimeString()}</small>
              </div>
              <button onClick={() => dismissNotification(notification.id)} className="btn-dismiss">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
