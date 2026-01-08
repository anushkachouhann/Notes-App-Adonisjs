import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'node:fs/promises'
import Upload from '#models/upload'

export default class UploadsController {
  // File type configurations
  private fileConfigs = {
    image: {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    },
    video: {
      size: '100mb',
      extnames: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    },
    file: {
      size: '20mb',
      extnames: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'zip', 'rar'],
    },
  }

  // Upload image
  async uploadImage({ request, response, auth }: HttpContext) {
    return this.handleUpload(request, response, auth, 'image')
  }

  // Upload video
  async uploadVideo({ request, response, auth }: HttpContext) {
    return this.handleUpload(request, response, auth, 'video')
  }

  // Upload file (documents)
  async uploadFile({ request, response, auth }: HttpContext) {
    return this.handleUpload(request, response, auth, 'file')
  }

  // Generic upload handler
  private async handleUpload(
    request: HttpContext['request'],
    response: HttpContext['response'],
    auth: HttpContext['auth'],
    type: 'image' | 'video' | 'file'
  ) {
    const config = this.fileConfigs[type]
    const file = request.file('file', {
      size: config.size,
      extnames: config.extnames,
    })

    if (!file) {
      return response.badRequest({ error: `No ${type} file provided` })
    }

    if (!file.isValid) {
      return response.badRequest({ errors: file.errors })
    }

    const fileName = `${cuid()}.${file.extname}`
    const uploadPath = app.makePath('uploads', type + 's') // uploads/images, uploads/videos, uploads/files

    await file.move(uploadPath, { name: fileName })

    const url = `/uploads/${type}s/${fileName}`

    const savedUpload = await Upload.create({
      userId: auth.user!.id,
      filename: fileName,
      originalName: file.clientName,
      url: url,
      mimeType: file.headers['content-type'],
      size: file.size,
      type: type,
      disk: 'local',
    })

    return response.ok({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
      id: savedUpload.id,
      fileName: fileName,
      url: url,
      type: type,
    })
  }

  // List all uploads for user (with optional type filter)
  async index({ request, response, auth }: HttpContext) {
    const type = request.input('type') // ?type=image|video|file

    const query = Upload.query().where('user_id', auth.user!.id)

    if (type && ['image', 'video', 'file'].includes(type)) {
      query.where('type', type)
    }

    const uploads = await query.orderBy('created_at', 'desc')

    return response.ok({ uploads })
  }

  // Serve uploaded file
  async show({ params, response }: HttpContext) {
    const { type, filename } = params
    const filePath = app.makePath('uploads', type, filename)

    try {
      await fs.access(filePath)
      return response.download(filePath)
    } catch {
      return response.notFound({ error: 'File not found' })
    }
  }

  // Delete upload
  async delete({ params, response, auth }: HttpContext) {
    const upload = await Upload.query()
      .where('id', params.id)
      .where('user_id', auth.user!.id)
      .first()

    if (!upload) {
      return response.notFound({ error: 'Upload not found' })
    }

    const filePath = app.makePath('uploads', upload.type + 's', upload.filename)
    try {
      await fs.unlink(filePath)
    } catch {
      // File might already be deleted
    }

    await upload.delete()

    return response.ok({ message: 'Upload deleted successfully' })
  }
}
