import type { HttpContext } from '@adonisjs/core/http'
import { emitter } from '#events/index'

export default class VotesController {
  /**
   * Cast a vote (requires 18+ age verification)
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const { pollId, choice } = request.only(['pollId', 'choice'])

    // Your vote creation logic here
    // const vote = await Vote.create({ userId: user.id, pollId, choice })

    // Emit vote created event
    emitter.emit('vote:created', {
      userId: user.id,
      voteId: 1, // Replace with actual vote.id
      pollId,
      choice,
      timestamp: new Date(),
    })

    return response.created({
      message: 'Vote cast successfully',
      data: { pollId, choice },
    })
  }

  /**
   * Update a vote (requires 18+ age verification)
   */
  async update({ request, auth, params, response }: HttpContext) {
    const user = auth.user!
    const { choice } = request.only(['choice'])
    const voteId = params.id

    // Your vote update logic here
    // const vote = await Vote.findOrFail(voteId)
    // const oldChoice = vote.choice
    // vote.choice = choice
    // await vote.save()

    // Emit vote updated event
    emitter.emit('vote:updated', {
      userId: user.id,
      voteId: Number(voteId),
      pollId: 1, // Replace with actual vote.pollId
      oldChoice: 'previous_choice', // Replace with actual oldChoice
      newChoice: choice,
      timestamp: new Date(),
    })

    return response.ok({
      message: 'Vote updated successfully',
      data: { voteId, choice },
    })
  }
}
