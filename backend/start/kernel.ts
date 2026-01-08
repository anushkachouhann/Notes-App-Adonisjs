import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * Server middleware stack runs on every HTTP request
 */
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
])

/**
 * Named middleware collection
 * These can be applied to routes using middleware.name()
 */
const middleware = router.named({
  logger: () => import('#middleware/logger_middleware'),
  auth: () => import('#middleware/auth_middleware'),
  role: () => import('#middleware/role_middleware'),
})

export { middleware }
