import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  async run() {
    const existingUser = await User.findBy('email', 'anushka12@gmail.com')

    if (!existingUser) {
      await User.create({
        name: 'Anushka',
        email: 'anushka12@gmail.com',
        password: await hash.make('anushka1234'),
        role: 'user',
      })
      console.log('User seeded: anushka12@gmail.com')
    } else {
      console.log('User already exists: anushka12@gmail.com')
    }
  }
}
