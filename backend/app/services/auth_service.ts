import User from '#models/user'

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

class AuthService {
  async register(data: RegisterData) {
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'user',
    })

    return user
  }

  async login(data: LoginData) {
    const user = await User.verifyCredentials(data.email, data.password)
    return user
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await User.findBy('email', email)
    return !!user
  }
}

export default new AuthService()
