import vine from '@vinejs/vine'

/**
 * Validator for creating a new note
 */
export const createNoteValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(100),
    content: vine.string().trim().minLength(1).maxLength(1000),
  })
)

/**
 * Validator for updating a note (all fields optional)
 */
export const updateNoteValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(100).optional(),
    content: vine.string().trim().minLength(1).maxLength(1000).optional(),
  })
)
