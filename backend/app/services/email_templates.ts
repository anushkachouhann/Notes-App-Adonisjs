/**
 * Email Templates Service
 * Centralized HTML email templates matching the frontend design
 */

const baseStyles = `
  body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; }
  .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
  .content { padding: 32px; color: #e2e8f0; }
  .content h2 { color: #f8fafc; margin-top: 0; }
  .content p { line-height: 1.6; margin: 16px 0; }
  .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
  .footer { padding: 24px 32px; background-color: #0f172a; text-align: center; color: #64748b; font-size: 14px; }
`

export const EmailTemplates = {
  welcome(user: { name: string }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}
          .features { background-color: #0f172a; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature { display: flex; align-items: center; margin: 12px 0; }
          .feature-icon { font-size: 24px; margin-right: 12px; }
          .feature-text { color: #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Notes App!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name}!</h2>
            <p>Thank you for registering with Notes App. Your account has been successfully created!</p>
            
            <p>With Notes App, you can:</p>
            <div class="features">
              <div class="feature">
                <span class="feature-icon">📝</span>
                <span class="feature-text">Create and organize your personal notes</span>
              </div>
              <div class="feature">
                <span class="feature-icon">📁</span>
                <span class="feature-text">Upload and manage files, images & videos</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🔒</span>
                <span class="feature-text">Keep your data secure with authentication</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✉️</span>
                <span class="feature-text">Contact support anytime you need help</span>
              </div>
            </div>

            <p>Ready to get started? Click the button below to access your dashboard:</p>
            <a href="http://localhost:5173/dashboard" class="button">Go to Dashboard</a>
            
            <p style="margin-top: 30px; color: #94a3b8;">If you have any questions or need assistance, feel free to use the Contact section in your dashboard or reply to this email.</p>
          </div>
          <div class="footer">
            <p>Welcome aboard! 🚀</p>
            <p>&copy; 2025 Notes App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  quickEmail(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Notes App</h1>
          </div>
          <div class="content">
            <p>${content}</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Notes App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  userQuery(user: { name: string; email: string }, subject: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}
          .info-box { background-color: #0f172a; padding: 16px; border-radius: 8px; margin: 16px 0; }
          .info-row { display: flex; margin: 8px 0; }
          .info-label { color: #94a3b8; min-width: 80px; }
          .info-value { color: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New User Query</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <div class="info-row"><span class="info-label">From:</span><span class="info-value">${user.name}</span></div>
              <div class="info-row"><span class="info-label">Email:</span><span class="info-value">${user.email}</span></div>
              <div class="info-row"><span class="info-label">Subject:</span><span class="info-value">${subject}</span></div>
            </div>
            <h2>Message:</h2>
            <p>${content.replace(/\n/g, '<br>')}</p>
          </div>
          <div class="footer">
            <p>Reply directly to ${user.email} to respond to this query.</p>
            <p>&copy; 2025 Notes App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  passwordReset(user: { name: string }, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p style="color: #94a3b8; font-size: 14px;">This link will expire in 1 hour.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Notes App. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
}

export default EmailTemplates
