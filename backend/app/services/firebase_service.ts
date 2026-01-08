import admin from 'firebase-admin'
import app from '@adonisjs/core/services/app'
import { readFileSync } from 'node:fs'

class FirebaseService {
  private initialized = false

  private initialize() {
    if (this.initialized) return

    try {
      const serviceAccountPath = app.makePath('firebase-service-account.json')
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })

      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Firebase:', error)
      throw error
    }
  }

  /**
   * Send notification to a single device
   */
  async sendToDevice(
    token: string,
    notification: {
      title: string
      body: string
      imageUrl?: string
      data?: Record<string, string>
    }
  ) {
    this.initialize()

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data || {},
        webpush: {
          fcmOptions: {
            link: notification.data?.url || '/',
          },
        },
      }

      const response = await admin.messaging().send(message)
      return { success: true, response }
    } catch (error) {
      console.error('Error sending FCM notification:', error)
      return { success: false, error }
    }
  }

  /**
   * Send to multiple devices
   */
  async sendToMultipleDevices(
    tokens: string[],
    notification: {
      title: string
      body: string
      imageUrl?: string
      data?: Record<string, string>
    }
  ) {
    this.initialize()

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data || {},
      }

      const response = await admin.messaging().sendEachForMulticast(message)
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      }
    } catch (error) {
      console.error('Error sending FCM notifications:', error)
      return { success: false, error }
    }
  }

  /**
   * Send to topic (broadcast)
   */
  async sendToTopic(
    topic: string,
    notification: {
      title: string
      body: string
      imageUrl?: string
      data?: Record<string, string>
    }
  ) {
    this.initialize()

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data || {},
      }

      const response = await admin.messaging().send(message)
      return { success: true, response }
    } catch (error) {
      console.error('Error sending to topic:', error)
      return { success: false, error }
    }
  }

  /**
   * Subscribe device to topic
   */
  async subscribeToTopic(tokens: string[], topic: string) {
    this.initialize()

    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic)
      return { success: true, response }
    } catch (error) {
      return { success: false, error }
    }
  }

  /**
   * Unsubscribe device from topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string) {
    this.initialize()

    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic)
      return { success: true, response }
    } catch (error) {
      return { success: false, error }
    }
  }
}

export default new FirebaseService()
