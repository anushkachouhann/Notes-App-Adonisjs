import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Role middleware for role-based access control
 */
export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: string[] }) {
    const user = ctx.auth.user!

    if (!options.roles.includes(user.role)) {
      return ctx.response.forbidden({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      })
    }

    return next()
  }
}
