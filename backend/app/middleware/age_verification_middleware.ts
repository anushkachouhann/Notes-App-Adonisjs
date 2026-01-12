import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'

/**
 * Age verification middleware for 18+ restricted routes (e.g., voting)
 */
export default class AgeVerificationMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { minAge?: number } = {}
  ) {
    const minAge = options.minAge ?? 18
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ message: 'Authentication required' })
    }

    if (!user.birthdate) {
      return ctx.response.forbidden({
        message: 'Birthdate is required for age verification',
        code: 'BIRTHDATE_REQUIRED',
      })
    }

    const birthdate = DateTime.fromJSDate(new Date(user.birthdate.toString()))
    const age = Math.floor(DateTime.now().diff(birthdate, 'years').years)

    if (age < minAge) {
      return ctx.response.forbidden({
        message: `You must be at least ${minAge} years old to access this resource`,
        code: 'AGE_RESTRICTED',
        requiredAge: minAge,
        currentAge: age,
      })
    }

    return next()
  }
}
