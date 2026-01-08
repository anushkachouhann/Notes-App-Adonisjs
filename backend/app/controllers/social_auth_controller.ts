import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import emailService from '#services/email_service'

export default class SocialAuthController {
  /**
   * Redirect to Google for authentication
   */
  async googleRedirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  /**
   * Handle Google callback
   */
  async googleCallback({ ally, auth, response }: HttpContext) {
    const google = ally.use('google')

    if (google.accessDenied()) {
      return response.badRequest({ success: false, message: 'Access denied' })
    }

    if (google.stateMisMatch()) {
      return response.badRequest({ success: false, message: 'State mismatch. Request expired.' })
    }

    if (google.hasError()) {
      return response.badRequest({ success: false, message: google.getError() || 'Unknown error' })
    }

    const googleUser = await google.user()

    // Check if user is new
    const existingUser = await User.findBy('email', googleUser.email)
    const isNewUser = !existingUser

    const user = await User.firstOrCreate(
      { email: googleUser.email },
      {
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        provider: 'google',
        providerId: googleUser.id,
        avatarUrl: googleUser.avatarUrl,
        role: 'user',
        password: null,
      }
    )

    // Update provider info if user exists but logged in with different method before
    if (!user.provider) {
      user.provider = 'google'
      user.providerId = googleUser.id
      user.avatarUrl = googleUser.avatarUrl
      await user.save()
    }

    await auth.use('web').login(user)

    // Send welcome email for new users
    if (isNewUser) {
      await emailService.sendWelcomeEmail({ name: user.name, email: user.email })
    }

    // Redirect to frontend after successful login
    return response.redirect('http://localhost:5173/auth/callback')
  }

  /**
   * Redirect to GitHub for authentication
   */
  async githubRedirect({ ally }: HttpContext) {
    return ally.use('github').redirect()
  }

  /**
   * Handle GitHub callback
   */
  async githubCallback({ ally, auth, response }: HttpContext) {
    const github = ally.use('github')

    if (github.accessDenied()) {
      return response.badRequest({ success: false, message: 'Access denied' })
    }

    if (github.stateMisMatch()) {
      return response.badRequest({ success: false, message: 'State mismatch. Request expired.' })
    }

    if (github.hasError()) {
      return response.badRequest({ success: false, message: github.getError() || 'Unknown error' })
    }

    const githubUser = await github.user()

    // Check if user is new
    const existingUser = await User.findBy('email', githubUser.email)
    const isNewUser = !existingUser

    const user = await User.firstOrCreate(
      { email: githubUser.email },
      {
        name: githubUser.name || githubUser.nickName || githubUser.email.split('@')[0],
        email: githubUser.email,
        provider: 'github',
        providerId: githubUser.id,
        avatarUrl: githubUser.avatarUrl,
        role: 'user',
        password: null,
      }
    )

    // Update provider info if user exists but logged in with different method before
    if (!user.provider) {
      user.provider = 'github'
      user.providerId = githubUser.id
      user.avatarUrl = githubUser.avatarUrl
      await user.save()
    }

    await auth.use('web').login(user)

    // Send welcome email for new users
    if (isNewUser) {
      await emailService.sendWelcomeEmail({ name: user.name, email: user.email })
    }

    // Redirect to frontend after successful login
    return response.redirect('http://localhost:5173/auth/callback')
  }
}
