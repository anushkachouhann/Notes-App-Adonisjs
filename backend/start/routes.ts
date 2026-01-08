import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const UploadsController = () => import('#controllers/uploads_controller')

const AuthController = () => import('#controllers/auth_controller')
const NotesController = () => import('#controllers/notes_controller')
const SocialAuthController = () => import('#controllers/social_auth_controller')
const FcmNotificationsController = () => import('#controllers/fcm_notifications_controller')
 
router.get('/', async () => {
  return { message: 'Notes API is running!', version: '1.0.0' }
})
 
// Public Auth routes - social auth
router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])

    router.post('/send-email', [AuthController, 'sendQuickEmail'])
 
    router.get('/google', [SocialAuthController, 'googleRedirect'])
    router.get('/google/callback', [SocialAuthController, 'googleCallback'])
    router.get('/github', [SocialAuthController, 'githubRedirect'])
    router.get('/github/callback', [SocialAuthController, 'githubCallback'])
  })
  .prefix('/auth')
 
// Protected Auth routes 
router
  .group(() => {
    router.post('/logout', [AuthController, 'logout'])
    router.get('/me', [AuthController, 'me'])
    router.post('/query', [AuthController, 'sendQuery'])
  })
  .prefix('/auth')
  .use(middleware.auth())

// Notes routes (protected - user's own notes) - crud
router
  .group(() => {
    router.get('/', [NotesController, 'index'])
    router.get('/:id', [NotesController, 'show'])
    router.post('/', [NotesController, 'store'])
    router.put('/:id', [NotesController, 'update'])
    router.delete('/:id', [NotesController, 'destroy'])
  })
  .prefix('/notes')
  .use([middleware.auth(), middleware.logger()])

// Admin routes (protected - admin only)
router
  .group(() => {
    router.get('/notes', [NotesController, 'adminIndex'])
  })
  .prefix('/admin')
  .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

// Upload routes (protected) - file uploads
router
  .group(() => {
    router.post('/image', [UploadsController, 'uploadImage'])
    router.post('/video', [UploadsController, 'uploadVideo'])
    router.post('/file', [UploadsController, 'uploadFile'])
    router.get('/list', [UploadsController, 'index']) // ?type=image|video|file
    router.delete('/:id', [UploadsController, 'delete'])
  })
  .prefix('/upload')
  .use(middleware.auth())


// Serve uploaded files (public) - /uploads/images/:filename, /uploads/videos/:filename, /uploads/files/:filename
router.get('/uploads/:type/:filename', [UploadsController, 'show'])
 

// Save FCM token (can be called by authenticated or guest users)
router.post('/fcm/token', [FcmNotificationsController, 'saveToken'])

// Protected FCM routes
router
  .group(() => {
    router.delete('/token', [FcmNotificationsController, 'deleteToken'])
    router.post('/subscribe/:topic', [FcmNotificationsController, 'subscribeToTopic'])
    router.post('/unsubscribe/:topic', [FcmNotificationsController, 'unsubscribeFromTopic'])
  })
  .prefix('/fcm')
  .use(middleware.auth())

// Admin-only notification routes
router
  .group(() => {
    router.post('/send-to-user', [FcmNotificationsController, 'sendToUser'])
    router.post('/broadcast', [FcmNotificationsController, 'broadcast'])
  })
  .prefix('/fcm')
  .use([middleware.auth(), middleware.role({ roles: ['admin'] })])
