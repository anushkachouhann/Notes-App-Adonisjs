import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import EmailTemplates from '#services/email_templates'

class EmailService {
  private fromAddress = env.get('MAIL_FROM_ADDRESS')
  private fromName = env.get('MAIL_FROM_NAME')

  async sendWelcomeEmail(user: { name: string; email: string }): Promise<boolean> {
    try {
      await mail.send((message) => {
        message
          .to(user.email)
          .from(this.fromAddress, this.fromName)
          .subject('Welcome to Notes App!')
          .html(EmailTemplates.welcome({ name: user.name }))
      })
      console.log(`✅ Welcome email sent to: ${user.email}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${user.email}:`, error)
      return false
    }
  }

  async sendQueryEmail(
    user: { name: string; email: string },
    subject: string,
    content: string
  ): Promise<boolean> {
    try {
      // Send query to admin email
      const adminEmail = this.fromAddress

      await mail.send((message) => {
        message
          .to(adminEmail)
          .from(this.fromAddress, this.fromName)
          .replyTo(user.email)
          .subject(`Query: ${subject}`)
          .html(EmailTemplates.userQuery(user, subject, content))
      })
      console.log(`✅ Query email sent from: ${user.email}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to send query email:`, error)
      return false
    }
  }

  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    try {
      await mail.send((message) => {
        message
          .to(to)
          .from(this.fromAddress, this.fromName)
          .subject(subject)
          .html(EmailTemplates.quickEmail(content))
      })
      console.log(`✅ Email sent to: ${to}`)
      return true
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${to}:`)
      console.error('Error message:', error.message)
      console.error('Error cause:', error.cause)
      console.error('Full error:', error)
      return false
    }
  }
}

export default new EmailService()
