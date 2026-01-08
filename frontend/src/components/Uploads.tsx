import { useState, useEffect } from 'react'
import api from '../services/api'

interface Upload {
  id: number
  filename: string
  originalName: string
  url: string
  type: 'image' | 'video' | 'file'
  size: number
  createdAt: string
}

type UploadType = 'image' | 'video' | 'file'

const ACCEPT_TYPES = {
  image: 'image/*',
  video: 'video/*',
  file: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar',
}

export default function Uploads() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<UploadType | 'all'>('all')
  const [uploadType, setUploadType] = useState<UploadType>('image')

  useEffect(() => {
    fetchUploads()
  }, [activeTab])

  const fetchUploads = async () => {
    try {
      const params = activeTab !== 'all' ? `?type=${activeTab}` : ''
      const response = await api.get(`/upload/list${params}`)
      setUploads(response.data.uploads)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch uploads')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File

    if (!file || !file.size) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    try {
      await api.post(`/upload/${uploadType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess(`${uploadType} uploaded successfully!`)
      fetchUploads()
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this file?')) return

    try {
      await api.delete(`/upload/${id}`)
      setUploads(uploads.filter((u) => u.id !== id))
      setSuccess('File deleted successfully')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete')
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileUrl = (upload: Upload) => `http://localhost:3333${upload.url}`

  const renderPreview = (upload: Upload) => {
    const url = getFileUrl(upload)
    if (upload.type === 'image') {
      return <img src={url} alt={upload.originalName} className="upload-preview" />
    }
    if (upload.type === 'video') {
      return <video src={url} controls className="upload-preview" />
    }
    return <div className="file-icon">📄</div>
  }

  return (
    <div className="uploads-container">
      <h3>File Uploads</h3>

      <form onSubmit={handleUpload} className="upload-form">
        <div className="upload-type-selector">
          <label>
            <input
              type="radio"
              name="uploadType"
              value="image"
              checked={uploadType === 'image'}
              onChange={() => setUploadType('image')}
            />
            Image
          </label>
          <label>
            <input
              type="radio"
              name="uploadType"
              value="video"
              checked={uploadType === 'video'}
              onChange={() => setUploadType('video')}
            />
            Video
          </label>
          <label>
            <input
              type="radio"
              name="uploadType"
              value="file"
              checked={uploadType === 'file'}
              onChange={() => setUploadType('file')}
            />
            Document
          </label>
        </div>
        <input type="file" name="file" accept={ACCEPT_TYPES[uploadType]} required />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : `Upload ${uploadType}`}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="tabs">
        {(['all', 'image', 'video', 'file'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1) + 's'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading uploads...</div>
      ) : (
        <div className="uploads-grid">
          {uploads.length === 0 ? (
            <p className="no-uploads">No uploads yet</p>
          ) : (
            uploads.map((upload) => (
              <div key={upload.id} className="upload-card">
                {renderPreview(upload)}
                <div className="upload-info">
                  <p className="upload-name" title={upload.originalName}>
                    {upload.originalName}
                  </p>
                  <small>{formatSize(upload.size)}</small>
                  <div className="upload-actions">
                    <a href={getFileUrl(upload)} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                    <button onClick={() => handleDelete(upload.id)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
