import api from './api'

let firebaseApp: any = null
let messaging: any = null
let initialized = false
let messageListenerRegistered = false

/**
 * Register the Firebase service worker
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    console.log('Service Worker registered:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Lazily initialize Firebase only when needed
 */
async function initializeFirebase() {
  if (initialized) return

  try {
    const { initializeApp } = await import('firebase/app')
    const { getMessaging } = await import('firebase/messaging')

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }

    // Check if config is valid
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase config not found. Push notifications disabled.')
      initialized = true
      return
    }

    firebaseApp = initializeApp(firebaseConfig)

    // Register service worker first
    await registerServiceWorker()

    // Only initialize messaging if supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      messaging = getMessaging(firebaseApp)
    }

    initialized = true
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    initialized = true
  }
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  await initializeFirebase()

  if (!messaging) {
    console.warn('Push notifications not supported in this browser')
    return null
  }

  try {
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    const { getToken } = await import('firebase/messaging')

    // Get service worker registration
    const swRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    })

    if (token) {
      // Save token to backend
      await saveTokenToBackend(token)
      return token
    }

    return null
  } catch (error) {
    console.error('Error getting notification permission:', error)
    return null
  }
}

/**
 * Save FCM token to backend
 */
async function saveTokenToBackend(token: string): Promise<void> {
  try {
    await api.post('/fcm/token', {
      token,
      deviceType: 'web',
    })
    console.log('FCM token saved to backend')
  } catch (error) {
    console.error('Error saving FCM token:', error)
  }
}

/**
 * Delete FCM token from backend (call on logout)
 */
export async function deleteTokenFromBackend(token: string): Promise<void> {
  try {
    await api.delete('/fcm/token', { data: { token } })
    console.log('FCM token deleted from backend')
  } catch (error) {
    console.error('Error deleting FCM token:', error)
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: any) => void): () => void {
  if (!messaging) {
    // Return no-op if not initialized yet
    return () => {}
  }

  import('firebase/messaging').then(({ onMessage }) => {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      callback(payload)
    })
  })

  return () => {}
}

/**
 * Get current FCM token (if already granted) and sync with backend
 */
export async function getCurrentToken(): Promise<string | null> {
  await initializeFirebase()

  if (!messaging) return null

  try {
    const { getToken } = await import('firebase/messaging')
    const swRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    })

    if (token) {
      // Always sync token with backend (handles token refresh automatically)
      await saveTokenToBackend(token)
    }

    return token
  } catch (error) {
    console.error('Error getting current token:', error)
    return null
  }
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
  )
}

/**
 * Initialize Firebase and set up foreground message listener
 */
export async function initializeAndListenForMessages(
  callback: (payload: any) => void
): Promise<void> {
  await initializeFirebase()

  if (!messaging) {
    console.warn('Messaging not available')
    return
  }

  // Prevent registering multiple listeners
  if (messageListenerRegistered) {
    return
  }

  try {
    const { onMessage } = await import('firebase/messaging')
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      callback(payload)
    })
    messageListenerRegistered = true
    console.log('Foreground message listener registered')
  } catch (error) {
    console.error('Error setting up message listener:', error)
  }
}

/**
 * Refresh token and sync with backend - call this periodically or on app focus
 */
export async function refreshToken(): Promise<string | null> {
  if (Notification.permission !== 'granted') {
    return null
  }

  await initializeFirebase()

  if (!messaging) return null

  try {
    const { getToken } = await import('firebase/messaging')
    const swRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    })

    if (token) {
      await saveTokenToBackend(token)
      console.log('Token refreshed and synced with backend')
    }

    return token
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

export { messaging }
