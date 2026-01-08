import { useState, useEffect } from 'react'
import api from '../services/api'

interface Note {
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes')
      setNotes(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      if (editingNote) {
        const response = await api.put(`/notes/${editingNote.id}`, formData)
        setNotes(notes.map((n) => (n.id === editingNote.id ? response.data.data : n)))
        setEditingNote(null)
      } else {
        const response = await api.post('/notes', formData)
        setNotes([response.data.data, ...notes])
      }
      setFormData({ title: '', content: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save note')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({ title: note.title, content: note.content })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this note?')) return

    try {
      await api.delete(`/notes/${id}`)
      setNotes(notes.filter((n) => n.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete note')
    }
  }

  const handleCancel = () => {
    setEditingNote(null)
    setFormData({ title: '', content: '' })
  }

  if (loading) return <div className="loading">Loading notes...</div>

  return (
    <div className="notes-container">
      <h3>My Notes</h3>

      <form onSubmit={handleSubmit} className="note-form">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={3}
          required
        />
        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}
          </button>
          {editingNote && (
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="no-notes">No notes yet. Create your first note!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <h4>{note.title}</h4>
              <p>{note.content}</p>
              <div className="note-meta">
                <small>{new Date(note.createdAt).toLocaleDateString()}</small>
                <div className="note-actions">
                  <button onClick={() => handleEdit(note)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
