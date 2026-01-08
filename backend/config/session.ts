import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

export default defineConfig({
  /**
   * Enable/disable session
   */
  enabled: true,

  /**
   * Cookie name for storing session id
   */
  cookieName: 'adonis_session',

  /**
   * Clear session when browser closes
   */
  clearWithBrowser: false,

  /**
   * Session age
   */
  age: '2h',

  /**
   * Cookie settings
   */
  cookie: {
    path: '/',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },

  /**
   * Session store - using cookie store for simplicity
   * You can also use 'file', 'redis', or 'database'
   */
  store: env.get('SESSION_DRIVER', 'cookie'),

  /**
   * Available stores
   */
  stores: {
    cookie: stores.cookie(),
  },
})
