import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
 

export default class LoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const start = Date.now()
    
    // Log request info
    console.log(`[${new Date().toISOString()}] ${ctx.request.method()} ${ctx.request.url()}`)
    
    // Call next middleware/controller
    await next()
    
    // Log response time
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] Completed in ${duration}ms`)
  }
}
