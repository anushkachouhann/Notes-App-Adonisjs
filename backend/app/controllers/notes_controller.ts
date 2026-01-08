import type { HttpContext } from '@adonisjs/core/http'
import { createNoteValidator, updateNoteValidator } from '#validators/note'
import noteService from '#services/note_service'
import FirebaseService from '#services/firebase_service'
import FcmToken from '#models/fcm_token'

export default class NotesController {
  /**
   * Send push notification to user
   */
  private async sendNotification(
    userId: number,
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    try {
      const tokens = await FcmToken.query().where('user_id', userId).select('token')

      if (tokens.length > 0) {
        await FirebaseService.sendToMultipleDevices(
          tokens.map((t) => t.token),
          { title, body, data }
        )
      }
    } catch (error) {
      console.error('Failed to send push notification:', error)
    }
  }

  async index({ auth, response }: HttpContext) {
    const user = auth.user!
    const notes = await noteService.getAllByUser(user.id)

    return response.ok({
      success: true,
      data: notes,
    })
  }

  async adminIndex({ response }: HttpContext) {
    const notes = await noteService.getAll()

    return response.ok({
      success: true,
      data: notes,
    })
  }

  async show({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const note = await noteService.findByIdForUser(Number(params.id), user.id)

    if (!note) {
      return response.notFound({
        success: false,
        message: 'Note not found',
      })
    }

    return response.ok({
      success: true,
      data: note,
    })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(createNoteValidator)
    const note = await noteService.create(user.id, data)

    // Send push notification
    await this.sendNotification(user.id, '📝 Note Created', `"${note.title}" has been created.`, {
      type: 'note_created',
      noteId: String(note.id),
    })

    return response.created({
      success: true,
      message: 'Note created successfully',
      data: note,
    })
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const note = await noteService.findByIdForUser(Number(params.id), user.id)

    if (!note) {
      return response.notFound({
        success: false,
        message: 'Note not found',
      })
    }

    const data = await request.validateUsing(updateNoteValidator)
    const updated = await noteService.update(note, data)

    // Send push notification
    await this.sendNotification(
      user.id,
      '✏️ Note Updated',
      `"${updated.title}" has been updated.`,
      {
        type: 'note_updated',
        noteId: String(updated.id),
      }
    )

    return response.ok({
      success: true,
      message: 'Note updated successfully',
      data: updated,
    })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.user!
    const note = await noteService.findByIdForUser(Number(params.id), user.id)

    if (!note) {
      return response.notFound({
        success: false,
        message: 'Note not found',
      })
    }

    const noteTitle = note.title
    await noteService.delete(note)

    // Send push notification
    await this.sendNotification(user.id, '🗑️ Note Deleted', `"${noteTitle}" has been deleted.`, {
      type: 'note_deleted',
      noteId: String(params.id),
    })

    return response.ok({
      success: true,
      message: 'Note deleted successfully',
    })
  }
}
