import type { VoteCreatedEvent, VoteUpdatedEvent } from '#events/index'
import logger from '@adonisjs/core/services/logger'

export default class VoteListener {
  /**
   * Handle vote created event
   */
  async onVoteCreated(event: VoteCreatedEvent) {
    logger.info(`Vote created: User ${event.userId} voted "${event.choice}" on poll ${event.pollId}`)
    
    // Add your custom logic here:
    // - Send notification to poll owner
    // - Update vote statistics
    // - Trigger analytics
  }

  /**
   * Handle vote updated event
   */
  async onVoteUpdated(event: VoteUpdatedEvent) {
    logger.info(
      `Vote updated: User ${event.userId} changed vote from "${event.oldChoice}" to "${event.newChoice}" on poll ${event.pollId}`
    )
    
    // Add your custom logic here:
    // - Log vote change history
    // - Update statistics
  }
}
