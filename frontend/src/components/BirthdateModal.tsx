import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeBirthdateModal, updateBirthdate } from '../store/votesSlice'
import type { AppDispatch, RootState } from '../store'

export default function BirthdateModal() {
  const dispatch = useDispatch<AppDispatch>()
  const { showBirthdateModal, ageError, loading } = useSelector((state: RootState) => state.votes)
  const { user } = useSelector((state: RootState) => state.auth)
  const [birthdate, setBirthdate] = useState('')

  const isEditing = !!user?.birthdate

  useEffect(() => {
    if (showBirthdateModal && user?.birthdate) {
      setBirthdate(user.birthdate)
    }
  }, [showBirthdateModal, user?.birthdate])

  if (!showBirthdateModal) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (birthdate) {
      await dispatch(updateBirthdate(birthdate))
    }
  }

  const handleClose = () => {
    dispatch(closeBirthdateModal())
    setBirthdate('')
  }

  // Calculate max date (must be 18+ years ago)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{isEditing ? '✏️ Update Birthdate' : '🔞 Age Verification'}</h3>

        {ageError?.code === 'AGE_RESTRICTED' ? (
          <div className="age-restricted-message">
            <p>You must be at least {ageError.requiredAge} years old to vote.</p>
            <p>Your current age: {ageError.currentAge} years</p>
            <button onClick={handleClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        ) : (
          <>
            <p>
              {isEditing
                ? 'Update your birthdate. Note: You must be 18 or older to vote.'
                : 'Please provide your birthdate to verify you are 18 or older to participate in voting.'}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="birthdate">Date of Birth</label>
                <input
                  type="date"
                  id="birthdate"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  max={maxDateStr}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={handleClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !birthdate}>
                  {loading ? 'Saving...' : isEditing ? 'Update' : 'Verify Age'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
