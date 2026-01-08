import Note from '#models/note'

export interface CreateNoteData {
  title: string
  content: string
}

export interface UpdateNoteData {
  title?: string
  content?: string
}

class NoteService { 
  async getAllByUser(userId: number) {
    return Note.query().where('userId', userId).orderBy('createdAt', 'desc')
  }
 
  async getAll() {
    return Note.query().preload('user').orderBy('createdAt', 'desc')
  }
 
  async findById(id: number) {
    return Note.find(id)
  }
 
  async findByIdForUser(id: number, userId: number) {
    return Note.query().where('id', id).where('userId', userId).first()
  }
 
  async create(userId: number, data: CreateNoteData) {
    return Note.create({
      userId,
      title: data.title,
      content: data.content,
    })
  } 

  async update(note: Note, data: UpdateNoteData) {
    note.merge(data)
    await note.save()
    return note
  }
 
  async delete(note: Note) {
    await note.delete()
    return note
  }
}

export default new NoteService()
