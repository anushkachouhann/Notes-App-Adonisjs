import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { castVote, clearError, openBirthdateModal } from '../store/votesSlice'
import type { AppDispatch, RootState } from '../store'
import BirthdateModal from './BirthdateModal'

// Sample polls for demonstration
const samplePolls = [
  {
    id: 1,
    title: 'Best Programming Language 2026',
    description: 'Vote for your favorite programming language',
    options: ['TypeScript', 'Python', 'Rust', 'Go'],
  },
  {
    id: 2,
    title: 'Preferred Development Environment',
    description: 'Which IDE/editor do you prefer?',
    options: ['VS Code', 'JetBrains', 'Neovim', 'Other'],
  },
]

function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export default function Voting() {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, ageError } = useSelector((state: RootState) => state.votes)
  const { user } = useSelector((state: RootState) => state.auth)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})
  const [votedPolls, setVotedPolls] = useState<number[]>([])

  const isVerified = user?.birthdate && calculateAge(user.birthdate) >= 18
  const userAge = user?.birthdate ? calculateAge(user.birthdate) : null

  const handleVote = async (pollId: number) => {
    const choice = selectedOptions[pollId]
    if (!choice) return

    dispatch(clearError())
    const result = await dispatch(castVote({ pollId, choice }))

    if (castVote.fulfilled.match(result)) {
      setVotedPolls((prev) => [...prev, pollId])
    }
  }

  const handleOptionChange = (pollId: number, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [pollId]: option }))
  }

  const handleVerifyClick = () => {
    dispatch(openBirthdateModal())
  }

  return (
    <div className="voting-container">
      <div className="voting-header">
        <div>
          <h2>🗳️ Voting (18+ Only)</h2>
          <p className="voting-subtitle">Age verification is required to participate</p>
        </div>
        <div className="verification-status">
          {isVerified ? (
            <div className="verified-badge">
              <span className="badge-icon">✓</span>
              <div className="badge-info">
                <span className="badge-text">Verified ({userAge} years)</span>
                <button className="edit-link" onClick={handleVerifyClick}>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-verify" onClick={handleVerifyClick}>
              🔞 Verify Age
            </button>
          )}
        </div>
      </div>

      {!isVerified && (
        <div className="voting-notice">
          Please verify your age to participate in voting. You must be 18 years or older.
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {ageError?.code === 'AGE_RESTRICTED' && (
        <div className="error-message">
          You must be at least {ageError.requiredAge} years old to vote.
        </div>
      )}

      <div className="polls-list">
        {samplePolls.map((poll) => (
          <div key={poll.id} className={`poll-card ${!isVerified ? 'poll-disabled' : ''}`}>
            <h3>{poll.title}</h3>
            <p>{poll.description}</p>

            {votedPolls.includes(poll.id) ? (
              <div className="vote-success">
                ✅ You voted for: <strong>{selectedOptions[poll.id]}</strong>
              </div>
            ) : (
              <>
                <div className="poll-options">
                  {poll.options.map((option) => (
                    <label key={option} className="poll-option">
                      <input
                        type="radio"
                        name={`poll-${poll.id}`}
                        value={option}
                        checked={selectedOptions[poll.id] === option}
                        onChange={() => handleOptionChange(poll.id, option)}
                        disabled={!isVerified}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => handleVote(poll.id)}
                  disabled={loading || !selectedOptions[poll.id] || !isVerified}
                  className="btn btn-primary vote-btn"
                >
                  {loading ? 'Submitting...' : 'Cast Vote'}
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <BirthdateModal />
    </div>
  )
}
