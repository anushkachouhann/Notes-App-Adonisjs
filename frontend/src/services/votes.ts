import api from './api'

export interface Vote {
  id: number
  pollId: number
  choice: string
  createdAt: string
}

export interface Poll {
  id: number
  title: string
  description: string
  options: string[]
  endDate?: string
}

export interface AgeVerificationError {
  message: string
  code: 'BIRTHDATE_REQUIRED' | 'AGE_RESTRICTED'
  requiredAge?: number
  currentAge?: number
}

export const votesApi = {
  castVote: async (pollId: number, choice: string) => {
    const response = await api.post('/votes', { pollId, choice })
    return response.data
  },

  updateVote: async (voteId: number, choice: string) => {
    const response = await api.put(`/votes/${voteId}`, { choice })
    return response.data
  },

  updateBirthdate: async (birthdate: string) => {
    const response = await api.put('/auth/me', { birthdate })
    return response.data
  },
}

export default votesApi
