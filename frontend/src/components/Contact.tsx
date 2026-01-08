import { useState } from 'react'
import api from '../services/api'

export default function Contact() {
  const [formData, setFormData] = useState({ subject: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.content.trim()) return

    setSubmitting(true)
    setMessage(null)

    try {
      const response = await api.post('/auth/query', formData)
      setMessage({ type: 'success', text: response.data.message })
      setFormData({ subject: '', content: '' })
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send query. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-container">
      <h3>Ask a Query</h3>
      <p className="contact-description">
        Have a question or need help? Send us a message and we'll get back to you.
      </p>

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            placeholder="What's your query about?"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Message</label>
          <textarea
            id="content"
            placeholder="Describe your question or issue in detail..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            required
          />
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✓' : '✕'} {message.text}
          </div>
        )}

        <button type="submit" disabled={submitting} className="submit-btn">
          {submitting ? 'Sending...' : 'Send Query'}
        </button>
      </form>
    </div>
  )
}
