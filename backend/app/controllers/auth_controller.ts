import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/auth'
import authService from '#services/auth_service'
import emailService from '#services/email_service'

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    if (await authService.emailExists(data.email)) {
      return response.conflict({
        success: false,
        message: 'Email already registered',
      })
    }

    const user = await authService.register(data)
    await auth.use('web').login(user)

    // Send welcome email to the newly registered user
    await emailService.sendWelcomeEmail({ name: user.name, email: user.email })

    return response.created({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    })
  }

  async login({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(loginValidator)

    try {
      const user = await authService.login(data)
      await auth.use('web').login(user)

      return response.ok({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      })
    } catch {
      return response.unauthorized({
        success: false,
        message: 'Invalid credentials',
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ success: true, message: 'Logged out successfully' })
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.user!
    return response.ok({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  }

  async sendQuickEmail({ request, response }: HttpContext) {
    const { email, subject, content } = request.only(['email', 'subject', 'content'])

    if (!email) {
      return response.badRequest({ success: false, message: 'Email is required' })
    }

    const sent = await emailService.sendEmail(
      email,
      subject || 'Message from Notes App',
      content || 'Hello from Notes App!'
    )

    if (sent) {
      return response.ok({ success: true, message: `Email sent to ${email}!` })
    }
    return response.internalServerError({ success: false, message: 'Failed to send email' })
  }

  async sendQuery({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const { subject, content } = request.only(['subject', 'content'])

    if (!subject?.trim() || !content?.trim()) {
      return response.badRequest({ success: false, message: 'Subject and content are required' })
    }

    const sent = await emailService.sendQueryEmail(
      { name: user.name, email: user.email },
      subject,
      content
    )

    if (sent) {
      return response.ok({
        success: true,
        message: 'Your query has been sent successfully! We will get back to you soon.',
      })
    }
    return response.internalServerError({ success: false, message: 'Failed to send query' })
  }
}
