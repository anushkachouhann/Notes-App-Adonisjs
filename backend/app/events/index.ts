import emitter from '@adonisjs/core/services/emitter'

/**
 * Event Types - Define all application events here
 */
export interface VoteCreatedEvent {
  userId: number
  voteId: number
  pollId: number
  choice: string
  timestamp: Date
}

export interface VoteUpdatedEvent {
  userId: number
  voteId: number
  pollId: number
  oldChoice: string
  newChoice: string
  timestamp: Date
}

export interface UserRegisteredEvent {
  userId: number
  email: string
  name: string
  timestamp: Date
}

export interface UserVerifiedAgeEvent {
  userId: number
  age: number
  timestamp: Date
}

/**
 * Declare events for type safety
 */
declare module '@adonisjs/core/types' {
  interface EventsList {
    'vote:created': VoteCreatedEvent
    'vote:updated': VoteUpdatedEvent
    'user:registered': UserRegisteredEvent
    'user:age_verified': UserVerifiedAgeEvent
  }
}

export { emitter }
