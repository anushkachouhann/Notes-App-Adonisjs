import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('provider').nullable() // 'google', 'github', or null for email/password
      table.string('provider_id').nullable() // ID from the OAuth provider
      table.string('avatar_url').nullable() // Profile picture URL
      table.string('password').nullable().alter() // Make password nullable for social auth users
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('provider')
      table.dropColumn('provider_id')
      table.dropColumn('avatar_url')
      table.string('password').notNullable().alter()
    })
  }
}
