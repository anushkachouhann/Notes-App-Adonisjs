import { HttpContext } from '@adonisjs/core/http'
import FirebaseService from '#services/firebase_service'
import FcmToken from '#models/fcm_token'

export default class FcmNotificationsController {
  /**
   * Save FCM token for the current user or guest
   */
  async saveToken({ request, response, auth }: HttpContext) {
    const { token, deviceType } = request.only(['token', 'deviceType'])
 
    if (!token) {
      return response.badRequest({ error: 'Token is required' })
    }

    // Try to get authenticated user, but don't fail if not authenticated
    let userId: number | null = null
    try {
      await auth.check()
      userId = auth.user?.id || null
    } catch {
      // Guest user - that's fine
    }

    await FcmToken.updateOrCreate(
      { token },
      {
        userId,
        token,
        deviceType: deviceType || 'web',
      }
    )

    // Subscribe to 'all-users' topic for broadcasts
    await FirebaseService.subscribeToTopic([token], 'all-users')

    return response.created({ message: 'Token saved successfully' })
  }

  /**
   * Delete FCM token (logout/unsubscribe)
   */
  async deleteToken({ request, response }: HttpContext) {
    const { token } = request.only(['token'])

    if (!token) {
      return response.badRequest({ error: 'Token is required' })
    }

    await FcmToken.query().where('token', token).delete()

    // Unsubscribe from all-users topic
    await FirebaseService.unsubscribeFromTopic([token], 'all-users')

    return response.ok({ message: 'Token deleted successfully' })
  }

  /**
   * Subscribe to a topic
   */
  async subscribeToTopic({ response, params, auth }: HttpContext) {
    const topic = params.topic
    const tokens = await FcmToken.query()
      .where('user_id', auth.user!.id)
      .select('token')

    if (tokens.length === 0) {
      return response.notFound({ error: 'No registered devices found' })
    }

    const result = await FirebaseService.subscribeToTopic(
      tokens.map((t) => t.token),
      topic
    )

    return response.ok(result)
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic({ response, params, auth }: HttpContext) {
    const topic = params.topic
    const tokens = await FcmToken.query()
      .where('user_id', auth.user!.id)
      .select('token')

    if (tokens.length === 0) {
      return response.notFound({ error: 'No registered devices found' })
    }

    const result = await FirebaseService.unsubscribeFromTopic(
      tokens.map((t) => t.token),
      topic
    )

    return response.ok(result)
  }

  /**
   * Send notification to a specific user (Admin only)
   */
  async sendToUser({ request, response }: HttpContext) {
    const { userId, title, body, imageUrl, data } = request.all()

    if (!userId || !title || !body) {
      return response.badRequest({ error: 'userId, title, and body are required' })
    }

    const tokens = await FcmToken.query()
      .where('user_id', userId)
      .select('token')

    if (tokens.length === 0) {
      return response.notFound({ error: 'No tokens found for this user' })
    }

    const result = await FirebaseService.sendToMultipleDevices(
      tokens.map((t) => t.token),
      { title, body, imageUrl, data }
    )

    return response.ok(result)
  }

  /**
   * Broadcast notification to all users (Admin only)
   */
  async broadcast({ request, response }: HttpContext) {
    const { title, body, imageUrl, data } = request.all()

    if (!title || !body) {
      return response.badRequest({ error: 'title and body are required' })
    }

    const result = await FirebaseService.sendToTopic('all-users', {
      title,
      body,
      imageUrl,
      data,
    })

    return response.ok(result)
  }
}
