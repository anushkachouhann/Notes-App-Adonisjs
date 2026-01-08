import { BaseMail } from '@adonisjs/mail'
import EmailTemplates from '#services/email_templates'

export default class WelcomeEmail extends BaseMail {
  from = 'onboarding@resend.dev'
  subject = 'Welcome to Notes App!'

  constructor(private user: { name: string; email: string }) {
    super()
  }

  prepare() {
    this.message.to(this.user.email)
    this.message.html(EmailTemplates.welcome(this.user))
  }
}
