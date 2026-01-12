import emitter from '@adonisjs/core/services/emitter'
import VoteListener from '#listeners/vote_listener'

const voteListener = new VoteListener()

/**
 * Register event listeners
 */
emitter.on('vote:created', (event) => voteListener.onVoteCreated(event))
emitter.on('vote:updated', (event) => voteListener.onVoteUpdated(event))

/**
 * User events
 */
emitter.on('user:registered', (event) => {
  console.log(`New user registered: ${event.email}`)
  // Add welcome email, onboarding logic, etc.
})

emitter.on('user:age_verified', (event) => {
  console.log(`User ${event.userId} verified as ${event.age} years old`)
  // Add age verification logging, unlock features, etc.
})
