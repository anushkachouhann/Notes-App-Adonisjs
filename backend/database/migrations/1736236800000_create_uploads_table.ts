import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'uploads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('filename').notNullable()
      table.string('original_name').notNullable()
      table.string('url').notNullable()
      table.string('mime_type').nullable()
      table.integer('size').unsigned().nullable()
      table.enum('type', ['image', 'video', 'file']).notNullable().defaultTo('file')
      table.string('disk').defaultTo('local')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
